export function BalanceChart({
  series,
  large = false,
}: {
  series: Array<{ label: string; balance: number }>
  large?: boolean
}) {
  if (series.length === 0) return <div className="chart-empty">No chart data</div>

  const width = 720
  const height = large ? 260 : 120
  const values = series.map((item) => item.balance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const normalizeY = (value: number) =>
    min === max ? height / 2 : height - ((value - min) / (max - min)) * (height - 24) - 12
  const points = series
    .map((item, index) => `${(index / Math.max(series.length - 1, 1)) * width},${normalizeY(item.balance)}`)
    .join(' ')
  const fillPoints = `${points} ${width},${height} 0,${height}`

  return (
    <svg
      className={`balance-chart ${large ? 'is-large' : ''}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {[0.2, 0.4, 0.6, 0.8].map((step) => (
        <line
          key={step}
          x1="0"
          x2={width}
          y1={height * step}
          y2={height * step}
          stroke="currentColor"
          strokeOpacity="0.08"
        />
      ))}
      <polygon points={fillPoints} className="balance-chart__area" />
      <polyline points={points} className="balance-chart__line" />
    </svg>
  )
}
