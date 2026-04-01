export function Metric({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend: 'up' | 'down'
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={trend === 'up' ? 'trend-up' : 'trend-down'}>
        {trend === 'up' ? 'Positive move' : 'Needs attention'}
      </small>
    </div>
  )
}
