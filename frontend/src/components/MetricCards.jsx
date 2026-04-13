export default function MetricCards({ metrics }) {
  const cards = [
    { label: 'PRs merged', value: metrics.prs.toLocaleString() },
    { label: 'Active contributors', value: metrics.contributors },
    { label: 'Reviews given (est.)', value: metrics.reviews.toLocaleString() },
    { label: 'Avg PR size (lines)', value: metrics.avgSize.toLocaleString() },
  ]

  return (
    <div className="metrics-grid">
      {cards.map(c => (
        <div key={c.label} className="metric-card">
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
