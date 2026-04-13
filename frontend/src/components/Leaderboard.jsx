import { useState } from 'react'
import { displayName } from '../lib/scoring'
import EngineerDetail from './EngineerDetail'

const BAR_COLORS = ['#534AB7', '#1D9E75', '#D85A30', '#185FA5', '#854F0B']

export default function Leaderboard({ top5 }) {
  const [openIndex, setOpenIndex] = useState(null)
  const maxScore = top5[0]?.[1]?.total || 100

  return (
    <div>
      {top5.map(([login, s], i) => (
        <div key={login}>
          <div
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              alignItems: 'center',
              gap: 10,
              padding: '9px 6px',
              borderBottom: i < top5.length - 1 ? '0.5px solid rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              borderRadius: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9f9f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 13, color: '#b4b2a9', fontWeight: 500, textAlign: 'center' }}>
              #{i + 1}
            </span>

            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{displayName(login)}</div>
              <div style={{ fontSize: 11, color: '#888780', fontFamily: 'monospace' }}>@{login}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{s.total}</span>
              <div style={{ width: 80, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2 }}>
                <div style={{
                  width: `${Math.round(s.total / maxScore * 100)}%`,
                  height: '100%',
                  background: BAR_COLORS[i],
                  borderRadius: 2,
                }} />
              </div>
            </div>
          </div>

          {openIndex === i && <EngineerDetail engineer={s} />}
        </div>
      ))}
    </div>
  )
}
