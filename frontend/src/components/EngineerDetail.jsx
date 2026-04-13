const BADGE_STYLES = {
  purple: { background: '#EEEDFE', color: '#3C3489' },
  teal:   { background: '#E1F5EE', color: '#085041' },
  blue:   { background: '#E6F1FB', color: '#0C447C' },
  amber:  { background: '#FAEEDA', color: '#633806' },
  coral:  { background: '#FAECE7', color: '#712B13' },
}

function Badge({ label, color }) {
  return (
    <span style={{
      ...BADGE_STYLES[color],
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 20,
      fontWeight: 500,
    }}>
      {label}
    </span>
  )
}

export default function EngineerDetail({ engineer }) {
  const s = engineer
  const signals = []
  if (s.scores.complexity > 70) signals.push({ label: 'High-complexity PRs', color: 'purple' })
  if (s.scores.review > 70)     signals.push({ label: 'Deep reviewer', color: 'teal' })
  if (s.scores.breadth > 70)    signals.push({ label: 'Full-stack reach', color: 'blue' })
  if (s.scores.velocity > 70)   signals.push({ label: 'Consistent shipper', color: 'amber' })
  if (s.scores.unblocking > 70) signals.push({ label: 'Team multiplier', color: 'coral' })

  return (
    <div style={{
      background: '#f9f9f8',
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 4,
      marginBottom: 4,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          ['PRs merged', s.prs],
          ['Avg additions', s.prs > 0 ? Math.round(s.totalAdditions / s.prs).toLocaleString() : '—'],
          ['Code areas', s.breadth],
          ['Weeks active', `${s.weeksActive}/13`],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 11, color: '#888780' }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>
          </div>
        ))}
      </div>
      {signals.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {signals.map(sg => <Badge key={sg.label} {...sg} />)}
        </div>
      )}
    </div>
  )
}
