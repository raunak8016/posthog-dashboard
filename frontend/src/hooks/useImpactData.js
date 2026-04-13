import { useState, useEffect } from 'react'
import { buildStats, computeImpactScores, topN } from '../lib/scoring'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim()
const REVIEW_SAMPLE = Number(import.meta.env.VITE_REVIEW_SAMPLE) || 20

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchAllPRs(since) {
  let prs = []
  for (let page = 1; page <= 6; page++) {
    const r = await fetch(`${API}/api/prs?page=${page}`)
    if (!r.ok) throw new Error(`Backend error ${r.status}`)
    const data = await r.json()
    if (!data.length) break
    const filtered = data.filter(p => p.merged_at && new Date(p.merged_at) >= since)
    prs = prs.concat(filtered)
    if (filtered.length < data.length) break
  }
  return prs
}

async function fetchReviewsMap(prs) {
  const map = {}
  const sampleSize = Math.min(REVIEW_SAMPLE, prs.length)
  const sample = prs.slice(0, sampleSize)

  // Use backend batch endpoint to fetch all reviews for sampled PRs in one request
  try {
    const prNumbers = sample.map(p => p.number)
    const r = await fetch(`${API}/api/reviews/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prNumbers),
    })
    if (!r.ok) return { map, totalReviews: 0 }
    const batch = await r.json()

    for (const prNumStr of Object.keys(batch)) {
      const reviews = batch[prNumStr] || []
      for (const rev of reviews) {
        const login = rev.user?.login
        if (!login || /bot/i.test(login)) continue
        map[login] = (map[login] || 0) + 1
        if (rev.body?.length > 50) map[login] += 0.5
      }
    }
  } catch (err) {
    return { map, totalReviews: 0 }
  }

  const totalReviews = Object.values(map).reduce((a, b) => a + b, 0)
  return { map, totalReviews }
}

export function useImpactData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    top5: [],
    metrics: { prs: 0, contributors: 0, reviews: 0, avgSize: 0 },
    since: null,
  })

  useEffect(() => {
    async function load() {
      const since = new Date()
      since.setDate(since.getDate() - 90)

      try {
        const prs = await fetchAllPRs(since)
        if (!prs.length) throw new Error('No PRs returned')

        const totalLines = prs.reduce((a, p) => a + (p.additions || 0) + (p.deletions || 0), 0)
        const avgSize = Math.round(totalLines / prs.length)

        const { map: reviewsMap } = await fetchReviewsMap(prs)

        const rawStats = buildStats(prs, reviewsMap, since)
        const scored = computeImpactScores(rawStats)
        const top5 = topN(scored)

        const totalReviews = Object.values(reviewsMap).reduce((a, b) => a + b, 0)

        setState({
          loading: false,
          error: null,
          top5,
          metrics: {
            prs: prs.length,
            contributors: Object.keys(rawStats).length,
            reviews: Math.round(totalReviews * (prs.length / Math.min(REVIEW_SAMPLE, prs.length))),
            avgSize,
          },
          since,
        })
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err.message }))
      }
    }

    load()
  }, [])

  return state
}
