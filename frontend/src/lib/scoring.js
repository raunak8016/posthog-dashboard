export function classifyArea(prTitle = '') {
  const t = prTitle.toLowerCase()
  const areas = new Set()
  if (/frontend|ui|react|css|style|layout|component/.test(t)) areas.add('frontend')
  if (/api|backend|django|python|query|model|endpoint/.test(t)) areas.add('backend')
  if (/test|spec|cypress|jest|playwright/.test(t)) areas.add('tests')
  if (/infra|deploy|ci|docker|k8s|clickhouse|kafka|celery/.test(t)) areas.add('infra')
  if (/perf|optim|speed|cach|latency|slow/.test(t)) areas.add('perf')
  if (/insight|analytics|funnel|cohort|trend|dashboard/.test(t)) areas.add('analytics')
  if (areas.size === 0) areas.add('general')
  return areas
}

export function buildStats(prs, reviewsMap, since) {
  const stats = {}

  for (const pr of prs) {
    const login = pr.user?.login
    if (!login || /bot/i.test(login)) continue

    if (!stats[login]) {
      stats[login] = {
        login,
        prs: 0,
        complexity: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalFiles: 0,
        breadthSet: new Set(),
        weeksActiveSet: new Set(),
      }
    }

    const s = stats[login]
    s.prs++
    s.totalAdditions += pr.additions || 0
    s.totalDeletions += pr.deletions || 0
    s.totalFiles += pr.changed_files || 0
    s.complexity += Math.log1p(
      (pr.additions || 0) + (pr.deletions || 0) + (pr.changed_files || 0) * 10
    )
    classifyArea(pr.title).forEach(a => s.breadthSet.add(a))
    const week = Math.floor((new Date(pr.merged_at) - since) / (7 * 86400000))
    s.weeksActiveSet.add(week)
  }

  // attach review data
  for (const [login, s] of Object.entries(stats)) {
    s.reviewScore = reviewsMap[login] || 0
    s.breadth = s.breadthSet.size
    s.weeksActive = s.weeksActiveSet.size
    s.consistency = s.weeksActiveSet.size / 13
    s.unblocking = (reviewsMap[login] || 0) / Math.max(s.prs, 1)
  }

  return stats
}

export function computeImpactScores(stats) {
  const values = Object.values(stats)
  const max = key => Math.max(...values.map(s => s[key])) || 1
  const norm = (v, m) => Math.round((v / m) * 100)

  const maxC = max('complexity')
  const maxR = max('reviewScore')
  const maxB = max('breadth')
  const maxCons = max('consistency')
  const maxU = max('unblocking')

  return Object.fromEntries(
    Object.entries(stats).map(([login, s]) => {
      const c = norm(s.complexity, maxC)
      const r = norm(s.reviewScore, maxR)
      const b = norm(s.breadth, maxB)
      const v = norm(s.consistency, maxCons)
      const u = norm(s.unblocking, maxU)
      const total = Math.round(c * 0.30 + r * 0.25 + b * 0.15 + v * 0.15 + u * 0.15)
      return [login, { ...s, scores: { complexity: c, review: r, breadth: b, velocity: v, unblocking: u }, total }]
    })
  )
}

export function topN(scoredStats, n = 5, minPRs = 2) {
  return Object.entries(scoredStats)
    .filter(([, s]) => s.prs >= minPRs)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, n)
}

export const DISPLAY_NAMES = {
  macobo: 'Karl-Aksel Puulmann',
  Twixes: 'Michael Matloka',
  pauldambra: "Paul D'Ambra",
  timgl: 'Tim Glaser',
  neilkakkar: 'Neil Kakkar',
  fuziontech: 'Eric Duong',
  mariusandra: 'Marius Andra',
  tkaemming: 'Ted Kaemming',
  'robbie-c': 'Robbie Clarke',
  bretthoerner: 'Brett Hoerner',
}

export function displayName(login) {
  return DISPLAY_NAMES[login] || login
}
