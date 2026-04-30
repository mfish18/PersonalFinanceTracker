<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '@/stores/transactions'
import type { Transaction } from '@/types/index'
import { useCategoryStore } from '@/stores/categories'
import { useCurrency } from '@/composables/useCurrency'

const { formatAmount, formatWithSign } = useCurrency()

onMounted(() => {
  store.fetchTransactions()
  categoryStore.fetchCategories()
})
const categoryStore = useCategoryStore()

const store = useTransactionStore()

const showForm = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const search = ref('')
const filterCategory = ref('')
const filterType = ref<'all' | 'income' | 'expense'>('all')
const filterDateFrom = ref('')
const filterDateTo = ref('')

const filteredTransactions = computed(() => {
  return store.transactions.filter(t => {
    const matchesSearch = search.value === '' ||
      t.description.toLowerCase().includes(search.value.toLowerCase()) ||
      t.category.toLowerCase().includes(search.value.toLowerCase())

    const matchesCategory = filterCategory.value === '' ||
      t.category === filterCategory.value

    const matchesType = filterType.value === 'all' ||
      t.type === filterType.value

    const matchesDateFrom = filterDateFrom.value === '' ||
      t.date >= filterDateFrom.value

    const matchesDateTo = filterDateTo.value === '' ||
      t.date <= filterDateTo.value

    return matchesSearch && matchesCategory && matchesType && matchesDateFrom && matchesDateTo
  })
})

const activeFilterCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (filterCategory.value) count++
  if (filterType.value !== 'all') count++
  if (filterDateFrom.value) count++
  if (filterDateTo.value) count++
  return count
})

function clearFilters() {
  search.value = ''
  filterCategory.value = ''
  filterType.value = 'all'
  filterDateFrom.value = ''
  filterDateTo.value = ''
}


const empty: Omit<Transaction, 'id'> = {
  amount: 0,
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0] as string,
  type: 'expense' as 'income' | 'expense',
}

const form = ref<Omit<Transaction, 'id'>>({ ...empty })

const currentPage = ref(1)
const pageSize = 10

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTransactions.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / pageSize)
)

const pageStart = computed(() =>
  filteredTransactions.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1
)

const pageEnd = computed(() =>
  Math.min(currentPage.value * pageSize, filteredTransactions.value.length)
)

// Reset to page 1 when filters change
watch([search, filterCategory, filterType, filterDateFrom, filterDateTo], () => {
  currentPage.value = 1
})

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
        <span class="summary-value">{{ formatAmount(store.balance) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Income</span>
        <span class="summary-value text-income">{{ formatAmount(store.totalIncome) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Expenses</span>
        <span class="summary-value text-expense">{{ formatAmount(store.totalExpenses) }}</span>
      </div>
    </div>

    <div class="section-header">
      <h2>Transactions</h2>
      <button class="btn btn-primary" @click="openAdd">+ Add transaction</button>
    </div>

    <div class="filter-bar card">
      <div class="filter-row">
        <div class="filter-group search-group">
          <input v-model="search" type="text" placeholder="Search transactions..." class="search-input" />
        </div>

        <div class="filter-group">
          <select v-model="filterCategory">
            <option value="">All categories</option>
            <option v-for="c in categoryStore.categories" :key="c.id" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="filterType">
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div class="filter-group">
          <input v-model="filterDateFrom" type="date" />
        </div>

        <div class="filter-group">
          <input v-model="filterDateTo" type="date" />
        </div>

        <button v-if="activeFilterCount > 0" class="btn clear-btn" @click="clearFilters">
          Clear ({{ activeFilterCount }})
        </button>
      </div>
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
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="6" class="empty-row">No transactions match your filters.</td>
          </tr>
          <tr v-for="t in paginatedTransactions" :key="t.id">
            <td>{{ t.description }}</td>
            <td><span class="category-pill">{{ t.category }}</span></td>
            <td class="text-muted">{{ formatDate(t.date) }}</td>
            <td><span :class="['badge', t.type === 'income' ? 'badge-income' : 'badge-expense']">{{ t.type }}</span>
            </td>
            <td :class="['amount', t.type === 'income' ? 'text-income' : 'text-expense']">
              {{ formatWithSign(t.amount, t.type) }}
            </td>
            <td class="row-actions">
              <button class="btn" @click="openEdit(t)">Edit</button>
              <button class="btn btn-danger" @click="store.deleteTransaction(t.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredTransactions.length > 0" class="pagination">
        <span class="pagination-info text-muted text-sm">
          Showing {{ pageStart }}–{{ pageEnd }} of {{ filteredTransactions.length }} transactions
        </span>
        <div class="pagination-controls">
          <button class="btn" :disabled="currentPage === 1" @click="currentPage--">
            Previous
          </button>
          <span class="page-indicator text-sm">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button class="btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            Next
          </button>
        </div>
      </div>
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
            <option v-for="c in categoryStore.getCategoriesForType(form.type)" :key="c.id" :value="c.name">
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

.filter-bar {
  padding: var(--space-4);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
}

.clear-btn {
  white-space: nowrap;
  align-self: flex-end;
}

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  padding: var(--space-8) !important;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-3) 0;
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-3);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.page-indicator {
  color: var(--color-text-secondary);
  min-width: 80px;
  text-align: center;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
