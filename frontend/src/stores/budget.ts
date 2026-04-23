import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index'
import type { Budget } from '@/types/index'
import { useTransactionStore } from '@/stores/transactions'
import { useCategoryStore } from '@/stores/categories'

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>([])
  const loading = ref(false)

  async function fetchBudgets(month?: string) {
    loading.value = true
    try {
      const params = month ? { month } : {}
      const { data } = await api.get<Budget[]>('/budgets', { params })
      budgets.value = data
    } finally {
      loading.value = false
    }
  }

  async function addBudget(b: Omit<Budget, 'id'>) {
    const { data } = await api.post<Budget>('/budgets', b)
    budgets.value.push(data)
  }

  async function updateBudget(updated: Budget) {
    const { data } = await api.put<Budget>(`/budgets/${updated.id}`, updated)
    const index = budgets.value.findIndex(b => b.id === updated.id)
    if (index !== -1) budgets.value[index] = data
  }

  async function deleteBudget(id: number) {
    await api.delete(`/budgets/${id}`)
    budgets.value = budgets.value.filter(b => b.id !== id)
  }

  function getBudgetsForMonth(month: string) {
    return budgets.value.filter(b => b.month === month)
  }

  function getSpentForCategory(category_id: number, month: string) {
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()
    const cat = categoryStore.categories.find(c => c.id === category_id)
    if (!cat) return 0
    return transactionStore.transactions
      .filter(t => t.type === 'expense' && t.category === cat.name && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const totalBudgeted = computed(() => budgets.value.reduce((sum, b) => sum + b.amount, 0))

  return { budgets, loading, fetchBudgets, addBudget, updateBudget, deleteBudget, getBudgetsForMonth, getSpentForCategory, totalBudgeted }
})