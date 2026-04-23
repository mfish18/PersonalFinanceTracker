<script setup lang="ts">
import { ref } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import type { Transaction } from '@/types/index'
import { useCategoryStore } from '@/stores/categories'
import { onMounted } from 'vue'

onMounted(() => {
  store.fetchTransactions()
  categoryStore.fetchCategories()
})
const categoryStore = useCategoryStore()

const store = useTransactionStore()

const showForm = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const empty: Omit<Transaction, 'id'> = {
  amount: 0,
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0] as string,
  type: 'expense' as 'income' | 'expense',
}

const form = ref<Omit<Transaction, 'id'>>({ ...empty })

function openAdd() {
  editingTransaction.value = null
  form.value = { ...empty }
  showForm.value = true
}

function openEdit(t: Transaction) {
  editingTransaction.value = t
  form.value = {
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    type: t.type,
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingTransaction.value = null
}

function submit() {
  if (!form.value.description || !form.value.category || !form.value.amount) return
  if (editingTransaction.value) {
    store.updateTransaction({ ...form.value, id: editingTransaction.value.id })
  } else {
    store.addTransaction(form.value)
  }
  closeForm()
}

function formatAmount(amount: number, type: string) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}$${amount.toFixed(2)}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="transactions">
    
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">Balance</span>
        <span class="summary-value">${{ store.balance.toFixed(2) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Income</span>
        <span class="summary-value text-income">${{ store.totalIncome.toFixed(2) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Expenses</span>
        <span class="summary-value text-expense">${{ store.totalExpenses.toFixed(2) }}</span>
      </div>
    </div>

    
    <div class="section-header">
      <h2>Transactions</h2>
      <button class="btn btn-primary" @click="openAdd">+ Add transaction</button>
    </div>

    
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th style="text-align: right">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in store.transactions" :key="t.id">
            <td>{{ t.description }}</td>
            <td>
              <span class="category-pill">{{ t.category }}</span>
            </td>
            <td class="text-muted">{{ formatDate(t.date) }}</td>
            <td>
              <span :class="['badge', t.type === 'income' ? 'badge-income' : 'badge-expense']">{{
                t.type
              }}</span>
            </td>
            <td :class="['amount', t.type === 'income' ? 'text-income' : 'text-expense']">
              {{ formatAmount(t.amount, t.type) }}
            </td>
            <td class="row-actions">
              <button class="btn" @click="openEdit(t)">Edit</button>
              <button class="btn btn-danger" @click="store.deleteTransaction(t.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    
    <div v-if="showForm" class="overlay" @click.self="closeForm">
      <div class="modal card">
        <h3>{{ editingTransaction ? 'Edit transaction' : 'New transaction' }}</h3>

        <div class="form-group">
          <label>Description</label>
          <input v-model="form.description" type="text" placeholder="e.g. Weekly groceries" />
        </div>

        <div class="form-group">
          <label>Amount</label>
          <input v-model.number="form.amount" type="number" min="0" placeholder="0.00" />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category">
            <option value="" disabled>Select a category</option>
            <option
              v-for="c in categoryStore.getCategoriesForType(form.type)"
              :key="c.id"
              :value="c.name"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Date</label>
          <input v-model="form.date" type="date" />
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="form.type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="btn" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" @click="submit">
            {{ editingTransaction ? 'Save changes' : 'Add transaction' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transactions {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.summary-card {
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.summary-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.summary-value {
  font-size: var(--text-2xl);
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.table th {
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}
.table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover td {
  background: var(--color-bg-subtle);
}

.category-pill {
  background: var(--color-bg-muted);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}
.amount {
  text-align: right;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.row-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
