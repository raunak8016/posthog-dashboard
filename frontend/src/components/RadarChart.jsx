import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { displayName } from '../lib/scoring'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const COLORS = ['#534AB7', '#1D9E75', '#D85A30']

export default function RadarChart({ top5 }) {
  const top3 = top5.slice(0, 3)
  const labels = ['Complexity', 'Review depth', 'Breadth', 'Consistency', 'Unblocking']

  const datasets = top3.map(([login, s], i) => ({
    label: displayName(login),
    data: [s.scores.complexity, s.scores.review, s.scores.breadth, s.scores.velocity, s.scores.unblocking],
    borderColor: COLORS[i],
    backgroundColor: COLORS[i] + '22',
    borderWidth: 1.5,
    pointRadius: 3,
  }))

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: 190 }}>
        <Radar
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                min: 0,
                max: 100,
                ticks: { display: false },
                grid: { color: 'rgba(0,0,0,0.07)' },
                angleLines: { color: 'rgba(0,0,0,0.07)' },
                pointLabels: { color: '#888780', font: { size: 11 } },
              },
            },
          }}
        />
      </div>

      <div className="radar-legend">
        {top3.map(([login], i) => (
          <span key={login}>
            <span className="legend-dot" style={{ background: COLORS[i] }} />
            {displayName(login)}
          </span>
        ))}
      </div>
    </>
  )
}
