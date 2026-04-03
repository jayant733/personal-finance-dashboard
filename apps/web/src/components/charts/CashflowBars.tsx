export function CashflowBars({
  data,
}: {
  data: Array<{ month: string; label: string; income: number; expense: number }>
}) {
  if (data.length === 0) {
    return <div className="chart-empty chart-empty--large">No cashflow data for the current filter.</div>
  }

  const highest = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1)

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div key={item.month} className="bar-chart__group">
          <div className="bar-chart__bars">
            <span
              style={{ height: `${(item.income / highest) * 100}%` }}
              className="bar-chart__bar is-income"
            />
            <span
              style={{ height: `${(item.expense / highest) * 100}%` }}
              className="bar-chart__bar is-expense"
            />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  )
}
