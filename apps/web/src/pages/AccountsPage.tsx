import { RouteMeta } from '../components/seo/RouteMeta'
import { TopControls } from '../components/dashboard/TopControls'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, formatCurrency } from '../utils/finance'

export function AccountsPage() {
  const {
    filteredTransactions,
    role,
    setRole,
    theme,
    setTheme,
    currency,
    setCurrency,
    search,
    setSearch,
    totalIncome,
    totalExpense,
    totalBalance,
    asDisplayCurrency,
  } = useDashboard()

  const accounts = [
    { name: 'Primary checking', amount: totalIncome * 0.54, note: 'Daily transactions and salary credits' },
    { name: 'Savings account', amount: totalBalance * 0.21, note: 'Emergency fund and buffer cash' },
    { name: 'Brokerage', amount: filteredTransactions.filter((t) => t.account === 'Brokerage').reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0), note: 'Long-term investment activity' },
    { name: 'Credit card', amount: totalExpense * 0.37, note: 'Rolling monthly expenses' },
  ]

  return (
    <>
      <RouteMeta
        title="Accounts"
        description="Account-level view of checking, savings, brokerage, and card balances in the finance dashboard."
        path="/accounts"
      />
      <TopControls
        title="Accounts"
        eyebrow="Track balances by account"
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        currency={currency}
        setCurrency={setCurrency}
        themeChecked={theme === 'dark'}
        onThemeChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        onExport={() => downloadCsv(filteredTransactions)}
      />

      <section className="page-grid page-grid--two">
        {accounts.map((account) => (
          <article key={account.name} className="panel">
            <span className="eyebrow">Account snapshot</span>
            <h2>{account.name}</h2>
            <strong className="page-value">{formatCurrency(asDisplayCurrency(account.amount), currency)}</strong>
            <p className="panel-copy">{account.note}</p>
          </article>
        ))}
      </section>
    </>
  )
}
