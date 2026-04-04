/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  startTransition,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  initialDraftTransaction,
  type DraftTransaction,
  type FilterRange,
} from '../constants/dashboard'
import { seedTransactions } from '../data/transactions'
import type { CurrencyCode, ThemeMode, Transaction, UserRole } from '../types'
import {
  calculateExpenseChange,
  convertFromUsd,
  getBalance,
  getCategoryPeriodComparison,
  getCategoryTotals,
  getInsightMessage,
  getMonthlyTotals,
  getRunningBalanceSeries,
  sumTransactions,
} from '../utils/finance'

type DashboardContextValue = {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  categories: string[]
  accounts: string[]
  loading: boolean
  role: UserRole
  setRole: (role: UserRole) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  range: FilterRange
  setRange: (range: FilterRange) => void
  category: string
  setCategory: (category: string) => void
  search: string
  setSearch: (search: string) => void
  toast: string
  setToast: (toast: string) => void
  draft: DraftTransaction
  setDraft: Dispatch<SetStateAction<DraftTransaction>>
  totalIncome: number
  totalExpense: number
  totalBalance: number
  savingsRate: number
  monthVariance: number
  categoryBreakdown: Array<{ category: string; total: number }>
  balanceSeries: Array<{ date: string; label: string; balance: number }>
  monthlySummary: Array<{ month: string; label: string; income: number; expense: number }>
  recentTransactions: Transaction[]
  highestSpendingCategory?: { category: string; total: number }
  completion: number
  hasNoTransactions: boolean
  hasNoFilteredResults: boolean
  insightMessage: string
  netWorthGoal: number
  asDisplayCurrency: (value: number) => number
  handleCreateTransaction: (event: FormEvent<HTMLFormElement>) => void
  handleDeleteTransaction: (transactionId: string) => void
  resetFilters: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('admin')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [currency, setCurrency] = useState<CurrencyCode>('INR')
  const [range, setRange] = useState<FilterRange>('90d')
  const [category, setCategory] = useState('All categories')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [draft, setDraft] = useState<DraftTransaction>(initialDraftTransaction)

  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => {
        setTransactions(seedTransactions)
        setLoading(false)
      })
    }, 900)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const categories = useMemo(
    () => ['All categories', ...new Set(seedTransactions.map((transaction) => transaction.category))],
    [],
  )
  const accounts = useMemo(() => [...new Set(seedTransactions.map((transaction) => transaction.account))], [])

  const filteredTransactions = useMemo(() => {
    const now = new Date('2026-04-15')
    let startDate = new Date('2026-01-01')

    if (range === '30d') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
    }

    if (range === '90d') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 90)
    }

    return transactions.filter((transaction) => {
      const matchesRange = range === 'all' ? true : new Date(transaction.date) >= startDate
      const matchesCategory = category === 'All categories' || transaction.category === category
      const matchesSearch =
        deferredSearch.length === 0 ||
        transaction.description.toLowerCase().includes(deferredSearch) ||
        transaction.category.toLowerCase().includes(deferredSearch) ||
        transaction.account.toLowerCase().includes(deferredSearch)

      return matchesRange && matchesCategory && matchesSearch
    })
  }, [category, deferredSearch, range, transactions])

  const totalIncome = sumTransactions(filteredTransactions, 'income')
  const totalExpense = sumTransactions(filteredTransactions, 'expense')
  const totalBalance = getBalance(filteredTransactions)
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0
  const previousMonth = getMonthlyTotals(transactions).slice(-2)
  const currentMonth = previousMonth.at(-1)
  const priorMonth = previousMonth.at(-2)
  const monthVariance = calculateExpenseChange(currentMonth?.expense ?? 0, priorMonth?.expense ?? 0)
  const categoryBreakdown = getCategoryTotals(filteredTransactions).slice(0, 5)
  const balanceSeries = getRunningBalanceSeries(filteredTransactions)
  const monthlySummary = getMonthlyTotals(filteredTransactions)
  const recentTransactions = [...filteredTransactions]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 8)
  const highestSpendingCategory = categoryBreakdown[0]
  const netWorthGoal = 42000
  const completion = Math.min(totalBalance / netWorthGoal, 1)
  const hasNoTransactions = transactions.length === 0
  const hasNoFilteredResults = !hasNoTransactions && filteredTransactions.length === 0
  const categoryComparison = getCategoryPeriodComparison(transactions, highestSpendingCategory?.category)
  const insightMessage = getInsightMessage({
    highestCategory: highestSpendingCategory,
    expenseChange: monthVariance,
    totalBalance,
    categoryChange: categoryComparison?.change,
  })

  function asDisplayCurrency(value: number) {
    return convertFromUsd(value, currency)
  }

  function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (role !== 'admin') return
    const amount = Number(draft.amount)
    if (!Number.isFinite(amount) || amount <= 0 || !draft.description.trim()) {
      setToast('Add a description and amount to create a transaction.')
      return
    }

    const newTransaction: Transaction = {
      id: `txn-${crypto.randomUUID()}`,
      date: '2026-04-15',
      amount,
      category: draft.category,
      type: draft.type,
      description: draft.description.trim(),
      account: draft.account,
    }

    setTransactions((current) => [newTransaction, ...current])
    setDraft(initialDraftTransaction)
    setToast('Transaction added successfully.')
  }

  function handleDeleteTransaction(transactionId: string) {
    if (role !== 'admin') return
    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId))
    setToast('Transaction removed.')
  }

  function resetFilters() {
    setSearch('')
    setCategory('All categories')
    setRange('all')
  }

  return (
    <DashboardContext.Provider
      value={{
        transactions,
        filteredTransactions,
        categories,
        accounts,
        loading,
        role,
        setRole,
        theme,
        setTheme,
        currency,
        setCurrency,
        range,
        setRange,
        category,
        setCategory,
        search,
        setSearch,
        toast,
        setToast,
        draft,
        setDraft,
        totalIncome,
        totalExpense,
        totalBalance,
        savingsRate,
        monthVariance,
        categoryBreakdown,
        balanceSeries,
        monthlySummary,
        recentTransactions,
        highestSpendingCategory,
        completion,
        hasNoTransactions,
        hasNoFilteredResults,
        insightMessage,
        netWorthGoal,
        asDisplayCurrency,
        handleCreateTransaction,
        handleDeleteTransaction,
        resetFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used inside DashboardProvider')
  }
  return context
}
