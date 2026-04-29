import { useSettingsStore } from '@/stores/settings'

export function useCurrency() {
  const settingsStore = useSettingsStore()

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settingsStore.settings.currency,
    }).format(amount)
  }

  function formatWithSign(amount: number, type: 'income' | 'expense') {
    const formatted = formatAmount(Math.abs(amount))
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  return { formatAmount, formatWithSign }
}