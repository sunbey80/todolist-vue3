import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

export type FilterType = 'all' | 'active' | 'completed'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<FilterType>('all')

  // 获取过滤后的待办事项
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed)
      case 'completed':
        return todos.value.filter(todo => todo.completed)
      default:
        return todos.value
    }
  })

  // 统计信息
  const stats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(todo => todo.completed).length
    const active = total - completed
    return { total, completed, active }
  })

  // 添加待办事项
  function addTodo(text: string) {
    if (text.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: Date.now()
      }
      todos.value.push(newTodo)
    }
  }

  // 删除待办事项
  function removeTodo(id: number) {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }

  // 切换完成状态
  function toggleTodo(id: number) {
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  // 更新待办事项文本
  function updateTodo(id: number, text: string) {
    const todo = todos.value.find(todo => todo.id === id)
    if (todo && text.trim()) {
      todo.text = text.trim()
    }
  }

  // 设置过滤类型
  function setFilter(type: FilterType) {
    filter.value = type
  }

  // 清除所有已完成的任务
  function clearCompleted() {
    todos.value = todos.value.filter(todo => !todo.completed)
  }

  // 切换所有任务状态
  function toggleAll(completed: boolean) {
    todos.value.forEach(todo => {
      todo.completed = completed
    })
  }

  return {
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
  }
})

