<template>
    <div class="todo-widget">
        <div class="todo-header">
            <h2 class="title">📝 {{ i18n.title }}</h2>
            <span class="task-count">{{ i18n.tasksCount.replace('{count}', pendingTasks.length) }}</span>
        </div>

        <!-- Add task form -->
        <form @submit.prevent="addTask" class="todo-form">
            <div class="form-row">
                <input v-model="newTask" type="text" :placeholder="i18n.placeholder" class="task-input" />
                <button type="submit" class="btn-add">{{ i18n.add }}</button>
            </div>
            <div class="form-options">
                <select v-model="newPriority" class="select-sm">
                    <option value="">{{ i18n.priorityNone }}</option>
                    <option value="high">{{ i18n.priorityHigh }}</option>
                    <option value="medium">{{ i18n.priorityMedium }}</option>
                    <option value="low">{{ i18n.priorityLow }}</option>
                </select>
                <input v-model="newDueDate" type="date" class="date-input" />
                <select v-model="newCategory" class="select-sm">
                    <option value="">{{ i18n.category }}</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    <option value="__new__">+ {{ i18n.newCategory }}</option>
                </select>
            </div>
        </form>

        <!-- Filters & Sort bar -->
        <div class="toolbar" v-if="pendingTasks.length > 0 || completedTasks.length > 0">
            <div class="filter-group">
                <select v-model="filterCategory" class="select-sm">
                    <option value="">{{ i18n.allCategories }}</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <select v-model="sortMode" class="select-sm">
                    <option value="manual">{{ i18n.sortBy }}</option>
                    <option value="priority">{{ i18n.sortPriority }}</option>
                    <option value="date">{{ i18n.sortDate }}</option>
                    <option value="alpha">{{ i18n.sortAlpha }}</option>
                </select>
            </div>
        </div>

        <!-- Pending tasks -->
        <div class="task-section">
            <h3>{{ i18n.pending }}</h3>
            <div v-if="filteredPending.length === 0" class="empty">{{ i18n.emptyPending }}</div>
            <ul ref="pendingList">
                <li
                    v-for="(task, index) in filteredPending"
                    :key="task.id"
                    class="task-item"
                    :class="{ 'dragging': dragIndex === index }"
                    :draggable="sortMode === 'manual'"
                    @dragstart="onDragStart(index, $event)"
                    @dragover.prevent="onDragOver(index, $event)"
                    @dragend="onDragEnd"
                    @drop.prevent="onDrop(index)"
                >
                    <div class="task-left">
                        <button class="btn-check" @click="completeTask(task.id)">
                            <span class="check-circle"></span>
                        </button>
                        <div class="task-content">
                            <div class="task-text-row">
                                <span v-if="task.priority" class="priority-dot" :class="'p-' + task.priority" :title="priorityLabel(task.priority)"></span>
                                <span class="task-text">{{ task.text }}</span>
                            </div>
                            <div class="task-meta">
                                <span v-if="task.category" class="tag">{{ task.category }}</span>
                                <span v-if="task.dueDate" class="due" :class="dueClass(task.dueDate)">{{ dueLabel(task.dueDate) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button @click="editTask(task.id)" :title="i18n.editTask">✏️</button>
                        <button @click="deleteTask(task.id)">🗑️</button>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Completed tasks -->
        <div class="task-section completed-section">
            <div class="section-header">
                <h3>{{ i18n.completed }}</h3>
                <button v-if="completedTasks.length > 0" class="btn-clear" @click="clearCompleted">{{ i18n.clearCompleted }}</button>
            </div>
            <div v-if="completedTasks.length === 0" class="empty">{{ i18n.emptyCompleted }}</div>
            <ul>
                <li v-for="task in completedTasks" :key="task.id" class="task-item completed-item">
                    <div class="task-left">
                        <button class="btn-check checked" @click="uncompleteTask(task.id)">
                            <span class="check-circle">✓</span>
                        </button>
                        <div class="task-content">
                            <span class="task-text done">{{ task.text }}</span>
                            <div class="task-meta">
                                <span v-if="task.category" class="tag">{{ task.category }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button @click="deleteCompleted(task.id)">❌</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { getWidgetLocale } from '../i18n/widget-locales'

export default {
    name: 'ZTodoWidget',
    props: {
        useStorage: {
            type: Boolean,
            default: true
        },
        locale: {
            type: String,
            default: 'es'
        }
    },
    data() {
        return {
            newTask: '',
            newPriority: '',
            newDueDate: '',
            newCategory: '',
            pendingTasks: [],
            completedTasks: [],
            categories: [],
            filterCategory: '',
            sortMode: 'manual',
            dragIndex: null,
            dragOverIndex: null,
            nextId: 1
        }
    },
    computed: {
        i18n() {
            return getWidgetLocale('todo', this.locale);
        },
        filteredPending() {
            let tasks = [...this.pendingTasks];
            if (this.filterCategory) {
                tasks = tasks.filter(t => t.category === this.filterCategory);
            }
            if (this.sortMode === 'priority') {
                const order = { high: 0, medium: 1, low: 2, '': 3 };
                tasks.sort((a, b) => (order[a.priority || ''] ?? 3) - (order[b.priority || ''] ?? 3));
            } else if (this.sortMode === 'date') {
                tasks.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                });
            } else if (this.sortMode === 'alpha') {
                tasks.sort((a, b) => a.text.localeCompare(b.text));
            }
            return tasks;
        }
    },
    watch: {
        newCategory(val) {
            if (val === '__new__') {
                this.newCategory = '';
                this.addNewCategory();
            }
        }
    },
    mounted() {
        this.loadFromStorage();
    },
    methods: {
        generateId() {
            return this.nextId++;
        },
        addTask() {
            if (!this.newTask.trim()) return;
            this.pendingTasks.push({
                id: this.generateId(),
                text: this.newTask.trim(),
                priority: this.newPriority,
                dueDate: this.newDueDate,
                category: this.newCategory,
                createdAt: new Date().toISOString()
            });
            this.newTask = '';
            this.newPriority = '';
            this.newDueDate = '';
            this.newCategory = '';
            this.saveToStorage();
        },
        async addNewCategory() {
            if (!window.ZenModals) return;
            const name = await window.ZenModals.showPrompt({
                title: this.i18n.category,
                message: this.i18n.newCategoryPrompt,
                inputPlaceholder: this.i18n.newCategory
            });
            if (name && name.trim()) {
                const trimmed = name.trim();
                if (!this.categories.includes(trimmed)) {
                    this.categories.push(trimmed);
                    this.saveToStorage();
                }
                this.newCategory = trimmed;
            }
        },
        completeTask(id) {
            const idx = this.pendingTasks.findIndex(t => t.id === id);
            if (idx === -1) return;
            const task = this.pendingTasks.splice(idx, 1)[0];
            task.completedAt = new Date().toISOString();
            this.completedTasks.unshift(task);
            this.saveToStorage();
        },
        uncompleteTask(id) {
            const idx = this.completedTasks.findIndex(t => t.id === id);
            if (idx === -1) return;
            const task = this.completedTasks.splice(idx, 1)[0];
            delete task.completedAt;
            this.pendingTasks.push(task);
            this.saveToStorage();
        },
        deleteTask(id) {
            this.pendingTasks = this.pendingTasks.filter(t => t.id !== id);
            this.saveToStorage();
        },
        deleteCompleted(id) {
            this.completedTasks = this.completedTasks.filter(t => t.id !== id);
            this.saveToStorage();
        },
        clearCompleted() {
            this.completedTasks = [];
            this.saveToStorage();
        },
        async editTask(id) {
            const task = this.pendingTasks.find(t => t.id === id);
            if (!task || !window.ZenModals) return;
            const newText = await window.ZenModals.showPrompt({
                title: this.i18n.editTask,
                message: '',
                inputDefaultValue: task.text,
                inputPlaceholder: this.i18n.placeholder
            });
            if (newText && newText.trim()) {
                task.text = newText.trim();
                this.saveToStorage();
            }
        },
        priorityLabel(p) {
            const map = { high: this.i18n.priorityHigh, medium: this.i18n.priorityMedium, low: this.i18n.priorityLow };
            return map[p] || '';
        },
        dueLabel(dateStr) {
            const today = new Date(); today.setHours(0,0,0,0);
            const due = new Date(dateStr + 'T00:00:00'); 
            const diff = Math.round((due - today) / 86400000);
            if (diff < 0) return this.i18n.overdue;
            if (diff === 0) return this.i18n.dueToday;
            if (diff === 1) return this.i18n.dueTomorrow;
            return due.toLocaleDateString(this.locale, { month: 'short', day: 'numeric' });
        },
        dueClass(dateStr) {
            const today = new Date(); today.setHours(0,0,0,0);
            const due = new Date(dateStr + 'T00:00:00');
            const diff = Math.round((due - today) / 86400000);
            if (diff < 0) return 'overdue';
            if (diff === 0) return 'due-today';
            if (diff <= 2) return 'due-soon';
            return '';
        },
        // Drag & drop
        onDragStart(index, event) {
            this.dragIndex = index;
            event.dataTransfer.effectAllowed = 'move';
        },
        onDragOver(index, event) {
            this.dragOverIndex = index;
            event.dataTransfer.dropEffect = 'move';
        },
        onDrop(index) {
            if (this.dragIndex === null || this.dragIndex === index) return;
            const item = this.filteredPending[this.dragIndex];
            // Find actual indices in pendingTasks
            const fromReal = this.pendingTasks.findIndex(t => t.id === item.id);
            const targetItem = this.filteredPending[index];
            const toReal = this.pendingTasks.findIndex(t => t.id === targetItem.id);
            if (fromReal === -1 || toReal === -1) return;
            this.pendingTasks.splice(fromReal, 1);
            this.pendingTasks.splice(toReal, 0, item);
            this.saveToStorage();
        },
        onDragEnd() {
            this.dragIndex = null;
            this.dragOverIndex = null;
        },
        saveToStorage() {
            if (!this.useStorage) return;
            try {
                localStorage.setItem('zen-todo-pending', JSON.stringify(this.pendingTasks));
                localStorage.setItem('zen-todo-completed', JSON.stringify(this.completedTasks));
                localStorage.setItem('zen-todo-categories', JSON.stringify(this.categories));
                localStorage.setItem('zen-todo-nextId', String(this.nextId));
            } catch (e) { /* quota exceeded */ }
        },
        loadFromStorage() {
            if (!this.useStorage) return;
            try {
                const pending = localStorage.getItem('zen-todo-pending');
                const completed = localStorage.getItem('zen-todo-completed');
                const cats = localStorage.getItem('zen-todo-categories');
                const nid = localStorage.getItem('zen-todo-nextId');
                if (pending) this.pendingTasks = JSON.parse(pending);
                if (completed) this.completedTasks = JSON.parse(completed);
                if (cats) this.categories = JSON.parse(cats);
                if (nid) this.nextId = parseInt(nid, 10) || 1;
                // Ensure IDs exist on legacy tasks
                let needsSave = false;
                [...this.pendingTasks, ...this.completedTasks].forEach(t => {
                    if (!t.id) { t.id = this.generateId(); needsSave = true; }
                });
                if (needsSave) this.saveToStorage();
            } catch (e) { /* corrupted data */ }
        }
    }
}
</script>

<style scoped>
.todo-widget {
    width: 100%;
    background-color: var(--zen-bg);
    backdrop-filter: blur(var(--zen-blur));
    border-radius: var(--zen-radius-lg);
    padding: 20px;
    color: var(--zen-text);
    box-shadow: 0 4px 10px var(--zen-shadow);
    max-width: 520px;
    margin: 0 auto;
    font-size: 14px;
}

.todo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.title {
    margin: 0;
    font-size: 1.2rem;
}

.task-count {
    font-size: 0.8rem;
    color: var(--zen-text-secondary);
    background: var(--zen-bg-tertiary);
    padding: 2px 10px;
    border-radius: 12px;
}

/* Form */
.todo-form {
    margin-bottom: 16px;
}

.form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.task-input {
    flex: 1;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background-color: var(--zen-bg-tertiary);
    color: var(--zen-text);
    font-size: 14px;
}

.task-input:focus {
    outline: 2px solid var(--zen-accent);
}

.btn-add {
    background-color: var(--zen-accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: opacity .2s;
}

.btn-add:hover {
    opacity: 0.85;
}

.form-options {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.select-sm {
    padding: 5px 8px;
    border: none;
    border-radius: 6px;
    background: var(--zen-bg-tertiary);
    color: var(--zen-text);
    font-size: 12px;
    cursor: pointer;
    min-width: 0;
    flex: 1;
}

.date-input {
    padding: 5px 8px;
    border: none;
    border-radius: 6px;
    background: var(--zen-bg-tertiary);
    color: var(--zen-text);
    font-size: 12px;
    flex: 1;
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
}

.filter-group {
    display: flex;
    gap: 6px;
    flex: 1;
}

/* Task sections */
.task-section {
    margin-bottom: 16px;
}

.task-section h3 {
    margin-bottom: 8px;
    font-size: 0.85rem;
    color: var(--zen-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-clear {
    font-size: 0.75rem;
    background: none;
    border: none;
    color: var(--zen-text-dim);
    cursor: pointer;
    padding: 2px 6px;
}

.btn-clear:hover {
    color: var(--zen-accent);
}

.task-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* Task item */
.task-item {
    background-color: var(--zen-bg-tertiary);
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    cursor: default;
}

.task-item[draggable="true"] {
    cursor: grab;
}

.task-item[draggable="true"]:active {
    cursor: grabbing;
}

.task-item.dragging {
    opacity: 0.4;
    transform: scale(0.97);
}

.task-left {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

/* Check button */
.btn-check {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
    margin-top: 2px;
}

.check-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--zen-text-dim);
    font-size: 11px;
    color: transparent;
    transition: all .2s;
}

.btn-check:hover .check-circle {
    border-color: var(--zen-accent);
    color: var(--zen-accent);
}

.btn-check.checked .check-circle {
    border-color: var(--zen-accent);
    background: var(--zen-accent);
    color: white;
}

/* Task content */
.task-content {
    flex: 1;
    min-width: 0;
}

.task-text-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.task-text {
    word-break: break-word;
}

/* Priority dot */
.priority-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.p-high {
    background: #ef4444;
}

.p-medium {
    background: #f59e0b;
}

.p-low {
    background: #3b82f6;
}

/* Meta row */
.task-meta {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
}

.tag {
    font-size: 0.7rem;
    background: var(--zen-hover);
    color: var(--zen-text-secondary);
    padding: 1px 8px;
    border-radius: 10px;
}

.due {
    font-size: 0.7rem;
    color: var(--zen-text-dim);
}

.due.overdue {
    color: #ef4444;
    font-weight: 600;
}

.due.due-today {
    color: #f59e0b;
    font-weight: 600;
}

.due.due-soon {
    color: #3b82f6;
}

/* Actions */
.actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity .2s;
}

.task-item:hover .actions {
    opacity: 1;
}

.actions button {
    background: none;
    border: none;
    color: var(--zen-text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 2px 4px;
    border-radius: 4px;
}

.actions button:hover {
    background: var(--zen-hover);
}

/* Completed */
.completed-item {
    opacity: 0.65;
}

.done {
    text-decoration: line-through;
    color: var(--zen-text-muted);
}

.empty {
    font-size: 0.85rem;
    color: var(--zen-text-dim);
    padding: 8px 0;
}
</style>