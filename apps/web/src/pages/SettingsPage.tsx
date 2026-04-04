import { RouteMeta } from '../components/seo/RouteMeta'
import { TopControls } from '../components/dashboard/TopControls'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv } from '../utils/finance'

export function SettingsPage() {
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
  } = useDashboard()

  return (
    <>
      <RouteMeta
        title="Settings"
        description="Dashboard preferences page for role mode, theme, currency, and export actions."
        path="/settings"
      />
      <TopControls
        title="Settings"
        eyebrow="Manage dashboard preferences and export behavior"
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
          <span className="eyebrow">Appearance</span>
          <h2>Theme mode</h2>
          <p className="panel-copy">Toggle between dark and light themes using the global switch in the page header.</p>
        </article>
        <article className="panel panel--centered">
          <span className="eyebrow">Localization</span>
          <h2>Currency</h2>
          <p className="panel-copy">Switch between INR, USD, and EUR with real value conversion applied across the dashboard.</p>
        </article>
      </section>
    </>
  )
}
