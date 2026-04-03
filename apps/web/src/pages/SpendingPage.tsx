import { CategoryDonut } from '../components/charts/CategoryDonut'
import { CashflowBars } from '../components/charts/CashflowBars'
import { TopControls } from '../components/dashboard/TopControls'
import { RouteMeta } from '../components/seo/RouteMeta'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, formatCurrency } from '../utils/finance'

export function SpendingPage() {
  const {
    filteredTransactions,
    categories,
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
    categoryBreakdown,
    monthlySummary,
    highestSpendingCategory,
    insightMessage,
    asDisplayCurrency,
  } = useDashboard()

  return (
    <>
      <RouteMeta
        title="Spending"
        description="Category breakdown, monthly spending patterns, and expense insights for the finance dashboard."
        path="/spending"
      />
      <TopControls
        title="Spending"
        eyebrow="Analyze category trends and outliers"
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        currency={currency}
        setCurrency={setCurrency}
        themeChecked={theme === 'dark'}
        onThemeChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        onExport={() => downloadCsv(filteredTransactions)}
        range={range}
        setRange={setRange}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <section className="page-grid page-grid--spending">
        <article className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Spending mix</span>
              <h2>Category breakdown</h2>
            </div>
          </div>
          <CategoryDonut items={categoryBreakdown} currency={currency} />
        </article>

        <article className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Monthly comparison</span>
              <h2>Income vs expenses</h2>
            </div>
          </div>
          <CashflowBars data={monthlySummary} />
        </article>

        <article className="panel">
          <span className="eyebrow">Insight</span>
          <h2>What changed</h2>
          <p className="insight-copy">{insightMessage}</p>
          <ul className="insights-list">
            <li>
              <span>Highest category</span>
              <strong>{highestSpendingCategory?.category ?? 'N/A'}</strong>
            </li>
            <li>
              <span>Total spend</span>
              <strong>{formatCurrency(asDisplayCurrency(highestSpendingCategory?.total ?? 0), currency)}</strong>
            </li>
          </ul>
        </article>
      </section>
    </>
  )
}
