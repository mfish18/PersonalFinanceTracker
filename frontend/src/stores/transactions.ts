import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index'
import type { Transaction } from '@/types/index'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<Transaction[]>('/transactions')
      transactions.value = data
    } catch (e: any) {
      error.value = e.response?.data?.error ?? 'Failed to fetch transactions'
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(t: Omit<Transaction, 'id'>) {
    const { data } = await api.post<Transaction>('/transactions', t)
    transactions.value.unshift(data)
  }

  async function updateTransaction(updated: Transaction) {
    const { data } = await api.put<Transaction>(`/transactions/${updated.id}`, updated)
    const index = transactions.value.findIndex(t => t.id === updated.id)
    if (index !== -1) transactions.value[index] = data
  }

  async function deleteTransaction(id: number) {
    await api.delete(`/transactions/${id}`)
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return { transactions, loading, error, totalIncome, totalExpenses, balance, fetchTransactions, addTransaction, updateTransaction, deleteTransaction }
})