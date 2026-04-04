import { RouteMeta } from '../components/seo/RouteMeta'
import { TopControls } from '../components/dashboard/TopControls'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, formatCurrency, percentFormatter } from '../utils/finance'

export function GoalsPage() {
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
    totalBalance,
    totalExpense,
    completion,
    netWorthGoal,
    asDisplayCurrency,
  } = useDashboard()

  const averageMonthlyExpense = totalExpense / 3
  const runwayMonths =
    averageMonthlyExpense <= 0
      ? totalBalance > 0
        ? '12+ months'
        : '0 months'
      : `${Math.max(1, Math.round(totalBalance / averageMonthlyExpense))} months`

  return (
    <>
      <RouteMeta
        title="Goals"
        description="Financial goals page with reserve targets, savings progress, and planning signals."
        path="/goals"
      />
      <TopControls
        title="Goals"
        eyebrow="Track your progress against savings targets"
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
        <article className="panel panel--centered">
          <span className="eyebrow">Goal progress</span>
          <h2>Net worth target</h2>
          <strong className="page-value">{formatCurrency(asDisplayCurrency(netWorthGoal), currency)}</strong>
          <p className="panel-copy">Current completion: {percentFormatter.format(Math.max(0, completion))}</p>
        </article>

        <article className="panel panel--centered">
          <span className="eyebrow">Emergency fund</span>
          <h2>Runway coverage</h2>
          <strong className="page-value">{runwayMonths}</strong>
          <p className="panel-copy">Reserve available: {formatCurrency(asDisplayCurrency(totalBalance * 0.34), currency)}</p>
        </article>
      </section>
    </>
  )
}
