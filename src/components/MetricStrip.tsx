'use client'

import type { Article } from '@/lib/types'

export function MetricStrip({ articles }: { articles: Article[] }) {
  const total = articles.length
  const portfolioLinked = articles.filter((a) => a.portfolioLinks?.length > 0).length
  const watchItems = articles.filter((a) => a.isWatch).length
  const dealCount = articles.filter((a) => a.category === 'deals-lbos').length

  const metrics = [
    { label: 'Total Stories', value: total, color: 'text-slate-700 dark:text-slate-200' },
    { label: 'Portfolio-Linked', value: portfolioLinked, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Watch Items', value: watchItems, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Deals & LBOs', value: dealCount, color: 'text-blue-600 dark:text-blue-400' },
  ]

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {metrics.map((m, i) => (
        <div key={m.label} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-300 dark:text-slate-600">·</span>}
          <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
          <span className="text-xs text-slate-500">{m.label}</span>
        </div>
      ))}
    </div>
  )
}
