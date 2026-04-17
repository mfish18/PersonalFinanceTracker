<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { useTransactionStore } from '@/stores/transactions'
import { useCategoryStore } from '@/stores/categories'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const store = useTransactionStore()
const categoryStore = useCategoryStore()

// ── Summary ───────────────────────────────────────────
const recentTransactions = computed(() =>
  [...store.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
)

// ── Doughnut: spending by category ───────────────────
const expensesByCategory = computed(() => {
  const map: Record<string, number> = {}
  store.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
  return map
})

const doughnutData = computed(() => {
  const labels = Object.keys(expensesByCategory.value)
  const data = Object.values(expensesByCategory.value)
  const colors = labels.map(label => {
    const cat = categoryStore.categories.find(c => c.name === label)
    return cat?.color ?? '#6b7280'
  })
  return {
    labels,
    datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 12 } } },
  },
}

// ── Bar: income vs expenses by month ─────────────────
const monthlyData = computed(() => {
  const map: Record<string, { income: number; expense: number }> = {}

  store.transactions.forEach(t => {
    const month = t.date.slice(0, 7)
    if (!map[month]) map[month] = { income: 0, expense: 0 }
    map[month][t.type] += t.amount
  })

  const sorted = Object.keys(map).sort()
  return {
    labels: sorted.map(m => {
      const [year, month] = m.split('-')
      return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      { label: 'Income', data: sorted.map(m => map[m].income), backgroundColor: '#16a34a' },
      { label: 'Expenses', data: sorted.map(m => map[m].expense), backgroundColor: '#dc2626' },
    ],
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, labels: { boxWidth: 12, font: { size: 12 } } } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
  },
}

// ── Helpers ───────────────────────────────────────────
function formatAmount(amount: number, type: string) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}$${amount.toFixed(2)}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="dashboard">

    <!-- Summary cards -->
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">Balance</span>
        <span class="summary-value">${{ store.balance.toFixed(2) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Total income</span>
        <span class="summary-value text-income">${{ store.totalIncome.toFixed(2) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Total expenses</span>
        <span class="summary-value text-expense">${{ store.totalExpenses.toFixed(2) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Transactions</span>
        <span class="summary-value">{{ store.transactions.length }}</span>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <div class="card chart-card">
        <h4 class="chart-title">Spending by category</h4>
        <div class="chart-wrap">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
      <div class="card chart-card">
        <h4 class="chart-title">Income vs expenses</h4>
        <div class="chart-wrap">
          <Bar :data="monthlyData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- Recent transactions -->
    <div class="card">
      <div class="recent-header">
        <h4>Recent transactions</h4>
        <RouterLink to="/transactions" class="view-all">View all</RouterLink>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in recentTransactions" :key="t.id">
            <td>{{ t.description }}</td>
            <td>
              <span class="category-pill">{{ t.category }}</span>
            </td>
            <td class="text-muted">{{ formatDate(t.date) }}</td>
            <td :class="['amount', t.type === 'income' ? 'text-income' : 'text-expense']">
              {{ formatAmount(t.amount, t.type) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--space-6); }

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

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.chart-card { display: flex; flex-direction: column; gap: var(--space-4); }
.chart-title { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-secondary); }
.chart-wrap { height: 240px; position: relative; }

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.view-all { font-size: var(--text-sm); color: var(--color-accent); }

.table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
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
  vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover td { background: var(--color-bg-subtle); }

.category-pill {
  background: var(--color-bg-muted);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}
.amount { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
</style>