'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Analyst, AnalystIntelligenceData, Article } from '@/lib/types'
import { RelevanceBadge } from './RelevanceBadge'
import { KeywordTracker } from './KeywordTracker'

const SECTION_LABELS = {
  direct: { label: 'Direct Portfolio Hits', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  sector: { label: 'Australian Sector Developments', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  international: { label: 'International Peers & Industry Dynamics', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' },
}

const BORROWER_TAG_COLORS: Record<string, string> = {
  AB: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  BC: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  DS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  SD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

export function AnalystIntelligenceView({
  analyst,
  marketArticles,
}: {
  analyst: Analyst
  marketArticles: Article[]
}) {
  const [data, setData] = useState<AnalystIntelligenceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(
    async (bust = false) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/analyst/${analyst.id}${bust ? '?bust=1' : ''}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    },
    [analyst.id]
  )

  useEffect(() => {
    fetch_()
  }, [fetch_])

  const sections = ['direct', 'sector', 'international'] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {analyst.name} — Intelligence Brief
          </h2>
          {data && (
            <p className="text-xs text-slate-400 mt-0.5">
              {(data as any).fromCache ? '⚡ Cached' : '🔄 Live'} · {new Date(data.generatedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} AEST
            </p>
          )}
        </div>
        <button
          onClick={() => fetch_(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '⟳ Fetching…' : '⟳ Re-fetch'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Fetching intelligence for {analyst.name}…</p>
            <p className="text-xs text-slate-400 mt-1">Searching news sources with web search</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Briefing summary */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Briefing Summary
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {data.briefingSummary}
            </p>
          </div>

          {/* Article sections */}
          {sections.map((section) => {
            const articles = data.articles.filter((a) => a.section === section)
            if (articles.length === 0) return null
            const cfg = SECTION_LABELS[section]

            return (
              <div key={section}>
                <h3 className={`text-xs font-bold uppercase tracking-wide mb-2 ${cfg.color}`}>
                  {cfg.label} ({articles.length})
                </h3>
                <div className="space-y-2">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className={`rounded-lg border p-3 ${cfg.bg}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {article.borrowerTag && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${BORROWER_TAG_COLORS[analyst.id]}`}>
                              {article.borrowerTag}
                            </span>
                          )}
                          <RelevanceBadge relevance={article.relevance} />
                          <span className="text-[10px] text-slate-400 font-medium">{article.source}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug mb-1">
                        {article.headline}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-1.5">
                        {article.summary}
                      </p>
                      {article.creditRelevanceNote && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 italic">
                          ↳ {article.creditRelevanceNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Keyword tracker */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <KeywordTracker
              analystId={analyst.id}
              marketArticles={marketArticles}
              analystArticles={data.articles}
            />
          </div>
        </>
      )}
    </div>
  )
}
