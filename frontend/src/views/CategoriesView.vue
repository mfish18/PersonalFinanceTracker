<script setup lang="ts">
import { ref } from 'vue'
import { useCategoryStore } from '@/stores/categories'
import type { Category } from '@/types/index'
import { onMounted } from 'vue'


const store = useCategoryStore()

onMounted(() => {
  store.fetchCategories()
})

const showForm = ref(false)
const editingCategory = ref<Category | null>(null)

const empty: Omit<Category, 'id'> = {
  name: '',
  color: '#6b7280',
  type: 'expense',
}

const form = ref<Omit<Category, 'id'>>({ ...empty })

function openAdd() {
  editingCategory.value = null
  form.value = { ...empty }
  showForm.value = true
}

function openEdit(c: Category) {
  editingCategory.value = c
  form.value = { name: c.name, color: c.color, type: c.type }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingCategory.value = null
}

function submit() {
  if (!form.value.name) return
  if (editingCategory.value) {
    store.updateCategory({ ...form.value, id: editingCategory.value.id })
  } else {
    store.addCategory(form.value)
  }
  closeForm()
}
</script>

<template>
  <div class="categories">

    <div class="section-header">
      <h2>Categories</h2>
      <button class="btn btn-primary" @click="openAdd">+ New category</button>
    </div>

    
    <div>
      <h4 class="group-label">Income</h4>
      <div class="card">
        <div
          v-for="c in store.categories.filter(c => c.type === 'income' || c.type === 'both')"
          :key="c.id"
          class="category-row"
        >
          <div class="category-info">
            <span class="color-dot" :style="{ background: c.color }"></span>
            <span class="category-name">{{ c.name }}</span>
            <span class="badge badge-income">{{ c.type }}</span>
          </div>
          <div class="row-actions">
            <button class="btn" @click="openEdit(c)">Edit</button>
            <button class="btn btn-danger" @click="store.deleteCategory(c.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    
    <div>
      <h4 class="group-label">Expenses</h4>
      <div class="card">
        <div
          v-for="c in store.categories.filter(c => c.type === 'expense' || c.type === 'both')"
          :key="c.id"
          class="category-row"
        >
          <div class="category-info">
            <span class="color-dot" :style="{ background: c.color }"></span>
            <span class="category-name">{{ c.name }}</span>
            <span class="badge badge-expense">{{ c.type }}</span>
          </div>
          <div class="row-actions">
            <button class="btn" @click="openEdit(c)">Edit</button>
            <button class="btn btn-danger" @click="store.deleteCategory(c.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="showForm" class="overlay" @click.self="closeForm">
      <div class="modal card">
        <h3>{{ editingCategory ? 'Edit category' : 'New category' }}</h3>

        <div class="form-group">
          <label>Name</label>
          <input v-model="form.name" type="text" placeholder="e.g. Groceries" />
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="form.type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div class="form-group">
          <label>Color</label>
          <div class="color-row">
            <input v-model="form.color" type="color" class="color-input" />
            <span class="text-muted text-sm">{{ form.color }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn" @click="closeForm">Cancel</button>
          <button class="btn btn-primary" @click="submit">
            {{ editingCategory ? 'Save changes' : 'Add category' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.categories { display: flex; flex-direction: column; gap: var(--space-6); }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}
.category-row:last-child { border-bottom: none; }

.category-info { display: flex; align-items: center; gap: var(--space-3); }
.color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.category-name { font-size: var(--text-sm); font-weight: 500; }

.row-actions { display: flex; gap: var(--space-2); }

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

.color-row { display: flex; align-items: center; gap: var(--space-3); }
.color-input { width: 48px; height: 36px; padding: 2px; border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--color-border-strong); }
</style>