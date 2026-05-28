'use client'

import { useState, useEffect } from 'react'
import type { Article, AnalystIntelligenceArticle } from '@/lib/types'
import { RelevanceBadge } from './RelevanceBadge'

function useKeywords(analystId: string) {
  const [keywords, setKeywords] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(`keywords-${analystId}`)
    if (stored) {
      try {
        setKeywords(JSON.parse(stored))
      } catch {}
    }
  }, [analystId])

  const save = (kws: string[]) => {
    setKeywords(kws)
    localStorage.setItem(`keywords-${analystId}`, JSON.stringify(kws))
  }

  return { keywords, save }
}

export function KeywordTracker({
  analystId,
  marketArticles,
  analystArticles,
}: {
  analystId: string
  marketArticles: Article[]
  analystArticles: AnalystIntelligenceArticle[]
}) {
  const { keywords, save } = useKeywords(analystId)
  const [input, setInput] = useState('')

  const addKeyword = () => {
    const kw = input.trim().toLowerCase()
    if (kw && !keywords.includes(kw)) {
      save([...keywords, kw])
    }
    setInput('')
  }

  const removeKeyword = (kw: string) => {
    save(keywords.filter((k) => k !== kw))
  }

  const matchingMarket = keywords.length
    ? marketArticles.filter((a) => {
        const text = `${a.headline} ${a.summary}`.toLowerCase()
        return keywords.some((kw) => text.includes(kw))
      })
    : []

  const matchingAnalyst = keywords.length
    ? analystArticles.filter((a) => {
        const text = `${a.headline} ${a.summary}`.toLowerCase()
        return keywords.some((kw) => text.includes(kw))
      })
    : []

  const allMatches = [
    ...matchingMarket.map((a) => ({ id: a.id, headline: a.headline, summary: a.summary, relevance: a.relevance, source: 'Market Feed' })),
    ...matchingAnalyst.map((a) => ({ id: a.id, headline: a.headline, summary: a.summary, relevance: a.relevance, source: 'Analyst Feed' })),
  ]

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Keyword Tracking
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="Add keyword (press Enter)"
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addKeyword}
          className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90"
        >
          Add
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="hover:text-red-500 font-bold leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {keywords.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Keyword matches ({allMatches.length})
          </div>
          {allMatches.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No matching articles found</p>
          ) : (
            <div className="space-y-2">
              {allMatches.map((a) => (
                <div
                  key={`${a.id}-${a.source}`}
                  className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{a.source}</span>
                    <RelevanceBadge relevance={a.relevance} />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.headline}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{a.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
