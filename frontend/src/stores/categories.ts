import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category } from '@/types/index'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([
    { id: '1', name: 'Salary',     color: '#16a34a', type: 'income' },
    { id: '2', name: 'Freelance',  color: '#2563eb', type: 'income' },
    { id: '3', name: 'Groceries',  color: '#d97706', type: 'expense' },
    { id: '4', name: 'Rent',       color: '#dc2626', type: 'expense' },
    { id: '5', name: 'Transport',  color: '#7c3aed', type: 'expense' },
    { id: '6', name: 'Utilities',  color: '#0891b2', type: 'expense' },
    { id: '7', name: 'Dining',     color: '#db2777', type: 'expense' },
    { id: '8', name: 'Other',      color: '#6b7280', type: 'both' },
  ])

  function addCategory(c: Omit<Category, 'id'>) {
    categories.value.push({ ...c, id: crypto.randomUUID() })
  }

  function updateCategory(updated: Category) {
    const index = categories.value.findIndex(c => c.id === updated.id)
    if (index !== -1) categories.value[index] = updated
  }

  function deleteCategory(id: string) {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function getCategoriesForType(type: 'income' | 'expense') {
    return categories.value.filter(c => c.type === type || c.type === 'both')
  }

  return { categories, addCategory, updateCategory, deleteCategory, getCategoriesForType }
})