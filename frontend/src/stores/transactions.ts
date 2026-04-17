import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction } from '@/types/index'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([
    { id: '1', amount: 3200, category: 'Salary', description: 'Monthly salary', date: '2024-04-01', type: 'income' },
    { id: '2', amount: 120, category: 'Groceries', description: 'Weekly shop', date: '2024-04-03', type: 'expense' },
    { id: '3', amount: 55, category: 'Transport', description: 'Monthly transit pass', date: '2024-04-04', type: 'expense' },
    { id: '4', amount: 800, category: 'Rent', description: 'April rent', date: '2024-04-05', type: 'expense' },
    { id: '5', amount: 500, category: 'Freelance', description: 'Design project', date: '2024-04-06', type: 'income' },
  ])

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

  function addTransaction(t: Omit<Transaction, 'id'>) {
    transactions.value.unshift({ ...t, id: crypto.randomUUID() })
  }

  function updateTransaction(updated: Transaction) {
    const index = transactions.value.findIndex(t => t.id === updated.id)
    if (index !== -1) transactions.value[index] = updated
  }

  function deleteTransaction(id: string) {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return { transactions, totalIncome, totalExpenses, balance, addTransaction, updateTransaction, deleteTransaction }
})