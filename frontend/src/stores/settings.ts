import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserSettings } from '@/types/index'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/index'

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()

  const settings = ref<UserSettings>({
    displayName: authStore.user?.display_name ?? '',
    email: authStore.user?.email ?? '',
    currency: authStore.user?.currency ?? 'USD',
    dateFormat: authStore.user?.date_format ?? 'MM/DD/YYYY',
    theme: 'system',
    notifications: {
      budgetAlerts: true,
      weeklyReport: false,
      monthlyReport: true,
    },
  })

  async function saveProfile(displayName: string, email: string) {
    const { data } = await api.put('/user/profile', { display_name: displayName, email })
    authStore.user = data
    settings.value.displayName = data.display_name
    settings.value.email = data.email
    localStorage.setItem('user', JSON.stringify(data))
  }

  async function savePreferences(currency: string, dateFormat: string) {
    const { data } = await api.put('/user/preferences', { currency, date_format: dateFormat })
    authStore.user = data
    settings.value.currency = data.currency
    settings.value.dateFormat = data.date_format
    localStorage.setItem('user', JSON.stringify(data))
  }

  function updateSettings(updated: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...updated }
  }

  function updateNotifications(updated: Partial<UserSettings['notifications']>) {
    settings.value.notifications = { ...settings.value.notifications, ...updated }
  }

  return { settings, saveProfile, savePreferences, updateSettings, updateNotifications }
})