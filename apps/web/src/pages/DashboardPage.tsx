import { BalanceChart } from '../components/charts/BalanceChart'
import { CashflowBars } from '../components/charts/CashflowBars'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { Metric } from '../components/dashboard/Metric'
import { SummaryCard } from '../components/dashboard/SummaryCard'
import { TopControls } from '../components/dashboard/TopControls'
import { RouteMeta } from '../components/seo/RouteMeta'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, formatCompactCurrency, formatCurrency, percentFormatter } from '../utils/finance'

export function DashboardPage() {
  const {
    filteredTransactions,
    categories,
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
    totalIncome,
    totalExpense,
    totalBalance,
    savingsRate,
    monthVariance,
    categoryBreakdown,
    balanceSeries,
    monthlySummary,
    completion,
    hasNoTransactions,
    hasNoFilteredResults,
    resetFilters,
    asDisplayCurrency,
  } = useDashboard()

  return (
    <>
      <RouteMeta
        title="Financial Overview"
        description="Overview of balances, savings rate, category spending, and monthly cashflow for the finance dashboard."
        path="/"
      />

      <TopControls
        title="Financial Overview"
        eyebrow="Good Morning, Jayan"
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

      {loading ? (
        <section className="state-card">
          <div className="skeleton-shell" aria-hidden="true">
            <span className="skeleton-line skeleton-line--title" />
            <div className="skeleton-row">
              <span className="skeleton-card" />
              <span className="skeleton-card" />
              <span className="skeleton-card" />
            </div>
            <span className="skeleton-panel" />
          </div>
          <p>Loading financial overview...</p>
        </section>
      ) : hasNoTransactions ? (
        <section className="state-card">
          <h2>No transactions yet</h2>
          <p>Start by adding your first transaction on the transactions page to populate the overview.</p>
        </section>
      ) : hasNoFilteredResults ? (
        <section className="state-card">
          <h2>No transactions match this filter</h2>
          <p>Try widening the date range or clearing the search to repopulate the dashboard.</p>
          <button className="ghost-button" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </section>
      ) : (
        <>
          <section className="micro-summary">
            <article className="micro-summary__item">
              <span>Income</span>
              <strong>{formatCurrency(asDisplayCurrency(totalIncome), currency)}</strong>
            </article>
            <article className="micro-summary__item">
              <span>Expenses</span>
              <strong>{formatCurrency(asDisplayCurrency(totalExpense), currency)}</strong>
            </article>
            <article className="micro-summary__item">
              <span>Net</span>
              <strong className={totalBalance < 0 ? 'text-danger' : undefined}>
                {formatCurrency(asDisplayCurrency(totalBalance), currency)}
              </strong>
            </article>
            <article className="micro-summary__item">
              <span>Reserve</span>
              <strong>{formatCurrency(asDisplayCurrency(totalBalance * 0.34), currency)}</strong>
            </article>
          </section>

          <section className="hero-grid">
            <article className="balance-card">
              <div className="balance-card__header">
                <div>
                  <span>Balance</span>
                  <strong className={totalBalance < 0 ? 'text-danger' : undefined}>
                    {formatCurrency(asDisplayCurrency(totalBalance), currency)}
                  </strong>
                </div>
                <span className={`badge ${totalBalance < 0 || monthVariance > 0 ? 'is-warning' : 'is-positive'}`}>
                  {totalBalance < 0 ? 'Negative balance' : monthVariance <= 0 ? 'Improving' : 'Watch spend'}
                </span>
              </div>

              <div className="sparkline">
                <BalanceChart series={balanceSeries} />
              </div>

              <div className="balance-card__footer">
                <Metric label="Savings rate" value={percentFormatter.format(savingsRate)} trend="up" />
                <Metric label="Month on month" value={percentFormatter.format(Math.abs(monthVariance))} trend={monthVariance <= 0 ? 'up' : 'down'} />
                <Metric label="Goal progress" value={percentFormatter.format(Math.max(0, completion))} trend={completion >= 0 ? 'up' : 'down'} />
              </div>
            </article>

            <SummaryCard label="Checking" value={formatCurrency(asDisplayCurrency(totalIncome), currency)} tone="success" detail="Income over selected period" />
            <SummaryCard label="Savings" value={formatCurrency(asDisplayCurrency(totalExpense), currency)} tone="danger" detail="Expenses over selected period" />
            <SummaryCard
              label="Cashflow"
              value={formatCurrency(
                asDisplayCurrency(
                  filteredTransactions
                    .filter((transaction) => transaction.category === 'Investments')
                    .reduce((sum, transaction) => sum + transaction.amount, 0),
                ),
                currency,
              )}
              tone="info"
              detail="Brokerage and fund activity"
            />
            <SummaryCard label="Cash reserve" value={formatCurrency(asDisplayCurrency(totalBalance * 0.34), currency)} tone="neutral" detail="Instant access savings" />
          </section>

          <section className="content-grid content-grid--overview">
            <article className="panel panel--wide">
              <div className="panel__heading">
                <div>
                  <span className="eyebrow">Portfolio trend</span>
                  <h2>Balance history</h2>
                </div>
                <strong>{formatCompactCurrency(asDisplayCurrency(totalBalance), currency)}</strong>
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
              <CategoryDonut items={categoryBreakdown} currency={currency} />
            </article>

            <article className="panel">
              <div className="panel__heading">
                <div>
                  <span className="eyebrow">Monthly cashflow</span>
                  <h2>Income vs expenses</h2>
                </div>
              </div>
              <CashflowBars data={monthlySummary} />
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
        </>
      )}
    </>
  )
}
