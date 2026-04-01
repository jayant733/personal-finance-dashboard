import type { CurrencyCode } from '../../types'
import { categoryPalette } from '../../constants/dashboard'
import { formatCompactCurrency, formatCurrency } from '../../utils/finance'

export function CategoryDonut({
  items,
  currency,
}: {
  items: Array<{ category: string; total: number }>
  currency: CurrencyCode
}) {
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
          {formatCompactCurrency(total, currency)}
        </text>
        <text x="60" y="72" textAnchor="middle" className="donut-chart__label">
          Expenses
        </text>
      </svg>

      <ul className="donut-legend">
        {items.map((item, index) => (
          <li key={item.category}>
            <span
              className="swatch"
              style={{ backgroundColor: categoryPalette[index % categoryPalette.length] }}
            />
            <span>{item.category}</span>
            <strong>{formatCurrency(item.total, currency)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
