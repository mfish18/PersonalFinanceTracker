import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserSettings } from '@/types/index'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<UserSettings>({
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    currency: 'CAD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system',
    notifications: {
      budgetAlerts: true,
      weeklyReport: false,
      monthlyReport: true,
    },
  })

  function updateSettings(updated: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...updated }
  }

  function updateNotifications(updated: Partial<UserSettings['notifications']>) {
    settings.value.notifications = { ...settings.value.notifications, ...updated }
  }

  return { settings, updateSettings, updateNotifications }
})