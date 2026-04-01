import { startTransition, useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { seedTransactions } from './data/transactions'
import type { ThemeMode, Transaction, TransactionType, UserRole } from './types'
import {
  downloadCsv,
  formatCompactCurrency,
  formatCurrency,
  getBalance,
  getCategoryTotals,
  getMonthlyTotals,
  getRunningBalanceSeries,
  percentFormatter,
  sumTransactions,
} from './utils/finance'

type FilterRange = 'all' | '30d' | '90d' | 'ytd'

type DraftTransaction = {
  amount: string
  category: string
  type: TransactionType
  description: string
  account: string
}

const sidebarItems = ['Overview', 'Accounts', 'Spending', 'Transactions', 'Goals', 'Settings']
const categoryPalette = ['#63d7c7', '#8be28d', '#f9c87a', '#f49183', '#85a7ff', '#d2d8e9']
const initialDraft: DraftTransaction = { amount: '', category: 'Groceries', type: 'expense', description: '', account: 'Primary checking' }

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole>('admin')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [range, setRange] = useState<FilterRange>('90d')
  const [category, setCategory] = useState('All categories')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [draft, setDraft] = useState<DraftTransaction>(initialDraft)

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

  const categories = useMemo(() => ['All categories', ...new Set(seedTransactions.map((transaction) => transaction.category))], [])

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
  const monthVariance = currentMonth && priorMonth && priorMonth.expense > 0 ? (currentMonth.expense - priorMonth.expense) / priorMonth.expense : 0
  const categoryTotals = getCategoryTotals(filteredTransactions).slice(0, 5)
  const balanceSeries = getRunningBalanceSeries(filteredTransactions)
  const monthlyTotals = getMonthlyTotals(filteredTransactions)
  const recentTransactions = [...filteredTransactions].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 8)
  const highestSpendingCategory = categoryTotals[0]
  const netWorthGoal = 42000
  const completion = Math.min(totalBalance / netWorthGoal, 1)

  function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (role !== 'admin') return
    const amount = Number(draft.amount)
    if (!amount || !draft.description.trim()) {
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
    setDraft(initialDraft)
    setToast('Transaction added successfully.')
  }

  function handleDeleteTransaction(transactionId: string) {
    if (role !== 'admin') return
    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId))
    setToast('Transaction removed.')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">◔</div>
          <div>
            <p>Finless</p>
            <span>Personal finance</span>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          {sidebarItems.map((item, index) => (
            <button key={item} className={`sidebar__item ${index === 0 ? 'is-active' : ''}`} type="button">
              <span className="sidebar__bullet" />
              {item}
            </button>
          ))}
        </nav>

        <section className="sidebar__card">
          <p>Help center</p>
          <strong>24/7</strong>
          <span>Talk to support about unusual spending patterns.</span>
          <div className="progress">
            <span style={{ width: '68%' }} />
          </div>
        </section>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <span className="eyebrow">Good Morning, Jayan</span>
            <h1>Overview dashboard</h1>
          </div>

          <div className="topbar__actions">
            <label className="field field--search">
              <span>Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" />
            </label>

            <label className="field">
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>

            <label className="switch">
              <input type="checkbox" checked={theme === 'dark'} onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')} />
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </label>

            <button className="ghost-button" type="button" onClick={() => downloadCsv(filteredTransactions)}>
              Export CSV
            </button>
          </div>
        </header>

        <section className="filters">
          <div className="pill-group" role="tablist" aria-label="Date ranges">
            {(['30d', '90d', 'ytd', 'all'] as FilterRange[]).map((item) => (
              <button key={item} className={`pill ${range === item ? 'is-active' : ''}`} type="button" onClick={() => setRange(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <section className="state-card">
            <div className="spinner" aria-hidden="true" />
            <p>Loading financial overview...</p>
          </section>
        ) : filteredTransactions.length === 0 ? (
          <section className="state-card">
            <h2>No transactions match this filter</h2>
            <p>Try widening the date range or clearing the search to repopulate the dashboard.</p>
          </section>
        ) : (
          <>
            <section className="hero-grid">
              <article className="balance-card">
                <div className="balance-card__header">
                  <div>
                    <span>Balance</span>
                    <strong>{formatCurrency(totalBalance)}</strong>
                  </div>
                  <span className={`badge ${monthVariance <= 0 ? 'is-positive' : 'is-warning'}`}>{monthVariance <= 0 ? 'Improving' : 'Watch spend'}</span>
                </div>

                <div className="sparkline">
                  <BalanceChart series={balanceSeries} />
                </div>

                <div className="balance-card__footer">
                  <Metric label="Savings rate" value={percentFormatter.format(savingsRate)} trend="up" />
                  <Metric label="Month on month" value={percentFormatter.format(Math.abs(monthVariance))} trend={monthVariance <= 0 ? 'up' : 'down'} />
                  <Metric label="Goal progress" value={percentFormatter.format(completion)} trend="up" />
                </div>
              </article>

              <SummaryCard label="Checking" value={formatCurrency(totalIncome)} tone="success" detail="Income over selected period" />
              <SummaryCard label="Savings" value={formatCurrency(totalExpense)} tone="danger" detail="Expenses over selected period" />
              <SummaryCard
                label="Cashflow"
                value={formatCurrency(filteredTransactions.filter((transaction) => transaction.category === 'Investments').reduce((sum, transaction) => sum + transaction.amount, 0))}
                tone="info"
                detail="Brokerage and fund activity"
              />
              <SummaryCard label="Cash reserve" value={formatCurrency(totalBalance * 0.34)} tone="neutral" detail="Instant access savings" />
            </section>

            <section className="content-grid">
              <article className="panel panel--wide">
                <div className="panel__heading">
                  <div>
                    <span className="eyebrow">Portfolio trend</span>
                    <h2>Balance history</h2>
                  </div>
                  <strong>{formatCompactCurrency(totalBalance)}</strong>
                </div>
                <BalanceChart series={balanceSeries} large />
              </article>

              <article className="panel">
                <div className="panel__heading">
                  <div>
                    <span className="eyebrow">Spending mix</span>
                    <h2>Top categories</h2>
                  </div>
                </div>
                <CategoryDonut items={categoryTotals} />
              </article>

              <article className="panel">
                <div className="panel__heading">
                  <div>
                    <span className="eyebrow">Monthly cashflow</span>
                    <h2>Income vs expenses</h2>
                  </div>
                </div>
                <CashflowBars data={monthlyTotals} />
              </article>

              <article className="panel panel--promo">
                <span className="eyebrow">Smart insight</span>
                <h2>Keep your emergency fund above 6 months of spend.</h2>
                <p>You are currently covering roughly {Math.max(1, Math.round(totalBalance / (totalExpense / 3 || 1)))} months with your reserve.</p>
                <button className="solid-button" type="button">
                  Review plan
                </button>
              </article>
            </section>

            <section className="lower-grid">
              <article className="panel panel--form">
                <div className="panel__heading">
                  <div>
                    <span className="eyebrow">Admin controls</span>
                    <h2>Add a transaction</h2>
                  </div>
                  <span className={`badge ${role === 'admin' ? 'is-positive' : ''}`}>{role === 'admin' ? 'Editable' : 'Viewer locked'}</span>
                </div>

                <form className="transaction-form" onSubmit={handleCreateTransaction}>
                  <label className="field">
                    <span>Description</span>
                    <input value={draft.description} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Add a note" />
                  </label>

                  <label className="field">
                    <span>Amount</span>
                    <input type="number" value={draft.amount} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" />
                  </label>

                  <label className="field">
                    <span>Type</span>
                    <select value={draft.type} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as TransactionType }))}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Category</span>
                    <select value={draft.category} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                      {categories.filter((item) => item !== 'All categories').map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Account</span>
                    <select value={draft.account} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, account: event.target.value }))}>
                      <option>Primary checking</option>
                      <option>Savings account</option>
                      <option>Credit card</option>
                      <option>Brokerage</option>
                      <option>Travel card</option>
                    </select>
                  </label>

                  <button className="solid-button" type="submit" disabled={role !== 'admin'}>
                    Add transaction
                  </button>
                </form>
              </article>

              <article className="panel">
                <div className="panel__heading">
                  <div>
                    <span className="eyebrow">Insights</span>
                    <h2>What changed</h2>
                  </div>
                </div>
                <ul className="insights-list">
                  <li>
                    <span>Highest spending category</span>
                    <strong>{highestSpendingCategory?.category ?? 'N/A'}</strong>
                  </li>
                  <li>
                    <span>Total category spend</span>
                    <strong>{formatCurrency(highestSpendingCategory?.total ?? 0)}</strong>
                  </li>
                  <li>
                    <span>Current savings rate</span>
                    <strong>{percentFormatter.format(savingsRate)}</strong>
                  </li>
                  <li>
                    <span>Role mode</span>
                    <strong>{role === 'admin' ? 'Full access' : 'Read only'}</strong>
                  </li>
                </ul>
              </article>
            </section>

            <section className="panel">
              <div className="panel__heading">
                <div>
                  <span className="eyebrow">Recent activity</span>
                  <h2>Transactions</h2>
                </div>
                <strong>{recentTransactions.length} rows</strong>
              </div>

              <div className="table-wrap">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.category}</td>
                        <td>{transaction.account}</td>
                        <td>
                          <span className={`table-badge ${transaction.type === 'income' ? 'is-income' : 'is-expense'}`}>{transaction.type}</span>
                        </td>
                        <td className={transaction.type === 'income' ? 'amount amount--positive' : 'amount'}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>
                          <button className="table-action" type="button" disabled={role !== 'admin'} onClick={() => handleDeleteTransaction(transaction.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'success' | 'danger' | 'info' | 'neutral' }) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function Metric({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={trend === 'up' ? 'trend-up' : 'trend-down'}>{trend === 'up' ? 'Positive move' : 'Needs attention'}</small>
    </div>
  )
}

function BalanceChart({ series, large = false }: { series: Array<{ label: string; balance: number }>; large?: boolean }) {
  if (series.length === 0) return <div className="chart-empty">No chart data</div>

  const width = 720
  const height = large ? 260 : 120
  const values = series.map((item) => item.balance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const normalizeY = (value: number) => (min === max ? height / 2 : height - ((value - min) / (max - min)) * (height - 24) - 12)
  const points = series.map((item, index) => `${(index / Math.max(series.length - 1, 1)) * width},${normalizeY(item.balance)}`).join(' ')
  const fillPoints = `${points} ${width},${height} 0,${height}`

  return (
    <svg className={`balance-chart ${large ? 'is-large' : ''}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[0.2, 0.4, 0.6, 0.8].map((step) => (
        <line key={step} x1="0" x2={width} y1={height * step} y2={height * step} stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <polygon points={fillPoints} className="balance-chart__area" />
      <polyline points={points} className="balance-chart__line" />
    </svg>
  )
}

function CategoryDonut({ items }: { items: Array<{ category: string; total: number }> }) {
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const segments = items.map((item) => (total === 0 ? 0 : (item.total / total) * 263.89))
  const offsets = segments.map((_, index) => segments.slice(0, index).reduce((sum, value) => sum + value + 6, 0))

  return (
    <div className="donut-card">
      <svg viewBox="0 0 120 120" className="donut-chart">
        <circle cx="60" cy="60" r="42" className="donut-chart__track" />
        {items.map((item, index) => {
          const segment = segments[index]
          return (
            <circle
              key={item.category}
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke={categoryPalette[index % categoryPalette.length]}
              strokeWidth="12"
              strokeDasharray={`${segment} ${263.89 - segment}`}
              strokeDashoffset={-offsets[index]}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          )
        })}
        <text x="60" y="56" textAnchor="middle" className="donut-chart__amount">
          {formatCompactCurrency(total)}
        </text>
        <text x="60" y="72" textAnchor="middle" className="donut-chart__label">
          Expenses
        </text>
      </svg>

      <ul className="donut-legend">
        {items.map((item, index) => (
          <li key={item.category}>
            <span className="swatch" style={{ backgroundColor: categoryPalette[index % categoryPalette.length] }} />
            <span>{item.category}</span>
            <strong>{formatCurrency(item.total)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CashflowBars({ data }: { data: Array<{ month: string; label: string; income: number; expense: number }> }) {
  const highest = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1)

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div key={item.month} className="bar-chart__group">
          <div className="bar-chart__bars">
            <span style={{ height: `${(item.income / highest) * 100}%` }} className="bar-chart__bar is-income" />
            <span style={{ height: `${(item.expense / highest) * 100}%` }} className="bar-chart__bar is-expense" />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  )
}

export default App
