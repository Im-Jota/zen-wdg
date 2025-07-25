<template>
    <div class="todo-widget">
        <h2 class="title">📝 Mis Tareas</h2>

        <form @submit.prevent="addTask" class="todo-form">
            <input v-model="newTask" type="text" placeholder="Escribe una nueva tarea..." />
            <button type="submit">Agregar</button>
        </form>

        <div class="task-section">
            <h3>Tareas Pendientes</h3>
            <div v-if="pendingTasks.length === 0" class="empty">Sin tareas.</div>
            <ul>
                <li v-for="(task, index) in pendingTasks" :key="index">
                    <span>{{ task.text }}</span>
                    <div class="actions">
                        <button @click="completeTask(index)">✔️</button>
                        <button @click="deleteTask(index)">🗑️</button>
                    </div>
                </li>
            </ul>
        </div>

        <div class="task-section completed">
            <h3>Completadas</h3>
            <div v-if="completedTasks.length === 0" class="empty">Ninguna aún.</div>
            <ul>
                <li v-for="(task, index) in completedTasks" :key="'c' + index">
                    <span class="done">{{ task.text }}</span>
                    <button @click="deleteCompleted(index)">❌</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ZTodoWidget',
    data() {
        return {
            newTask: '',
            pendingTasks: [],
            completedTasks: []
        }
    },
    methods: {
        addTask() {
            if (this.newTask.trim()) {
                this.pendingTasks.push({ text: this.newTask.trim() })
                this.newTask = ''
            }
        },
        completeTask(index) {
            const task = this.pendingTasks.splice(index, 1)[0]
            this.completedTasks.push(task)
        },
        deleteTask(index) {
            this.pendingTasks.splice(index, 1)
        },
        deleteCompleted(index) {
            this.completedTasks.splice(index, 1)
        }
    }
}
</script>

<style scoped>
.todo-widget {
    width: 100%;
    background-color: rgba(20, 20, 20, .4);
    backdrop-filter: blur(.2rem);
    border-radius: 16px;
    padding: 20px;
    color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    margin: 0 auto;
}

.title {
    margin-bottom: 16px;
    text-align: center;
}

.todo-form {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.todo-form input {
    flex: 1;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background-color: #2a2a2a;
    color: white;
}

.todo-form button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    cursor: pointer;
}

.task-section {
    margin-bottom: 20px;
}

.task-section h3 {
    margin-bottom: 8px;
    font-size: 1rem;
    color: #ccc;
}

.task-section ul {
    list-style: none;
    padding: 0;
}

.task-section li {
    background-color: #292929;
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.actions button {
    margin-left: 8px;
    background: none;
    border: none;
    color: #bbb;
    cursor: pointer;
    font-size: 1rem;
}

.actions button:hover {
    color: white;
}

.empty {
    font-size: 0.9rem;
    color: #666;
}

.done {
    text-decoration: line-through;
    color: #777;
}
</style>