export interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: 'income' | 'expense'
}

export interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  month: string
}

export interface UserSettings {
  displayName: string
  email: string
  currency: string
  dateFormat: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    budgetAlerts: boolean
    weeklyReport: boolean
    monthlyReport: boolean
  }
}