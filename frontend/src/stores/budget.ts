import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Budget } from '@/types/index'
import { useTransactionStore } from '@/stores/transactions'
import { useCategoryStore } from '@/stores/categories'

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>([
    { id: '1', categoryId: '3', amount: 200, month: '2024-04' },
    { id: '2', categoryId: '4', amount: 900, month: '2024-04' },
    { id: '3', categoryId: '5', amount: 100, month: '2024-04' },
    { id: '4', categoryId: '7', amount: 150, month: '2024-04' },
  ])

  function addBudget(b: Omit<Budget, 'id'>) {
    budgets.value.push({ ...b, id: crypto.randomUUID() })
  }

  function updateBudget(updated: Budget) {
    const index = budgets.value.findIndex(b => b.id === updated.id)
    if (index !== -1) budgets.value[index] = updated
  }

  function deleteBudget(id: string) {
    budgets.value = budgets.value.filter(b => b.id !== id)
  }

  function getBudgetsForMonth(month: string) {
    return budgets.value.filter(b => b.month === month)
  }

  function getSpentForCategory(categoryId: string, month: string) {
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()
    const cat = categoryStore.categories.find(c => c.id === categoryId)
    if (!cat) return 0
    return transactionStore.transactions
      .filter(t => t.type === 'expense' && t.category === cat.name && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const totalBudgeted = computed(() => {
    const month = new Date().toISOString().slice(0, 7)
    return getBudgetsForMonth(month).reduce((sum, b) => sum + b.amount, 0)
  })

  return { budgets, addBudget, updateBudget, deleteBudget, getBudgetsForMonth, getSpentForCategory, totalBudgeted }
})