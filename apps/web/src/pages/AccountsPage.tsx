import { RouteMeta } from '../components/seo/RouteMeta'
import { TopControls } from '../components/dashboard/TopControls'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, formatCurrency } from '../utils/finance'

export function AccountsPage() {
  const {
    filteredTransactions,
    accounts,
    role,
    setRole,
    theme,
    setTheme,
    currency,
    setCurrency,
    search,
    setSearch,
    asDisplayCurrency,
  } = useDashboard()

  const accountNotes: Record<string, string> = {
    'SBI Savings': 'Primary salary and day-to-day banking activity.',
    'HDFC Savings': 'Freelance income and medium-term cash buffer.',
    Zerodha: 'Investment and redemption activity for the selected period.',
    'HDFC Credit Card': 'Card spend across shopping, dining, health, and travel.',
    'Metro Card': 'Transit and local mobility costs.',
  }

  const accountCards = accounts.map((accountName) => ({
    name: accountName,
    amount: filteredTransactions
      .filter((transaction) => transaction.account === accountName)
      .reduce(
        (total, transaction) => total + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
        0,
      ),
    note: accountNotes[accountName] ?? 'Activity summary for the selected filters.',
  }))

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

      <section className="page-grid page-grid--two page-grid--accounts">
        {accountCards.map((account, index) => (
          <article key={account.name} className={`panel account-card ${index === 0 ? 'account-card--featured' : ''}`}>
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
