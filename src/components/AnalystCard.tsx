'use client'

import type { Analyst } from '@/lib/types'

const CARD_ACCENT: Record<string, string> = {
  AB: 'border-violet-300 dark:border-violet-700 hover:border-violet-400',
  BC: 'border-cyan-300 dark:border-cyan-700 hover:border-cyan-400',
  DS: 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-400',
  SD: 'border-rose-300 dark:border-rose-700 hover:border-rose-400',
}

const INITIALS_BG: Record<string, string> = {
  AB: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  BC: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  DS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  SD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const PILL_COLORS: Record<string, string> = {
  AB: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
  BC: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
  DS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
  SD: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
}

export function AnalystCard({
  analyst,
  selected,
  onClick,
}: {
  analyst: Analyst
  selected: boolean
  onClick: () => void
}) {
  const preview = analyst.portfolio.slice(0, 3)
  const remaining = analyst.portfolio.length - 3

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${CARD_ACCENT[analyst.id]} ${
        selected
          ? 'bg-slate-50 dark:bg-slate-800/80 shadow-md'
          : 'bg-white dark:bg-slate-800/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${INITIALS_BG[analyst.id]}`}
        >
          {analyst.initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {analyst.name}
          </div>
          <div className="text-xs text-slate-500">{analyst.portfolio.length} portfolio companies</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {preview.map((name) => (
          <span
            key={name}
            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${PILL_COLORS[analyst.id]}`}
          >
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">
            +{remaining} more
          </span>
        )}
      </div>
    </button>
  )
}
