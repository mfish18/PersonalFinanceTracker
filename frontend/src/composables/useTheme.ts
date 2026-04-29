import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const settingsStore = useSettingsStore()

  function applyTheme(theme: string) {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  watch(() => settingsStore.settings.theme, applyTheme, { immediate: true })

  return { applyTheme }
}