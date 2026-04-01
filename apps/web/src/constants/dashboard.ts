import type { TransactionType } from '../types'

export type FilterRange = 'all' | '30d' | '90d' | 'ytd'

export type DraftTransaction = {
  amount: string
  category: string
  type: TransactionType
  description: string
  account: string
}

export const sidebarItems = ['Overview', 'Accounts', 'Spending', 'Transactions', 'Goals', 'Settings']

export const categoryPalette = ['#63d7c7', '#8be28d', '#f9c87a', '#f49183', '#85a7ff', '#d2d8e9']

export const initialDraftTransaction: DraftTransaction = {
  amount: '',
  category: 'Groceries',
  type: 'expense',
  description: '',
  account: 'Primary checking',
}
