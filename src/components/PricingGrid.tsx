'use client'

import type { PricingCell } from '@/lib/types'

const trendConfig = {
  tighter: { icon: '↓', color: 'text-green-600 dark:text-green-400' },
  wider: { icon: '↑', color: 'text-red-600 dark:text-red-400' },
  stable: { icon: '→', color: 'text-slate-500 dark:text-slate-400' },
  mixed: { icon: '↕', color: 'text-amber-600 dark:text-amber-400' },
}

export function PricingGrid({ cells }: { cells: PricingCell[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cells.map((cell, i) => {
        const trend = cell.trend ? trendConfig[cell.trend] : null
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
                {cell.label}
              </span>
              {trend && (
                <span className={`text-sm font-bold ${trend.color}`} title={cell.trend}>
                  {trend.icon}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {cell.content}
            </p>
          </div>
        )
      })}
    </div>
  )
}
