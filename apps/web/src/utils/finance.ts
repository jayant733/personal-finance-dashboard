import type { CurrencyCode, Transaction } from '../types'

export const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

const exchangeRateByCurrency: Record<CurrencyCode, number> = {
  INR: 83.1,
  USD: 1,
  EUR: 0.92,
}

const localeByCurrency: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
}

function createCurrencyFormatter(currency: CurrencyCode, compact = false) {
  return new Intl.NumberFormat(localeByCurrency[currency], {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  })
}

export function formatCurrency(value: number, currency: CurrencyCode) {
  return createCurrencyFormatter(currency).format(value)
}

export function formatCompactCurrency(value: number, currency: CurrencyCode) {
  return createCurrencyFormatter(currency, true).format(value)
}

export function convertFromUsd(value: number, currency: CurrencyCode) {
  return value * exchangeRateByCurrency[currency]
}

export function sumTransactions(transactions: Transaction[], type?: Transaction['type']) {
  return transactions
    .filter((transaction) => !type || transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)
}

export function getBalance(transactions: Transaction[]) {
  return transactions.reduce(
    (total, transaction) => total + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0,
  )
}

export function getCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<string, number>()
  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount)
    })

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total)
}

export function getMonthlyTotals(transactions: Transaction[]) {
  const totals = new Map<string, { income: number; expense: number }>()

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.slice(0, 7)
    const monthSummary = totals.get(monthKey) ?? { income: 0, expense: 0 }
    if (transaction.type === 'income') monthSummary.income += transaction.amount
    else monthSummary.expense += transaction.amount
    totals.set(monthKey, monthSummary)
  })

  return [...totals.entries()].map(([month, values]) => ({
    month,
    label: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' }),
    ...values,
  }))
}

export function getRunningBalanceSeries(transactions: Transaction[]) {
  let balance = 0
  return [...transactions]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((transaction) => {
      balance += transaction.type === 'income' ? transaction.amount : -transaction.amount
      return {
        date: transaction.date,
        label: new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance,
      }
    })
}

export function calculateExpenseChange(currentExpense: number, previousExpense: number) {
  if (previousExpense <= 0) return currentExpense > 0 ? 1 : 0
  return (currentExpense - previousExpense) / previousExpense
}

export function getCategoryPeriodComparison(transactions: Transaction[], categoryName?: string) {
  if (!categoryName) return null

  const monthBuckets = new Map<string, number>()
  transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.category === categoryName)
    .forEach((transaction) => {
      const monthKey = transaction.date.slice(0, 7)
      monthBuckets.set(monthKey, (monthBuckets.get(monthKey) ?? 0) + transaction.amount)
    })

  const sortedPeriods = [...monthBuckets.entries()].sort((left, right) => left[0].localeCompare(right[0]))
  const currentPeriod = sortedPeriods.at(-1)?.[1] ?? 0
  const previousPeriod = sortedPeriods.at(-2)?.[1] ?? 0

  return {
    currentPeriod,
    previousPeriod,
    change: calculateExpenseChange(currentPeriod, previousPeriod),
  }
}

export function getInsightMessage({
  highestCategory,
  expenseChange,
  totalBalance,
  categoryChange,
}: {
  highestCategory?: { category: string; total: number }
  expenseChange: number
  totalBalance: number
  categoryChange?: number
}) {
  if (highestCategory && typeof categoryChange === 'number' && categoryChange > 0) {
    return `You spent ${percentFormatter.format(categoryChange)} more on ${highestCategory.category} compared to the last period.`
  }

  if (highestCategory && typeof categoryChange === 'number' && categoryChange < 0) {
    return `${highestCategory.category} spending dropped by ${percentFormatter.format(Math.abs(categoryChange))} compared to the last period.`
  }

  if (highestCategory && expenseChange > 0) {
    return `Your overall expenses increased ${percentFormatter.format(expenseChange)} versus the previous month.`
  }

  if (totalBalance < 0) {
    return 'Your balance is negative right now, so reducing short-term spend should be the first priority.'
  }

  return 'Your spending pattern is stable this period, with no major spikes across tracked categories.'
}

export function downloadCsv(transactions: Transaction[]) {
  const rows = [
    ['Date', 'Description', 'Category', 'Type', 'Account', 'Amount'],
    ...transactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.account,
      transaction.amount.toString(),
    ]),
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

export function downloadJson(transactions: Transaction[]) {
  const payload = JSON.stringify(transactions, null, 2)
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'finance-dashboard-transactions.json'
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
