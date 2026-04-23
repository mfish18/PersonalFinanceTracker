<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTransactionStore } from '@/stores/transactions'
import { useCategoryStore } from '@/stores/categories'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { onMounted } from 'vue'


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

onMounted(() => {
  store.fetchTransactions()
  categoryStore.fetchCategories()
})

const store = useTransactionStore()
const categoryStore = useCategoryStore()

const selectedMonth = ref(format(new Date(), 'yyyy-MM'))
const selectedType = ref<'all' | 'income' | 'expense'>('all')

const filteredTransactions = computed(() => {
  const start = startOfMonth(parseISO(`${selectedMonth.value}-01`))
  const end = endOfMonth(parseISO(`${selectedMonth.value}-01`))
  return store.transactions.filter(t => {
    const inRange = isWithinInterval(parseISO(t.date), { start, end })
    const matchesType = selectedType.value === 'all' || t.type === selectedType.value
    return inRange && matchesType
  })
})

const monthIncome = computed(() =>
  filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
)
const monthExpenses = computed(() =>
  filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
)
const monthBalance = computed(() => monthIncome.value - monthExpenses.value)
const savingsRate = computed(() => {
  if (monthIncome.value === 0) return 0
  return Math.round((monthBalance.value / monthIncome.value) * 100)
})

const categoryBreakdown = computed(() => {
  const map: Record<string, number> = {}
  filteredTransactions.value
    .filter(t => t.type === 'expense')
    .forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount })

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1])
  const labels = sorted.map(([k]) => k)
  const data = sorted.map(([, v]) => v)
  const colors = labels.map(label => {
    const cat = categoryStore.categories.find(c => c.name === label)
    return cat?.color ?? '#6b7280'
  })

  return {
    labels,
    datasets: [{ label: 'Spent', data, backgroundColor: colors, borderRadius: 4 }],
  }
})

const dailyTrend = computed(() => {
  const map: Record<string, number> = {}
  filteredTransactions.value
    .filter(t => t.type === 'expense')
    .forEach(t => { map[t.date] = (map[t.date] ?? 0) + t.amount })

  const sorted = Object.keys(map).sort()
  return {
    labels: sorted.map(d => format(parseISO(d), 'MMM d')),
    datasets: [{
      label: 'Daily spending',
      data: sorted.map(d => map[d] ?? 0),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.08)',
      tension: 0.3,
      fill: true,
      pointRadius: 4,
    }],
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
  },
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
  },
}

function exportCSV() {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const rows = filteredTransactions.value.map(t => [
    t.date, t.description, t.category, t.type, t.amount.toFixed(2)
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions-${selectedMonth.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function formatAmount(n: number) {
  return `$${n.toFixed(2)}`
}
</script>

<template>
  <div class="reports">

    
    <div class="filters card">
      <div class="filter-group">
        <label>Month</label>
        <input v-model="selectedMonth" type="month" style="width: auto;" />
      </div>
      <div class="filter-group">
        <label>Type</label>
        <select v-model="selectedType" style="width: auto;">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <button class="btn btn-primary export-btn" @click="exportCSV">Export CSV</button>
    </div>

    
    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">Income</span>
        <span class="summary-value text-income">{{ formatAmount(monthIncome) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Expenses</span>
        <span class="summary-value text-expense">{{ formatAmount(monthExpenses) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Balance</span>
        <span class="summary-value" :class="monthBalance >= 0 ? 'text-income' : 'text-expense'">
          {{ formatAmount(monthBalance) }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Savings rate</span>
        <span class="summary-value" :class="savingsRate >= 0 ? 'text-income' : 'text-expense'">
          {{ savingsRate }}%
        </span>
      </div>
    </div>

    
    <div class="charts-row">
      <div class="card chart-card">
        <h4 class="chart-title">Spending by category</h4>
        <div class="chart-wrap">
          <Bar v-if="categoryBreakdown.labels.length" :data="categoryBreakdown" :options="barOptions" />
          <p v-else class="empty">No expense data for this period.</p>
        </div>
      </div>
      <div class="card chart-card">
        <h4 class="chart-title">Daily spending trend</h4>
        <div class="chart-wrap">
          <Line v-if="dailyTrend.labels.length" :data="dailyTrend" :options="lineOptions" />
          <p v-else class="empty">No expense data for this period.</p>
        </div>
      </div>
    </div>

    
    <div class="card">
      <h4 style="margin-bottom: var(--space-4);">Transaction breakdown</h4>
      <div v-if="filteredTransactions.length">
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredTransactions" :key="t.id">
              <td>{{ t.description }}</td>
              <td><span class="category-pill">{{ t.category }}</span></td>
              <td class="text-muted">{{ t.date }}</td>
              <td>
                <span :class="['badge', t.type === 'income' ? 'badge-income' : 'badge-expense']">
                  {{ t.type }}
                </span>
              </td>
              <td :class="['amount', t.type === 'income' ? 'text-income' : 'text-expense']">
                {{ t.type === 'income' ? '+' : '-' }}{{ formatAmount(t.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">No transactions found for this period.</p>
    </div>

  </div>
</template>

<style scoped>
.reports { display: flex; flex-direction: column; gap: var(--space-6); }

.filters {
  display: flex;
  align-items: flex-end;
  gap: var(--space-6);
}
.filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
.export-btn { margin-left: auto; }

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
.chart-wrap { height: 240px; position: relative; display: flex; align-items: center; justify-content: center; }

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
.empty { color: var(--color-text-muted); font-size: var(--text-sm); padding: var(--space-4) 0; }
</style>