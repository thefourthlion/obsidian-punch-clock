import { App, Plugin, Notice, ItemView, WorkspaceLeaf, Modal, setIcon } from 'obsidian';

// ============ Data Types ============

interface Task {
	id: string;
	name: string;
	color: string;
	totalTime: number; // accumulated time in milliseconds
	createdAt: number;
}

interface TimeEntry {
	id: string;
	taskId: string;
	taskName: string;
	taskColor: string;
	startTime: number;
	endTime: number;
	duration: number; // in milliseconds
}

interface ActiveSession {
	taskId: string;
	startTime: number;
}

interface ClockInData {
	tasks: Task[];
	entries: TimeEntry[];
	activeSessions: ActiveSession[];
}

const DEFAULT_DATA: ClockInData = {
	tasks: [],
	entries: [],
	activeSessions: []
}

// Preset colors for tasks
const TASK_COLORS = [
	'#7c3aed', // violet
	'#2563eb', // blue
	'#0891b2', // cyan
	'#059669', // emerald
	'#65a30d', // lime
	'#ca8a04', // yellow
	'#ea580c', // orange
	'#dc2626', // red
	'#db2777', // pink
	'#9333ea', // purple
	'#6366f1', // indigo
	'#64748b', // slate
];

// ============ View Constants ============

const VIEW_TYPE_CLOCKIN = 'clockin-view';

// ============ Helper Functions ============

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	} else if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	} else {
		return `${seconds}s`;
	}
}

function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
}

// ============ Calendar Helper Functions ============

function getStartOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function getEndOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

function getStartOfWeek(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day; // Sunday = 0
	const start = new Date(d.setDate(diff));
	start.setHours(0, 0, 0, 0);
	return start;
}

function getEndOfWeek(date: Date): Date {
	const start = getStartOfWeek(date);
	const end = new Date(start);
	end.setDate(end.getDate() + 6);
	end.setHours(23, 59, 59, 999);
	return end;
}

function getStartOfMonth(date: Date): Date {
	const d = new Date(date);
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	return d;
}



function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});
}

function formatMonthYear(date: Date): string {
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long' 
	});
}

function formatYear(date: Date): string {
	return date.getFullYear().toString();
}

function getDaysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDaysInWeek(date: Date): Date[] {
	const start = getStartOfWeek(date);
	const days: Date[] = [];
	for (let i = 0; i < 7; i++) {
		const day = new Date(start);
		day.setDate(start.getDate() + i);
		days.push(day);
	}
	return days;
}

function getDaysInMonthArray(date: Date): Date[] {
	const start = getStartOfMonth(date);
	const days: Date[] = [];
	const daysInMonth = getDaysInMonth(date);
	for (let i = 0; i < daysInMonth; i++) {
		const day = new Date(start);
		day.setDate(start.getDate() + i);
		days.push(day);
	}
	return days;
}

function getMonthsInYear(date: Date): Date[] {
	const year = date.getFullYear();
	const months: Date[] = [];
	for (let i = 0; i < 12; i++) {
		months.push(new Date(year, i, 1));
	}
	return months;
}

interface DayData {
	date: Date;
	entries: TimeEntry[];
	totalTime: number;
	taskBreakdown: { [taskId: string]: number };
}


interface MonthData {
	date: Date;
	days: DayData[];
	totalTime: number;
	taskBreakdown: { [taskId: string]: number };
}


// ============ Color Picker Modal ============

class ColorPickerModal extends Modal {
	task: Task;
	plugin: ClockInPlugin;
	onSave: () => void;

	constructor(app: App, plugin: ClockInPlugin, task: Task, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.task = task;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('clockin-color-modal');

		contentEl.createEl('h3', { text: `Pick color for "${this.task.name}"` });

		const colorsGrid = contentEl.createDiv({ cls: 'clockin-colors-grid' });

		for (const color of TASK_COLORS) {
			const colorBtn = colorsGrid.createDiv({ 
				cls: `color-option ${this.task.color === color ? 'selected' : ''}` 
			});
			colorBtn.style.backgroundColor = color;
			
			colorBtn.addEventListener('click', () => {
				this.task.color = color;
				void this.plugin.saveData_();
				this.onSave();
				this.close();
			});
		}

		// Custom color input
		const customSection = contentEl.createDiv({ cls: 'clockin-custom-color' });
		customSection.createEl('label', { text: 'Custom color:' });
		
		const colorInput = customSection.createEl('input', {
			type: 'color',
			value: this.task.color,
			cls: 'clockin-color-input'
		});

		colorInput.addEventListener('change', (e) => {
			this.task.color = (e.target as HTMLInputElement).value;
			void this.plugin.saveData_();
			this.onSave();
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// ============ Edit Entry Modal ============

class EditEntryModal extends Modal {
	entry: TimeEntry;
	plugin: ClockInPlugin;
	onSave: () => void;

	constructor(app: App, plugin: ClockInPlugin, entry: TimeEntry, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.entry = entry;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('clockin-edit-modal');

		contentEl.createEl('h3', { text: 'Edit time entry' });

		// Task selection
		const taskSection = contentEl.createDiv({ cls: 'edit-entry-section' });
		taskSection.createEl('label', { text: 'Task:', attr: { for: 'edit-task-select' } });
		
		const taskSelect = taskSection.createEl('select', { 
			attr: { id: 'edit-task-select' },
			cls: 'edit-entry-select'
		});

		for (const task of this.plugin.data.tasks) {
			const option = taskSelect.createEl('option', { value: task.id, text: task.name });
			if (task.id === this.entry.taskId) {
				option.selected = true;
			}
		}

		// Duration input (in minutes)
		const durationSection = contentEl.createDiv({ cls: 'edit-entry-section' });
		durationSection.createEl('label', { text: 'Duration (minutes):', attr: { for: 'edit-duration-input' } });
		
		const durationMinutes = Math.floor(this.entry.duration / 60000);
		const durationInput = durationSection.createEl('input', {
			type: 'number',
			attr: { id: 'edit-duration-input', min: '0', step: '0.1' },
			cls: 'edit-entry-input',
			value: durationMinutes.toString()
		});

		// Start time display (read-only)
		const startTimeSection = contentEl.createDiv({ cls: 'edit-entry-section' });
		startTimeSection.createEl('label', { text: 'Start time:' });
		startTimeSection.createEl('div', { 
			text: formatTimestamp(this.entry.startTime),
			cls: 'edit-entry-readonly'
		});

		// Buttons
		const buttonSection = contentEl.createDiv({ cls: 'edit-entry-buttons' });
		
		const saveBtn = buttonSection.createEl('button', {
			text: 'Save',
			cls: 'edit-entry-save-btn'
		});

		const cancelBtn = buttonSection.createEl('button', {
			text: 'Cancel',
			cls: 'edit-entry-cancel-btn'
		});

		saveBtn.addEventListener('click', () => {
			const newTaskId = taskSelect.value;
			const newDurationMinutes = parseFloat(durationInput.value);
			
			if (isNaN(newDurationMinutes) || newDurationMinutes < 0) {
				new Notice('Please enter a valid duration');
				return;
			}

			const newDuration = Math.floor(newDurationMinutes * 60000);
			const newTask = this.plugin.data.tasks.find(t => t.id === newTaskId);
			
			if (!newTask) {
				new Notice('Please select a valid task');
				return;
			}

			// Update task totals
			const oldTask = this.plugin.data.tasks.find(t => t.id === this.entry.taskId);
			if (oldTask) {
				oldTask.totalTime -= this.entry.duration;
			}
			newTask.totalTime += newDuration;

			// Update entry
			this.entry.taskId = newTaskId;
			this.entry.taskName = newTask.name;
			this.entry.taskColor = newTask.color;
			this.entry.duration = newDuration;
			this.entry.endTime = this.entry.startTime + newDuration;

			void this.plugin.saveData_();
			this.onSave();
			this.close();
			new Notice('Entry updated!');
		});

		cancelBtn.addEventListener('click', () => {
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// ============ Clock In View ============

class ClockInView extends ItemView {
	plugin: ClockInPlugin;
	timerInterval: number | null = null;
	searchQuery: string = '';
	filterTaskId: string = '';
	viewMode: 'tasks' | 'calendar' = 'tasks';
	calendarMode: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';
	currentDate: Date = new Date();

	constructor(leaf: WorkspaceLeaf, plugin: ClockInPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_CLOCKIN;
	}

	getDisplayText(): string {
		return 'Time punch clock';
	}

	getIcon(): string {
		return 'clock';
	}

	async onOpen(): Promise<void> {
		await Promise.resolve();
		this.render();
		this.startTimerUpdate();
	}

	async onClose(): Promise<void> {
		await Promise.resolve();
		this.stopTimerUpdate();
	}

	startTimerUpdate() {
		this.timerInterval = window.setInterval(() => {
			this.updateTimerDisplays();
		}, 1000);
	}

	stopTimerUpdate() {
		if (this.timerInterval) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	updateTimerDisplays() {
		// Update all active task card timers
		for (const session of this.plugin.data.activeSessions) {
			const activeTask = this.plugin.data.tasks.find(t => t.id === session.taskId);
			if (activeTask) {
				const currentSession = Date.now() - session.startTime;
				const totalTime = activeTask.totalTime + currentSession;
				
				// Update task card
				const taskEl = this.containerEl.querySelector(`[data-task-id="${activeTask.id}"] .task-time`);
				if (taskEl) {
					taskEl.textContent = formatDuration(totalTime);
				}
			}
		}

		// Update active headers
		const activeHeaders = this.containerEl.querySelectorAll('.clockin-active-header');
		activeHeaders.forEach((header, index) => {
			if (index < this.plugin.data.activeSessions.length) {
				const session = this.plugin.data.activeSessions[index];
				const activeTask = this.plugin.data.tasks.find(t => t.id === session.taskId);
				if (activeTask) {
					const currentSession = Date.now() - session.startTime;
					const timeEl = header.querySelector('.active-header-time');
					if (timeEl) {
						timeEl.textContent = formatDuration(currentSession);
					}
				}
			}
		});
	}

	render() {
		const container = this.containerEl;
		container.empty();
		container.addClass('clockin-container');

		// Tabs for switching between Tasks and Calendar
		const tabsContainer = container.createDiv({ cls: 'clockin-tabs' });
		const tasksTab = tabsContainer.createDiv({ 
			cls: `clockin-tab ${this.viewMode === 'tasks' ? 'active' : ''}`,
			text: 'Tasks'
		});
		const calendarTab = tabsContainer.createDiv({ 
			cls: `clockin-tab ${this.viewMode === 'calendar' ? 'active' : ''}`,
			text: 'Calendar'
		});

		tasksTab.addEventListener('click', () => {
			this.viewMode = 'tasks';
			this.render();
		});

		calendarTab.addEventListener('click', () => {
			this.viewMode = 'calendar';
			this.render();
		});

		// Render based on view mode
		if (this.viewMode === 'tasks') {
			this.renderTasksView(container);
		} else {
			this.renderCalendarView(container);
		}
	}

	renderTasksView(container: HTMLElement) {
		// Active Task Headers (shows all active sessions)
		if (this.plugin.data.activeSessions.length > 0) {
			const activeHeadersContainer = container.createDiv({ cls: 'active-headers-container' });
			
			for (const session of this.plugin.data.activeSessions) {
				const activeTask = this.plugin.data.tasks.find(t => t.id === session.taskId);
				if (!activeTask) continue;
				
				const currentSession = Date.now() - session.startTime;
				
				const activeHeader = activeHeadersContainer.createDiv({ cls: 'clockin-active-header' });
				activeHeader.style.borderLeftColor = activeTask.color;
				
				const activeIcon = activeHeader.createDiv({ cls: 'active-header-icon' });
				setIcon(activeIcon, 'circle');
				activeIcon.setCssProps({ '--icon-color': activeTask.color });
				
				const activeInfo = activeHeader.createDiv({ cls: 'active-header-info' });
				activeInfo.createDiv({ cls: 'active-header-label', text: 'Currently tracking' });
				activeInfo.createDiv({ cls: 'active-header-task', text: activeTask.name });
				
				const activeTime = activeHeader.createDiv({ cls: 'active-header-time' });
				activeTime.textContent = formatDuration(currentSession);

				const stopBtn = activeHeader.createDiv({ cls: 'active-header-stop' });
				setIcon(stopBtn, 'square');
				stopBtn.addEventListener('click', () => {
					this.plugin.clockOut(session.taskId);
					this.render();
				});
			}
		}

		// Header
		const header = container.createDiv({ cls: 'clockin-header' });
		header.createEl('h2', { text: 'Tasks', cls: 'clockin-title' });

		// Create Task Section
		const createSection = container.createDiv({ cls: 'clockin-create-section' });
		
		const taskInput = createSection.createEl('input', {
			type: 'text',
			placeholder: 'Task name...',
			cls: 'clockin-task-input'
		});

		const createBtn = createSection.createEl('button', {
			text: 'Create task',
			cls: 'clockin-create-btn'
		});

		createBtn.addEventListener('click', () => {
			const name = taskInput.value.trim();
			if (name) {
				this.plugin.createTask(name);
				taskInput.value = '';
				this.render();
			}
		});

		taskInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				const name = taskInput.value.trim();
				if (name) {
					this.plugin.createTask(name);
					taskInput.value = '';
					this.render();
				}
			}
		});

		// Tasks Grid
		const tasksGrid = container.createDiv({ cls: 'clockin-tasks-grid' });

		for (const task of this.plugin.data.tasks) {
			const activeSession = this.plugin.data.activeSessions.find(s => s.taskId === task.id);
			const isActive = !!activeSession;
			let displayTime = task.totalTime;
			
			if (isActive && activeSession) {
				displayTime += Date.now() - activeSession.startTime;
			}

			const taskCard = tasksGrid.createDiv({ 
				cls: `clockin-task-card ${isActive ? 'active' : ''}`,
				attr: { 'data-task-id': task.id }
			});
			
			// Apply task color
			taskCard.style.borderColor = task.color;
			if (isActive) {
				taskCard.style.backgroundColor = task.color;
			}

			// Play/Stop Icon
			const playStopIcon = taskCard.createDiv({ cls: 'task-play-stop' });
			if (isActive) {
				// Stop icon (square)
				setIcon(playStopIcon, 'square');
			} else {
				// Play icon (triangle)
				setIcon(playStopIcon, 'play');
				playStopIcon.setCssProps({ '--icon-color': task.color });
			}

			const taskTime = taskCard.createDiv({ cls: 'task-time' });
			taskTime.textContent = formatDuration(displayTime);

			const taskName = taskCard.createDiv({ cls: 'task-name' });
			taskName.textContent = task.name;

			// Color indicator dot
			const colorDot = taskCard.createDiv({ cls: 'task-color-dot' });
			colorDot.style.backgroundColor = task.color;
			colorDot.addEventListener('click', (e) => {
				e.stopPropagation();
				new ColorPickerModal(this.app, this.plugin, task, () => this.render()).open();
			});

			// Delete button
			const deleteBtn = taskCard.createDiv({ cls: 'task-delete-btn' });
			deleteBtn.textContent = '×';
			deleteBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.plugin.deleteTask(task.id);
				this.render();
			});

			taskCard.addEventListener('click', () => {
				if (isActive) {
					this.plugin.clockOut(task.id);
				} else {
					this.plugin.clockIn(task.id);
				}
				this.render();
			});
		}

		// Divider
		container.createDiv({ cls: 'clockin-divider' });

		// Search and Filter Section
		const filterSection = container.createDiv({ cls: 'clockin-filter-section' });

		const searchInput = filterSection.createEl('input', {
			type: 'text',
			placeholder: 'Search entries...',
			cls: 'clockin-search-input',
			value: this.searchQuery
		});

		searchInput.addEventListener('input', (e) => {
			this.searchQuery = (e.target as HTMLInputElement).value;
			this.renderEntries(entriesContainer);
		});

		const filterSelect = filterSection.createEl('select', { cls: 'clockin-filter-select' });
		
		const allOption = filterSelect.createEl('option', { value: '', text: 'All tasks' });
		if (this.filterTaskId === '') allOption.selected = true;

		for (const task of this.plugin.data.tasks) {
			const option = filterSelect.createEl('option', { value: task.id, text: task.name });
			if (this.filterTaskId === task.id) option.selected = true;
		}

		filterSelect.addEventListener('change', (e) => {
			this.filterTaskId = (e.target as HTMLSelectElement).value;
			this.renderEntries(entriesContainer);
		});

		// Entries List
		const entriesContainer = container.createDiv({ cls: 'clockin-entries-container' });
		this.renderEntries(entriesContainer);
	}

	renderEntries(container: HTMLElement) {
		container.empty();

		let entries = [...this.plugin.data.entries].reverse(); // newest first

		// Apply filter
		if (this.filterTaskId) {
			entries = entries.filter(e => e.taskId === this.filterTaskId);
		}

		// Apply search
		if (this.searchQuery) {
			const query = this.searchQuery.toLowerCase();
			entries = entries.filter(e => 
				e.taskName.toLowerCase().includes(query) ||
				formatTimestamp(e.startTime).toLowerCase().includes(query)
			);
		}

		if (entries.length === 0) {
			const emptyMsg = container.createDiv({ cls: 'clockin-empty-msg' });
			emptyMsg.textContent = 'No time entries yet. Click a task to start tracking!';
			return;
		}

		for (const entry of entries) {
			const entryEl = container.createDiv({ cls: 'clockin-entry' });
			
			// Color indicator
			const colorBar = entryEl.createSpan({ cls: 'entry-color-bar' });
			colorBar.style.backgroundColor = entry.taskColor || '#7c3aed';
			
			const entryContent = entryEl.createDiv({ cls: 'entry-content' });
			
			const timestamp = entryContent.createSpan({ cls: 'entry-timestamp' });
			timestamp.textContent = formatTimestamp(entry.startTime);

			const taskName = entryContent.createSpan({ cls: 'entry-task' });
			taskName.textContent = entry.taskName;

			const duration = entryContent.createSpan({ cls: 'entry-duration' });
			duration.textContent = formatDuration(entry.duration);

			// Action buttons
			const entryActions = entryEl.createDiv({ cls: 'entry-actions' });
			
			const editBtn = entryActions.createDiv({ cls: 'entry-action-btn entry-edit-btn' });
			setIcon(editBtn, 'pencil');
			editBtn.setAttribute('title', 'Edit entry');
			editBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				new EditEntryModal(this.app, this.plugin, entry, () => {
					this.render();
				}).open();
			});

			const deleteBtn = entryActions.createDiv({ cls: 'entry-action-btn entry-delete-btn' });
			setIcon(deleteBtn, 'trash');
			deleteBtn.setAttribute('title', 'Delete entry');
			deleteBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.plugin.deleteEntry(entry.id);
				this.render();
			});
		}
	}

	// ============ Calendar View Rendering ============

	renderCalendarView(container: HTMLElement) {
		// Calendar mode selector
		const modeSelector = container.createDiv({ cls: 'calendar-mode-selector' });
		const modes = ['daily', 'weekly', 'monthly', 'yearly'] as const;
		
		for (const mode of modes) {
			const modeBtn = modeSelector.createDiv({ 
				cls: `calendar-mode-btn ${this.calendarMode === mode ? 'active' : ''}`,
				text: mode.charAt(0).toUpperCase() + mode.slice(1)
			});
			modeBtn.addEventListener('click', () => {
				this.calendarMode = mode;
				this.render();
			});
		}

		// Date navigation
		const navContainer = container.createDiv({ cls: 'calendar-nav' });
		
		const prevBtn = navContainer.createDiv({ cls: 'calendar-nav-btn', text: '←' });
		prevBtn.addEventListener('click', () => {
			this.navigateDate(-1);
			this.render();
		});

		const dateDisplay = navContainer.createDiv({ cls: 'calendar-date-display' });
		this.updateDateDisplay(dateDisplay);

		const nextBtn = navContainer.createDiv({ cls: 'calendar-nav-btn', text: '→' });
		nextBtn.addEventListener('click', () => {
			this.navigateDate(1);
			this.render();
		});

		const todayBtn = navContainer.createDiv({ cls: 'calendar-today-btn', text: 'Today' });
		todayBtn.addEventListener('click', () => {
			this.currentDate = new Date();
			this.render();
		});

		// Render calendar based on mode
		const calendarContent = container.createDiv({ cls: 'calendar-content' });
		
		switch (this.calendarMode) {
			case 'daily':
				this.renderDailyView(calendarContent);
				break;
			case 'weekly':
				this.renderWeeklyView(calendarContent);
				break;
			case 'monthly':
				this.renderMonthlyView(calendarContent);
				break;
			case 'yearly':
				this.renderYearlyView(calendarContent);
				break;
		}
	}

	navigateDate(direction: number) {
		const date = new Date(this.currentDate);
		
		switch (this.calendarMode) {
			case 'daily':
				date.setDate(date.getDate() + direction);
				break;
			case 'weekly':
				date.setDate(date.getDate() + (direction * 7));
				break;
			case 'monthly':
				date.setMonth(date.getMonth() + direction);
				break;
			case 'yearly':
				date.setFullYear(date.getFullYear() + direction);
				break;
		}
		
		this.currentDate = date;
	}

	updateDateDisplay(container: HTMLElement) {
		container.empty();
		let text = '';
		
		switch (this.calendarMode) {
			case 'daily':
				text = formatDate(this.currentDate);
				break;
			case 'weekly': {
				const weekStartDate = getStartOfWeek(this.currentDate);
				const weekEndDate = getEndOfWeek(this.currentDate);
				text = `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;
				break;
			}
			case 'monthly':
				text = formatMonthYear(this.currentDate);
				break;
			case 'yearly':
				text = formatYear(this.currentDate);
				break;
		}
		
		container.textContent = text;
	}

	getDayData(date: Date): DayData {
		const start = getStartOfDay(date);
		const end = getEndOfDay(date);
		
		const dayEntries = this.plugin.data.entries.filter(entry => {
			const entryDate = new Date(entry.startTime);
			return entryDate >= start && entryDate <= end;
		});

		const taskBreakdown: { [taskId: string]: number } = {};
		let totalTime = 0;

		for (const entry of dayEntries) {
			if (!taskBreakdown[entry.taskId]) {
				taskBreakdown[entry.taskId] = 0;
			}
			taskBreakdown[entry.taskId] += entry.duration;
			totalTime += entry.duration;
		}

		return {
			date: new Date(date),
			entries: dayEntries,
			totalTime,
			taskBreakdown
		};
	}

	renderDailyView(container: HTMLElement) {
		const dayData = this.getDayData(this.currentDate);
		
		// Summary card
		const summaryCard = container.createDiv({ cls: 'calendar-summary-card' });
		summaryCard.createEl('h3', { text: 'Daily summary', cls: 'summary-title' });
		
		const totalTimeEl = summaryCard.createDiv({ cls: 'summary-total' });
		totalTimeEl.createSpan({ cls: 'summary-label', text: 'Total time:' });
		totalTimeEl.createSpan({ cls: 'summary-value', text: formatDuration(dayData.totalTime) });

		// Task breakdown
		if (dayData.totalTime > 0) {
			const breakdown = summaryCard.createDiv({ cls: 'summary-breakdown' });
			breakdown.createEl('h4', { text: 'By task', cls: 'breakdown-title' });
			
			const taskList = breakdown.createDiv({ cls: 'breakdown-list' });
			
			for (const [taskId, time] of Object.entries(dayData.taskBreakdown)) {
				const task = this.plugin.data.tasks.find(t => t.id === taskId);
				if (!task) continue;
				
				const percentage = (time / dayData.totalTime) * 100;
				const item = taskList.createDiv({ cls: 'breakdown-item' });
				
				const colorBar = item.createDiv({ cls: 'breakdown-color-bar' });
				colorBar.style.backgroundColor = task.color;
				colorBar.style.width = `${percentage}%`;
				
				const itemInfo = item.createDiv({ cls: 'breakdown-info' });
				itemInfo.createSpan({ cls: 'breakdown-task', text: task.name });
				itemInfo.createSpan({ cls: 'breakdown-time', text: formatDuration(time) });
				itemInfo.createSpan({ cls: 'breakdown-percent', text: `${percentage.toFixed(1)}%` });
			}
		} else {
			summaryCard.createDiv({ cls: 'calendar-empty', text: 'No time tracked on this day' });
		}

		// Timeline view
		if (dayData.entries.length > 0) {
			const timelineCard = container.createDiv({ cls: 'calendar-timeline-card' });
			timelineCard.createEl('h3', { text: 'Timeline', cls: 'summary-title' });
			
			const timeline = timelineCard.createDiv({ cls: 'timeline-container' });
			
			// Create 24-hour timeline
			for (let hour = 0; hour < 24; hour++) {
				const hourBlock = timeline.createDiv({ cls: 'timeline-hour' });
				hourBlock.createDiv({ cls: 'timeline-hour-label', text: `${hour.toString().padStart(2, '0')}:00` });
				
				const hourBar = hourBlock.createDiv({ cls: 'timeline-hour-bar' });
				
				// Find entries in this hour
				const hourEntries = dayData.entries.filter(entry => {
					const entryHour = new Date(entry.startTime).getHours();
					return entryHour === hour;
				});
				
				if (hourEntries.length > 0) {
					for (const entry of hourEntries) {
						const task = this.plugin.data.tasks.find(t => t.id === entry.taskId);
						if (!task) continue;
						
						const entryBlock = hourBar.createDiv({ cls: 'timeline-entry' });
						entryBlock.setCssProps({ '--entry-color': task.color });
						entryBlock.setAttribute('title', `${task.name}: ${formatDuration(entry.duration)}`);
					}
				}
			}
		}
	}

	renderWeeklyView(container: HTMLElement) {
		const days = getDaysInWeek(this.currentDate);
		
		// Summary
		let weekTotal = 0;
		const weekTaskBreakdown: { [taskId: string]: number } = {};
		const weekDays: DayData[] = [];
		
		for (const day of days) {
			const dayData = this.getDayData(day);
			weekDays.push(dayData);
			weekTotal += dayData.totalTime;
			
			for (const [taskId, time] of Object.entries(dayData.taskBreakdown)) {
				if (!weekTaskBreakdown[taskId]) {
					weekTaskBreakdown[taskId] = 0;
				}
				weekTaskBreakdown[taskId] += time;
			}
		}

		const summaryCard = container.createDiv({ cls: 'calendar-summary-card' });
		summaryCard.createEl('h3', { text: 'Weekly summary', cls: 'summary-title' });
		
		const totalTimeEl = summaryCard.createDiv({ cls: 'summary-total' });
		totalTimeEl.createSpan({ cls: 'summary-label', text: 'Total time:' });
		totalTimeEl.createSpan({ cls: 'summary-value', text: formatDuration(weekTotal) });

		// Navigation controls for week grid
		const weekNavContainer = container.createDiv({ cls: 'week-nav-container' });
		const scrollLeftBtn = weekNavContainer.createDiv({ cls: 'week-nav-btn', text: '←' });
		const scrollRightBtn = weekNavContainer.createDiv({ cls: 'week-nav-btn', text: '→' });

		// Week grid with scrollable wrapper
		const weekGridWrapper = container.createDiv({ cls: 'calendar-week-grid-wrapper' });
		const weekGrid = weekGridWrapper.createDiv({ cls: 'calendar-week-grid' });

		// Scroll navigation handlers
		scrollLeftBtn.addEventListener('click', () => {
			const cardWidth = weekGrid.querySelector('.calendar-day-card')?.clientWidth || 140;
			const scrollAmount = cardWidth * 4 + 12 * 3; // 4 cards + 3 gaps
			weekGridWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
		});

		scrollRightBtn.addEventListener('click', () => {
			const cardWidth = weekGrid.querySelector('.calendar-day-card')?.clientWidth || 140;
			const scrollAmount = cardWidth * 4 + 12 * 3; // 4 cards + 3 gaps
			weekGridWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		});

		// Auto-scroll to show current day
		setTimeout(() => {
			const todayIndex = days.findIndex(d => d.toDateString() === new Date().toDateString());
			if (todayIndex >= 0) {
				const cardWidth = weekGrid.querySelector('.calendar-day-card')?.clientWidth || 140;
				const scrollPosition = (cardWidth + 12) * todayIndex - weekGridWrapper.clientWidth / 2 + cardWidth / 2;
				weekGridWrapper.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
			}
		}, 100);
		
		for (let i = 0; i < days.length; i++) {
			const day = days[i];
			const dayData = weekDays[i];
			const isToday = day.toDateString() === new Date().toDateString();
			
			const dayCard = weekGrid.createDiv({ cls: `calendar-day-card ${isToday ? 'today' : ''}` });
			
			const dayHeader = dayCard.createDiv({ cls: 'day-card-header' });
			dayHeader.createDiv({ cls: 'day-card-name', text: day.toLocaleDateString('en-US', { weekday: 'short' }) });
			dayHeader.createDiv({ cls: 'day-card-date', text: day.getDate().toString() });
			
			const dayTotal = dayCard.createDiv({ cls: 'day-card-total' });
			dayTotal.textContent = formatDuration(dayData.totalTime);
			
			if (dayData.totalTime > 0) {
				const dayBreakdown = dayCard.createDiv({ cls: 'day-card-breakdown' });
				const maxTime = Math.max(...Object.values(dayData.taskBreakdown));
				
				// Sort tasks by time (descending) to show most time first
				const sortedTasks = Object.entries(dayData.taskBreakdown)
					.sort((a, b) => b[1] - a[1]);
				
				for (const [taskId, time] of sortedTasks) {
					const task = this.plugin.data.tasks.find(t => t.id === taskId);
					if (!task) continue;
					
					const taskItem = dayBreakdown.createDiv({ cls: 'day-breakdown-item' });
					
					const bar = taskItem.createDiv({ cls: 'day-breakdown-bar' });
					const height = maxTime > 0 ? (time / maxTime) * 100 : 0;
					bar.style.height = `${height}%`;
					bar.style.backgroundColor = task.color;
					
					const taskLabel = taskItem.createDiv({ cls: 'day-breakdown-label' });
					taskLabel.textContent = task.name;
					taskLabel.style.color = task.color;
					taskLabel.setAttribute('title', `${task.name}: ${formatDuration(time)}`);
				}
			}
		}
	}

	renderMonthlyView(container: HTMLElement) {
		const monthStart = getStartOfMonth(this.currentDate);
		const days = getDaysInMonthArray(this.currentDate);
		
		// Summary
		let monthTotal = 0;
		const monthTaskBreakdown: { [taskId: string]: number } = {};
		
		for (const day of days) {
			const dayData = this.getDayData(day);
			monthTotal += dayData.totalTime;
			
			for (const [taskId, time] of Object.entries(dayData.taskBreakdown)) {
				if (!monthTaskBreakdown[taskId]) {
					monthTaskBreakdown[taskId] = 0;
				}
				monthTaskBreakdown[taskId] += time;
			}
		}

		const summaryCard = container.createDiv({ cls: 'calendar-summary-card' });
		summaryCard.createEl('h3', { text: 'Monthly summary', cls: 'summary-title' });
		
		const totalTimeEl = summaryCard.createDiv({ cls: 'summary-total' });
		totalTimeEl.createSpan({ cls: 'summary-label', text: 'Total time:' });
		totalTimeEl.createSpan({ cls: 'summary-value', text: formatDuration(monthTotal) });

		// Task breakdown chart
		if (monthTotal > 0) {
			const chartCard = container.createDiv({ cls: 'calendar-chart-card' });
			chartCard.createEl('h4', { text: 'Task distribution', cls: 'chart-title' });
			
			const chartContainer = chartCard.createDiv({ cls: 'chart-container' });
			
			for (const [taskId, time] of Object.entries(monthTaskBreakdown)) {
				const task = this.plugin.data.tasks.find(t => t.id === taskId);
				if (!task) continue;
				
				const percentage = (time / monthTotal) * 100;
				const chartItem = chartContainer.createDiv({ cls: 'chart-item' });
				
				const chartBar = chartItem.createDiv({ cls: 'chart-bar' });
				chartBar.style.width = `${percentage}%`;
				chartBar.style.backgroundColor = task.color;
				
				const chartInfo = chartItem.createDiv({ cls: 'chart-info' });
				chartInfo.createSpan({ cls: 'chart-task', text: task.name });
				chartInfo.createSpan({ cls: 'chart-time', text: formatDuration(time) });
				chartInfo.createSpan({ cls: 'chart-percent', text: `${percentage.toFixed(1)}%` });
			}
		}

		// Calendar grid
		const calendarGrid = container.createDiv({ cls: 'calendar-month-grid' });
		
		// Day headers
		const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		for (const header of dayHeaders) {
			calendarGrid.createDiv({ cls: 'calendar-day-header', text: header });
		}
		
		// Fill empty cells for days before month starts
		const firstDay = monthStart.getDay();
		for (let i = 0; i < firstDay; i++) {
			calendarGrid.createDiv({ cls: 'calendar-day-empty' });
		}
		
		// Days of month
		for (const day of days) {
			const dayData = this.getDayData(day);
			const isToday = day.toDateString() === new Date().toDateString();
			
			const dayCell = calendarGrid.createDiv({ cls: `calendar-day-cell ${isToday ? 'today' : ''} ${dayData.totalTime > 0 ? 'has-data' : ''}` });
			dayCell.createDiv({ cls: 'day-cell-number', text: day.getDate().toString() });
			
			if (dayData.totalTime > 0) {
				const dayTotal = dayCell.createDiv({ cls: 'day-cell-total' });
				dayTotal.textContent = formatDuration(dayData.totalTime);
				
				// Task labels
				const taskLabels = dayCell.createDiv({ cls: 'day-cell-tasks' });
				const sortedTasks = Object.entries(dayData.taskBreakdown)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3); // Show top 3 tasks
				
				for (const [taskId, time] of sortedTasks) {
					const task = this.plugin.data.tasks.find(t => t.id === taskId);
					if (!task) continue;
					
					const taskLabel = taskLabels.createDiv({ cls: 'day-cell-task-label' });
					taskLabel.textContent = task.name;
					taskLabel.style.color = task.color;
					taskLabel.setAttribute('title', `${task.name}: ${formatDuration(time)}`);
				}
				
				// Color indicator
				const colors = Object.keys(dayData.taskBreakdown).map(taskId => {
					const task = this.plugin.data.tasks.find(t => t.id === taskId);
					return task ? task.color : '#ccc';
				});
				
				if (colors.length > 0) {
					const colorIndicator = dayCell.createDiv({ cls: 'day-cell-indicator' });
					if (colors.length === 1) {
						colorIndicator.setCssProps({ '--indicator-bg': colors[0] });
					} else {
						// Gradient for multiple tasks
						colorIndicator.setCssProps({ '--indicator-bg': `linear-gradient(90deg, ${colors.join(', ')})` });
					}
				}
			}
		}
	}

	renderYearlyView(container: HTMLElement) {
		const months = getMonthsInYear(this.currentDate);
		
		// Summary
		let yearTotal = 0;
		const yearTaskBreakdown: { [taskId: string]: number } = {};
		const monthData: MonthData[] = [];
		
		for (const month of months) {
			const days = getDaysInMonthArray(month);
			
			let monthTotal = 0;
			const monthTaskBreak: { [taskId: string]: number } = {};
			
			for (const day of days) {
				const dayData = this.getDayData(day);
				monthTotal += dayData.totalTime;
				
				for (const [taskId, time] of Object.entries(dayData.taskBreakdown)) {
					if (!monthTaskBreak[taskId]) {
						monthTaskBreak[taskId] = 0;
					}
					monthTaskBreak[taskId] += time;
					
					if (!yearTaskBreakdown[taskId]) {
						yearTaskBreakdown[taskId] = 0;
					}
					yearTaskBreakdown[taskId] += time;
				}
			}
			
			monthData.push({
				date: month,
				days: days.map(d => this.getDayData(d)),
				totalTime: monthTotal,
				taskBreakdown: monthTaskBreak
			});
			
			yearTotal += monthTotal;
		}

		const summaryCard = container.createDiv({ cls: 'calendar-summary-card' });
		summaryCard.createEl('h3', { text: 'Yearly summary', cls: 'summary-title' });
		
		const totalTimeEl = summaryCard.createDiv({ cls: 'summary-total' });
		totalTimeEl.createSpan({ cls: 'summary-label', text: 'Total time:' });
		totalTimeEl.createSpan({ cls: 'summary-value', text: formatDuration(yearTotal) });

		// Year overview chart
		if (yearTotal > 0) {
			const chartCard = container.createDiv({ cls: 'calendar-chart-card' });
			chartCard.createEl('h4', { text: 'Monthly overview', cls: 'chart-title' });
			
			const chartContainer = chartCard.createDiv({ cls: 'chart-container chart-bars' });
			const maxMonth = Math.max(...monthData.map(m => m.totalTime));
			
			for (const month of monthData) {
				const chartItem = chartContainer.createDiv({ cls: 'chart-item chart-item-vertical' });
				
				const chartBar = chartItem.createDiv({ cls: 'chart-bar-vertical' });
				const height = maxMonth > 0 ? (month.totalTime / maxMonth) * 100 : 0;
				chartBar.style.height = `${height}%`;
				chartBar.addClass('chart-bar-gradient');
				
				const chartInfo = chartItem.createDiv({ cls: 'chart-info-vertical' });
				chartInfo.createSpan({ cls: 'chart-month', text: month.date.toLocaleDateString('en-US', { month: 'short' }) });
				chartInfo.createSpan({ cls: 'chart-time', text: formatDuration(month.totalTime) });
			}
		}

		// Task breakdown
		if (yearTotal > 0) {
			const taskCard = container.createDiv({ cls: 'calendar-chart-card' });
			taskCard.createEl('h4', { text: 'Task distribution', cls: 'chart-title' });
			
			const taskContainer = taskCard.createDiv({ cls: 'chart-container' });
			
			for (const [taskId, time] of Object.entries(yearTaskBreakdown)) {
				const task = this.plugin.data.tasks.find(t => t.id === taskId);
				if (!task) continue;
				
				const percentage = (time / yearTotal) * 100;
				const chartItem = taskContainer.createDiv({ cls: 'chart-item' });
				
				const chartBar = chartItem.createDiv({ cls: 'chart-bar' });
				chartBar.style.width = `${percentage}%`;
				chartBar.style.backgroundColor = task.color;
				
				const chartInfo = chartItem.createDiv({ cls: 'chart-info' });
				chartInfo.createSpan({ cls: 'chart-task', text: task.name });
				chartInfo.createSpan({ cls: 'chart-time', text: formatDuration(time) });
				chartInfo.createSpan({ cls: 'chart-percent', text: `${percentage.toFixed(1)}%` });
			}
		}
	}
}

// ============ Main Plugin ============

export default class ClockInPlugin extends Plugin {
	data: ClockInData;

	async onload() {
		await this.loadData_();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_CLOCKIN,
			(leaf) => new ClockInView(leaf, this)
		);

		// Add ribbon icon to open the view
		this.addRibbonIcon('clock', 'Open time punch clock', () => {
			void this.activateView();
		});

		// Add command to open view
		this.addCommand({
			id: 'open-clockin-view',
			name: 'Open panel',
			callback: () => {
				void this.activateView();
			}
		});

		// Add command to quick clock in/out
		this.addCommand({
			id: 'quick-clock-toggle',
			name: 'Quick punch in/out (last task)',
			callback: () => {
				if (this.data.activeSessions.length > 0) {
					// Clock out the most recent session
					const lastSession = this.data.activeSessions[this.data.activeSessions.length - 1];
					this.clockOut(lastSession.taskId);
					new Notice('Clocked out!');
				} else if (this.data.tasks.length > 0) {
					// Clock into the most recently used task
					const lastEntry = this.data.entries[this.data.entries.length - 1];
					const taskId = lastEntry ? lastEntry.taskId : this.data.tasks[0].id;
					const task = this.data.tasks.find(t => t.id === taskId);
					if (task) {
						this.clockIn(taskId);
						new Notice(`Clocked in: ${task.name}`);
					}
				} else {
					new Notice('No tasks created yet. Open clock in panel to create tasks.');
				}
				this.refreshViews();
			}
		});

		// Add status bar item
		const statusBarItem = this.addStatusBarItem();
		statusBarItem.addClass('clockin-status-bar');
		
		// Update status bar every second
		this.registerInterval(
			window.setInterval(() => {
				this.updateStatusBar(statusBarItem);
			}, 1000)
		);

		console.debug('Time Punch Clock plugin loaded!');
	}

	onunload(): void {
		console.debug('Time Punch Clock plugin unloaded!');
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CLOCKIN);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_CLOCKIN, active: true });
			}
		}

		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}

	refreshViews() {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CLOCKIN);
		for (const leaf of leaves) {
			if (leaf.view instanceof ClockInView) {
				leaf.view.render();
			}
		}
	}

	updateStatusBar(statusBarItem: HTMLElement) {
		if (this.data.activeSessions.length > 0) {
			// Show all active sessions
			const sessionTexts = this.data.activeSessions.map(session => {
				const task = this.data.tasks.find(t => t.id === session.taskId);
				if (!task) return '';
				const currentSession = Date.now() - session.startTime;
				return `${task.name}: ${formatDuration(currentSession)}`;
			}).filter(t => t).join(' | ');
			
			statusBarItem.textContent = `⏱ ${sessionTexts}`;
			statusBarItem.addClass('active');
		} else {
			statusBarItem.textContent = '⏱ Not clocked in';
			statusBarItem.removeClass('active');
		}
	}

	// ============ Task Management ============

	createTask(name: string): Task {
		// Pick a random color from presets
		const color = TASK_COLORS[this.data.tasks.length % TASK_COLORS.length];
		
		const task: Task = {
			id: generateId(),
			name: name,
			color: color,
			totalTime: 0,
			createdAt: Date.now()
		};
		this.data.tasks.push(task);
		void this.saveData_();
		new Notice(`Task "${name}" created!`);
		return task;
	}

	deleteTask(taskId: string) {
		// If this task is active, clock out first
		const activeSession = this.data.activeSessions.find(s => s.taskId === taskId);
		if (activeSession) {
			this.clockOut(taskId);
		}
		
		const task = this.data.tasks.find(t => t.id === taskId);
		this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
		// Keep entries for historical purposes
		void this.saveData_();
		if (task) {
			new Notice(`Task "${task.name}" deleted!`);
		}
	}

	// ============ Clock In/Out ============

	clockIn(taskId: string) {
		// Check if already clocked into this task
		const existingSession = this.data.activeSessions.find(s => s.taskId === taskId);
		if (existingSession) {
			new Notice(`Already clocked into this task!`);
			return;
		}

		const task = this.data.tasks.find(t => t.id === taskId);
		if (!task) return;

		// Add new active session
		this.data.activeSessions.push({
			taskId: taskId,
			startTime: Date.now()
		});
		void this.saveData_();
		
		new Notice(`Started: ${task.name}`);
	}

	clockOut(taskId?: string) {
		// If taskId provided, clock out that specific task
		// Otherwise, clock out the first active session (for backwards compatibility)
		let sessionToStop: ActiveSession | undefined;
		
		if (taskId) {
			const index = this.data.activeSessions.findIndex(s => s.taskId === taskId);
			if (index === -1) return;
			sessionToStop = this.data.activeSessions[index];
			this.data.activeSessions.splice(index, 1);
		} else if (this.data.activeSessions.length > 0) {
			// Clock out the first one if no taskId specified
			sessionToStop = this.data.activeSessions[0];
			this.data.activeSessions.shift();
		}

		if (!sessionToStop) return;

		const stoppedSession = sessionToStop;
		const task = this.data.tasks.find(t => t.id === stoppedSession.taskId);
		if (!task) return;

		const endTime = Date.now();
		const duration = endTime - stoppedSession.startTime;

		// Create time entry
		const entry: TimeEntry = {
			id: generateId(),
			taskId: task.id,
			taskName: task.name,
			taskColor: task.color,
			startTime: stoppedSession.startTime,
			endTime: endTime,
			duration: duration
		};
		this.data.entries.push(entry);

		// Update task total time
		task.totalTime += duration;

		void this.saveData_();
		new Notice(`Stopped: ${task.name} (+${formatDuration(duration)})`);
	}

	// ============ Entry Management ============

	deleteEntry(entryId: string) {
		const entry = this.data.entries.find(e => e.id === entryId);
		if (!entry) return;

		// Remove the entry's time from the task's total
		const task = this.data.tasks.find(t => t.id === entry.taskId);
		if (task) {
			task.totalTime -= entry.duration;
			// Ensure total time doesn't go negative
			if (task.totalTime < 0) {
				task.totalTime = 0;
			}
		}

		// Remove the entry
		this.data.entries = this.data.entries.filter(e => e.id !== entryId);
		void this.saveData_();
		new Notice('Entry deleted!');
		this.refreshViews();
	}

	// ============ Data Persistence ============

	async loadData_() {
		const loaded = await this.loadData();
		this.data = Object.assign({}, DEFAULT_DATA, loaded);
		
		// Migrate old tasks without colors
		for (const task of this.data.tasks) {
			if (!task.color) {
				task.color = TASK_COLORS[this.data.tasks.indexOf(task) % TASK_COLORS.length];
			}
		}
	}

	async saveData_() {
		await this.saveData(this.data);
	}
}
