import { useImpactData } from './hooks/useImpactData'
import MetricCards from './components/MetricCards'
import Leaderboard from './components/Leaderboard'
import RadarChart from './components/RadarChart'

export default function App() {
  const { loading, error, top5, metrics, since } = useImpactData()

  const dateRange = since
    ? `Last 90 days · ${since.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Loading...'

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Engineering impact — PostHog/posthog</h1>
        <span className="date-range">{dateRange}</span>
      </div>

      {!loading && !error && <MetricCards metrics={metrics} />}

      <div className="main-grid">
        <div className="card">
          <div className="card-title">Top 5 most impactful engineers</div>
          {loading && <div className="loading">Fetching GitHub data...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && !error && <Leaderboard top5={top5} />}
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-title">Impact score breakdown</div>
            {!loading && !error && top5.length > 0
              ? <RadarChart top5={top5} />
              : <div className="loading" style={{ padding: '1rem' }}>—</div>
            }
          </div>

          <div className="card methodology">
            <div className="card-title">How impact is scored</div>
            <p>Weighted composite across 5 signals — click any engineer to expand.</p>
            <ul className="signal-list" style={{ marginTop: 8 }}>
              {[
                ['#534AB7', 'PR complexity (30%)', 'log(additions + deletions + files×10)'],
                ['#1D9E75', 'Review depth (25%)', 'reviews left × comment quality weight'],
                ['#7F77DD', 'Breadth (15%)', 'distinct codebase areas touched'],
                ['#D85A30', 'Consistency (15%)', 'active weeks ÷ 13-week window'],
                ['#BA7517', 'Unblocking ratio (15%)', 'reviews given ÷ own PR count'],
              ].map(([color, label, desc]) => (
                <li key={label}>
                  <span className="dot" style={{ background: color }} />
                  <span><strong>{label}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <p className="last-updated">
              Data fetched live from GitHub API · {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
