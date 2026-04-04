import { supportedCurrencies, type FilterRange } from '../../constants/dashboard'
import type { CurrencyCode, UserRole } from '../../types'

type Props = {
  title: string
  eyebrow: string
  search: string
  setSearch: (value: string) => void
  role: UserRole
  setRole: (role: UserRole) => void
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  themeChecked: boolean
  onThemeChange: (checked: boolean) => void
  onExportCsv: () => void
  onExportJson: () => void
  range?: FilterRange
  setRange?: (range: FilterRange) => void
  category?: string
  setCategory?: (category: string) => void
  categories?: string[]
}

export function TopControls({
  title,
  eyebrow,
  search,
  setSearch,
  role,
  setRole,
  currency,
  setCurrency,
  themeChecked,
  onThemeChange,
  onExportCsv,
  onExportJson,
  range,
  setRange,
  category,
  setCategory,
  categories,
}: Props) {
  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
        </div>

        <div className="topbar__actions">
          <label className="field field--search">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions"
              aria-label="Search transactions"
            />
          </label>

          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>

          <label className="field">
            <span>Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}>
              {supportedCurrencies.map((supportedCurrency) => (
                <option key={supportedCurrency} value={supportedCurrency}>
                  {supportedCurrency}
                </option>
              ))}
            </select>
          </label>

          <label className="switch">
            <input type="checkbox" checked={themeChecked} onChange={(event) => onThemeChange(event.target.checked)} />
            <span>{themeChecked ? 'Dark' : 'Light'}</span>
          </label>

          <button className="ghost-button" type="button" onClick={onExportCsv}>
            Export CSV
          </button>

          <button className="ghost-button" type="button" onClick={onExportJson}>
            Export JSON
          </button>
        </div>
      </header>

      {typeof range !== 'undefined' && setRange && category && setCategory && categories ? (
        <section className="filters">
          <div className="pill-group" role="tablist" aria-label="Date ranges">
            {(['30d', '90d', 'ytd', 'all'] as FilterRange[]).map((item) => (
              <button
                key={item}
                className={`pill ${range === item ? 'is-active' : ''}`}
                type="button"
                onClick={() => setRange(item)}
              >
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
      ) : null}
    </>
  )
}
