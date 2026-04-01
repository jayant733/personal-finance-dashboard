import type { Transaction } from '../types'

export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const shortCurrencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })
export const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number) {
  return shortCurrencyFormatter.format(value)
}

export function sumTransactions(transactions: Transaction[], type?: Transaction['type']) {
  return transactions.filter((transaction) => !type || transaction.type === type).reduce((total, transaction) => total + transaction.amount, 0)
}

export function getBalance(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => total + (transaction.type === 'income' ? transaction.amount : -transaction.amount), 0)
}

export function getCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<string, number>()
  transactions.filter((transaction) => transaction.type === 'expense').forEach((transaction) => {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount)
  })

  return [...totals.entries()].map(([category, total]) => ({ category, total })).sort((left, right) => right.total - left.total)
}

export function getMonthlyTotals(transactions: Transaction[]) {
  const totals = new Map<string, { income: number; expense: number }>()

  transactions.forEach((transaction) => {
    const key = transaction.date.slice(0, 7)
    const month = totals.get(key) ?? { income: 0, expense: 0 }
    if (transaction.type === 'income') month.income += transaction.amount
    else month.expense += transaction.amount
    totals.set(key, month)
  })

  return [...totals.entries()].map(([month, values]) => ({
    month,
    label: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' }),
    ...values,
  }))
}

export function getRunningBalanceSeries(transactions: Transaction[]) {
  let balance = 0
  return [...transactions].sort((left, right) => left.date.localeCompare(right.date)).map((transaction) => {
    balance += transaction.type === 'income' ? transaction.amount : -transaction.amount
    return {
      date: transaction.date,
      label: new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance,
    }
  })
}

export function downloadCsv(transactions: Transaction[]) {
  const rows = [
    ['Date', 'Description', 'Category', 'Type', 'Account', 'Amount'],
    ...transactions.map((transaction) => [transaction.date, transaction.description, transaction.category, transaction.type, transaction.account, transaction.amount.toString()]),
  ]

  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'finance-dashboard-transactions.csv'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
