'use client'

import type { Article, FilterTab } from '@/lib/types'

const TABS: { id: FilterTab; label: string; category?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'portfolio-linked', label: 'Portfolio-linked' },
  { id: 'deals-lbos', label: 'Deals & LBOs', category: 'deals-lbos' },
  { id: 'macro', label: 'Macro', category: 'macro' },
  { id: 'pricing', label: 'Pricing', category: 'pricing' },
  { id: 'credit', label: 'Credit', category: 'credit' },
  { id: 'infrastructure', label: 'Infrastructure', category: 'infrastructure' },
  { id: 'real-estate', label: 'Real Estate', category: 'real-estate' },
  { id: 'funds-lps', label: 'Funds & LPs', category: 'funds-lps' },
]

function tabCount(tab: { id: FilterTab; category?: string }, articles: Article[]): number {
  if (tab.id === 'all') return articles.length
  if (tab.id === 'portfolio-linked') return articles.filter((a) => a.portfolioLinks?.length > 0).length
  return articles.filter((a) => a.category === tab.category).length
}

export function FilterBar({
  active,
  onChange,
  articles,
}: {
  active: FilterTab
  onChange: (tab: FilterTab) => void
  articles: Article[]
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => {
        const count = tabCount(tab, articles)
        const isEmpty = count === 0 && tab.id !== 'all'
        const isActive = active === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => !isEmpty && onChange(tab.id)}
            disabled={isEmpty}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : isEmpty
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`text-[10px] font-bold rounded-full px-1 ${
                  isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
