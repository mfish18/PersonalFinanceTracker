export interface Transaction {
  id: number
  amount: number
  category: string
  description: string
  date: string
  type: 'income' | 'expense'
}

export interface Category {
  id: number
  name: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export interface Budget {
  id: number
  category_id: number
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