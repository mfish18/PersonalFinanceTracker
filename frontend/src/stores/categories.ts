import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/index'
import type { Category } from '@/types/index'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      const { data } = await api.get<Category[]>('/categories')
      categories.value = data
    } finally {
      loading.value = false
    }
  }

  async function addCategory(c: Omit<Category, 'id'>) {
    const { data } = await api.post<Category>('/categories', c)
    categories.value.push(data)
  }

  async function updateCategory(updated: Category) {
    const { data } = await api.put<Category>(`/categories/${updated.id}`, updated)
    const index = categories.value.findIndex(c => c.id === updated.id)
    if (index !== -1) categories.value[index] = data
  }

  async function deleteCategory(id: number) {
    await api.delete(`/categories/${id}`)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function getCategoriesForType(type: 'income' | 'expense') {
    return categories.value.filter(c => c.type === type || c.type === 'both')
  }

  return { categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory, getCategoriesForType }
})