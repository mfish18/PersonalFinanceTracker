<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useCategoryStore } from '@/stores/categories'
import type { Budget } from '@/types/index'
import { onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactions'

const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()

const selectedMonth = ref('2026-04')

const editingBudget = ref<Budget | null>(null)
const showForm = ref(false)

const empty: Omit<Budget, 'id'> = {
  category_id: 0,
  amount: 0,
  month: selectedMonth.value,
}

const form = ref<Omit<Budget, 'id'>>({ ...empty })

onMounted(async () => {
  await categoryStore.fetchCategories()
  await transactionStore.fetchTransactions()
  await budgetStore.fetchBudgets(selectedMonth.value)
})

function openAdd() {
  editingBudget.value = null
  form.value = { ...empty, month: selectedMonth.value }
  showForm.value = true
}

function openEdit(b: Budget) {
  editingBudget.value = b
  form.value = { category_id: b.category_id, amount: b.amount, month: b.month }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingBudget.value = null
}

function submit() {
  if (!form.value.category_id|| !form.value.amount) return
  if (editingBudget.value) {
    budgetStore.updateBudget({ ...form.value, id: editingBudget.value.id })
  } else {
    budgetStore.addBudget(form.value)
  }
  closeForm()
}

const budgetRows = computed(() => {
  return budgetStore.getBudgetsForMonth(selectedMonth.value).map(b => {
    const category = categoryStore.categories.find(c => c.id === b.category_id)
    const spent = budgetStore.getSpentForCategory(b.category_id, selectedMonth.value)
    const percentage = Math.min(Math.round((spent / b.amount) * 100), 100)
    const remaining = b.amount - spent
    const overBudget = spent > b.amount
    return { ...b, category, spent, percentage, remaining, overBudget }
  })
})

const totalBudgeted = computed(() =>
  budgetRows.value.reduce((sum, r) => sum + r.amount, 0)
)
const totalSpent = computed(() =>
  budgetRows.value.reduce((sum, r) => sum + r.spent, 0)
)
const totalRemaining = computed(() => totalBudgeted.value - totalSpent.value)
const overallPercentage = computed(() => {
  if (totalBudgeted.value === 0) return 0
  return Math.min(Math.round((totalSpent.value / totalBudgeted.value) * 100), 100)
})

function formatAmount(n: number) {
  return `$${n.toFixed(2)}`
}

function progressColor(percentage: number, overBudget: boolean) {
  if (overBudget) return 'var(--color-expense)'
  if (percentage >= 80) return '#d97706'
  return 'var(--color-income)'
}

const expenseCategories = computed(() =>
  categoryStore.categories.filter(c => c.type === 'expense' || c.type === 'both')
)
</script>

<template>
  <div class="budget">

    
    <div class="section-header">
      <div class="header-left">
        <h2>Budget</h2>
        <input v-model="selectedMonth" type="month" style="width: auto;" />
      </div>
      <button class="btn btn-primary" @click="openAdd">+ New budget</button>
    </div>

    
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">Total budgeted</span>
        <span class="summary-value">{{ formatAmount(totalBudgeted) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Total spent</span>
        <span class="summary-value text-expense">{{ formatAmount(totalSpent) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Remaining</span>
        <span class="summary-value" :class="totalRemaining >= 0 ? 'text-income' : 'text-expense'">
          {{ formatAmount(totalRemaining) }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Overall usage</span>
        <span class="summary-value" :class="overallPercentage >= 100 ? 'text-expense' : ''">
          {{ overallPercentage }}%
        </span>
      </div>
    </div>

    
    <div class="card overall-progress">
      <div class="progress-header">
        <span class="text-sm">Overall budget usage</span>
        <span class="text-sm text-muted">{{ formatAmount(totalSpent) }} of {{ formatAmount(totalBudgeted) }}</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{
            width: `${overallPercentage}%`,
            background: progressColor(overallPercentage, totalSpent > totalBudgeted)
          }"
        ></div>
      </div>
    </div>

    
    <div v-if="budgetRows.length" class="card">
      <div v-for="row in budgetRows" :key="row.id" class="budget-row">
        <div class="budget-row-top">
          <div class="budget-category">
            <span
              class="color-dot"
              :style="{ background: row.category?.color ?? '#6b7280' }"
            ></span>
            <span class="category-name">{{ row.category?.name ?? 'Unknown' }}</span>
            <span v-if="row.overBudget" class="badge badge-expense">over budget</span>
          </div>
          <div class="budget-amounts">
            <span :class="row.overBudget ? 'text-expense' : 'text-muted'" class="text-sm">
              {{ formatAmount(row.spent) }} spent
            </span>
            <span class="text-muted text-sm"> / {{ formatAmount(row.amount) }}</span>
            <span class="text-sm" :class="row.remaining >= 0 ? 'text-income' : 'text-expense'">
              &nbsp;· {{ row.remaining >= 0 ? formatAmount(row.remaining) + ' left' : formatAmount(Math.abs(row.remaining)) + ' over' }}
            </span>
          </div>
          <div class="row-actions">
            <button class="btn" @click="openEdit(row)">Edit</button>
            <button class="btn btn-danger" @click="budgetStore.deleteBudget(row.id)">Delete</button>
          </div>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: `${row.percentage}%`,
              background: progressColor(row.percentage, row.overBudget)
            }"
          ></div>
        </div>
        <div class="progress-label">
          <span class="text-muted text-sm">{{ row.percentage }}% used</span>
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p class="text-muted">No budgets set for this month. Add one to get started.</p>
    </div>

    
    <div v-if="showForm" class="overlay" @click.self="closeForm">
      <div class="modal card">
        <h3>{{ editingBudget ? 'Edit budget' : 'New budget' }}</h3>

        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category_id">
            <option value="" disabled>Select a category</option>
            <option v-for="c in expenseCategories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Monthly limit</label>
          <input v-model.number="form.amount" type="number" min="0" placeholder="0.00" />
        </div>

        <div class="form-group">
          <label>Month</label>
          <input v-model="form.month" type="month" />
        </div>

        <div class="form-actions">
          <button class="btn" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" @click="submit">
            {{ editingBudget ? 'Save changes' : 'Add budget' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.budget { display: flex; flex-direction: column; gap: var(--space-6); }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left { display: flex; align-items: center; gap: var(--space-4); }

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
.summary-label { font-size: var(--text-sm); color: var(--color-text-muted); }
.summary-value { font-size: var(--text-2xl); font-weight: 600; }

.overall-progress { display: flex; flex-direction: column; gap: var(--space-3); }
.progress-header { display: flex; justify-content: space-between; align-items: center; }

.progress-track {
  height: 8px;
  background: var(--color-bg-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.budget-row {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.budget-row:last-child { border-bottom: none; }

.budget-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.budget-category { display: flex; align-items: center; gap: var(--space-2); flex: 1; }
.color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.category-name { font-size: var(--text-sm); font-weight: 500; }
.budget-amounts { display: flex; align-items: center; }
.row-actions { display: flex; gap: var(--space-2); }
.progress-label { display: flex; justify-content: flex-end; }

.empty-state { padding: var(--space-8); text-align: center; }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.form-group { display: flex; flex-direction: column; gap: var(--space-1); }
.form-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-2); }
</style>