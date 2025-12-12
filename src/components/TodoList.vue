<template>
  <div class="todo-container">
    <div class="todo-header">
      <h1 class="todo-title">待办事项</h1>
      <div class="todo-stats">
        <span class="stat-item">总计: {{ stats.total }}</span>
        <span class="stat-item">待完成: {{ stats.active }}</span>
        <span class="stat-item">已完成: {{ stats.completed }}</span>
      </div>
    </div>

    <div class="todo-input-section">
      <div class="input-wrapper">
        <input
          v-model="newTodoText"
          @keyup.enter="handleAddTodo"
          type="text"
          placeholder="添加新的待办事项..."
          class="todo-input"
        />
        <button @click="handleAddTodo" class="add-button">添加</button>
      </div>
      <div v-if="todos.length > 0" class="toggle-all-wrapper">
        <label class="toggle-all-label">
          <input
            type="checkbox"
            :checked="allCompleted"
            @change="handleToggleAll"
            class="toggle-all-checkbox"
          />
          <span>全选/取消全选</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <button
        v-for="type in filterTypes"
        :key="type.value"
        @click="setFilter(type.value)"
        :class="['filter-button', { active: filter === type.value }]"
      >
        {{ type.label }}
      </button>
      <button
        v-if="stats.completed > 0"
        @click="clearCompleted"
        class="clear-button"
      >
        清除已完成
      </button>
    </div>

    <div class="todo-list">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="['todo-item', { completed: todo.completed }]"
      >
        <div class="todo-content">
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
            class="todo-checkbox"
          />
          <span
            v-if="editingId !== todo.id"
            @dblclick="startEdit(todo.id)"
            class="todo-text"
          >
            {{ todo.text }}
          </span>
          <input
            v-else
            v-model="editingText"
            @blur="finishEdit(todo.id)"
            @keyup.enter="finishEdit(todo.id)"
            @keyup.esc="cancelEdit"
            class="todo-edit-input"
            ref="editInput"
          />
        </div>
        <button @click="removeTodo(todo.id)" class="delete-button">删除</button>
      </div>
      <div v-if="filteredTodos.length === 0" class="empty-state">
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useTodoStore } from '@/stores/todo'
import type { FilterType } from '@/stores/todo'

const todoStore = useTodoStore()
const {
  todos,
  filter,
  filteredTodos,
  stats,
  addTodo,
  removeTodo,
  toggleTodo,
  updateTodo,
  setFilter,
  clearCompleted,
  toggleAll
} = todoStore

const newTodoText = ref('')
const editingId = ref<number | null>(null)
const editingText = ref('')
const editInput = ref<HTMLInputElement | null>(null)

const filterTypes = [
  { value: 'all' as FilterType, label: '全部' },
  { value: 'active' as FilterType, label: '待完成' },
  { value: 'completed' as FilterType, label: '已完成' }
]

const allCompleted = computed(() => {
  return todos.length > 0 && todos.every(todo => todo.completed)
})

const emptyMessage = computed(() => {
  switch (filter) {
    case 'active':
      return '没有待完成的任务'
    case 'completed':
      return '没有已完成的任务'
    default:
      return '还没有待办事项，添加一个吧！'
  }
})

function handleAddTodo() {
  if (newTodoText.value.trim()) {
    addTodo(newTodoText.value)
    newTodoText.value = ''
  }
}

function handleToggleAll(event: Event) {
  const target = event.target as HTMLInputElement
  toggleAll(target.checked)
}

function startEdit(id: number) {
  const todo = todos.find(t => t.id === id)
  if (todo) {
    editingId.value = id
    editingText.value = todo.text
    nextTick(() => {
      editInput.value?.focus()
    })
  }
}

function finishEdit(id: number) {
  if (editingText.value.trim()) {
    updateTodo(id, editingText.value)
  }
  editingId.value = null
  editingText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editingText.value = ''
}
</script>

<style scoped>
.todo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
}

.todo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.todo-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.todo-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #555;
}

.todo-input-section {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

.todo-input:focus {
  border-color: #42b983;
}

.add-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.add-button:hover {
  background: #35a372;
}

.toggle-all-wrapper {
  display: flex;
  justify-content: flex-start;
}

.toggle-all-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  color: #666;
}

.toggle-all-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-button:hover {
  border-color: #42b983;
  color: #42b983;
}

.filter-button.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.clear-button {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  margin-left: auto;
}

.clear-button:hover {
  background: #ee5a5a;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
}

.todo-item:hover {
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
  color: #333;
  cursor: text;
  word-break: break-word;
}

.todo-edit-input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 2px solid #42b983;
  border-radius: 4px;
  outline: none;
}

.delete-button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-button:hover {
  background: #ee5a5a;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .todo-container {
    padding: 1rem;
  }

  .todo-title {
    font-size: 2rem;
  }

  .todo-stats {
    gap: 0.75rem;
  }

  .stat-item {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .input-wrapper {
    flex-direction: column;
  }

  .add-button {
    width: 100%;
  }

  .filter-section {
    flex-direction: column;
  }

  .clear-button {
    margin-left: 0;
    width: 100%;
  }
}
</style>

