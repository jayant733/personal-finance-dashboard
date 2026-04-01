export function SummaryCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail: string
  tone: 'success' | 'danger' | 'info' | 'neutral'
}) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}
