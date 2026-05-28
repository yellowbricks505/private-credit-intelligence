'use client'

import type { Relevance } from '@/lib/types'

const cfg: Record<Relevance, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

export function RelevanceBadge({ relevance }: { relevance: Relevance }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${cfg[relevance]}`}>
      {relevance}
    </span>
  )
}
