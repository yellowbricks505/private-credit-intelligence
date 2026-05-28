'use client'

import type { AnalystSentiment } from '@/lib/types'
import analysts from '@/data/analysts.json'

const ANALYST_HEADER_COLORS: Record<string, string> = {
  AB: 'text-violet-600 dark:text-violet-400',
  BC: 'text-cyan-600 dark:text-cyan-400',
  DS: 'text-emerald-600 dark:text-emerald-400',
  SD: 'text-rose-600 dark:text-rose-400',
}

const SENTIMENT_PILL: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
  cautious: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
}

export function SentimentSwimLanes({ sentiments }: { sentiments: AnalystSentiment[] }) {
  return (
    <div className="space-y-2">
      {analysts.map((analyst) => {
        const row = sentiments.find((s) => s.analystId === analyst.id)
        const items = row?.items || []

        return (
          <div key={analyst.id} className="flex items-start gap-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
            <div className={`text-xs font-bold w-6 flex-shrink-0 pt-0.5 ${ANALYST_HEADER_COLORS[analyst.id]}`}>
              {analyst.initials}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.length === 0 ? (
                <span className="text-xs text-slate-400">No data</span>
              ) : (
                items.map((item) => (
                  <span
                    key={item.borrower}
                    title={item.note || item.sentiment}
                    className={`relative inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-default ${SENTIMENT_PILL[item.sentiment]}`}
                  >
                    {item.borrower}
                    {item.hasRecentAlert && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
