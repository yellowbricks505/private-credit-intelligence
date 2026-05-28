'use client'

import { useEffect, useState } from 'react'
import type { Article } from '@/lib/types'
import { RelevanceBadge } from './RelevanceBadge'
import { SourceDot } from './SourceDot'

const ANALYST_COLORS: Record<string, string> = {
  AB: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  BC: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  DS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  SD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function ArticleCard({
  article,
  searchQuery = '',
}: {
  article: Article
  searchQuery?: string
}) {
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(`seen-${article.id}`)
    if (!seen) {
      setIsNew(true)
      localStorage.setItem(`seen-${article.id}`, '1')
    }
  }, [article.id])

  const hasPortfolioLinks = article.portfolioLinks && article.portfolioLinks.length > 0

  return (
    <div
      className={`relative rounded-lg border bg-white dark:bg-slate-800/50 dark:border-slate-700 p-3 transition-shadow hover:shadow-md ${
        hasPortfolioLinks
          ? 'border-amber-300 border-l-4 dark:border-amber-500'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceDot sourceType={article.sourceType} source={article.source} />
          {isNew && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wide">
              New
            </span>
          )}
          {article.isWatch && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase tracking-wide">
              ⚑ Watch
            </span>
          )}
          <RelevanceBadge relevance={article.relevance} />
        </div>
        {article.publishedAt && (
          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
            {new Date(article.publishedAt).toLocaleDateString('en-AU', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-1">
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {highlight(article.headline, searchQuery)}
          </a>
        ) : (
          highlight(article.headline, searchQuery)
        )}
      </h3>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
        {highlight(article.summary, searchQuery)}
      </p>

      {article.creditRelevanceNote && (
        <p className="text-[11px] text-slate-500 dark:text-slate-500 italic mb-2">
          {article.creditRelevanceNote}
        </p>
      )}

      {hasPortfolioLinks && (
        <div className="flex flex-wrap gap-1 mt-1">
          {article.portfolioLinks.map((link) => (
            <span
              key={`${link.borrower}-${link.analystId}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                ANALYST_COLORS[link.analystInitials] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {link.borrower}
              <span className="opacity-60 font-bold">{link.analystInitials}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
