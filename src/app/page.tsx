'use client'

import { useState, useEffect, useMemo } from 'react'
import type { MarketFeedData, AnalystSentiment, FilterTab, Article, ArticleCategory } from '@/lib/types'
import analysts from '@/data/analysts.json'
import { OvernightBriefing } from '@/components/OvernightBriefing'
import { PricingGrid } from '@/components/PricingGrid'
import { SentimentSwimLanes } from '@/components/SentimentSwimLanes'
import { MetricStrip } from '@/components/MetricStrip'
import { FilterBar } from '@/components/FilterBar'
import { ArticleCard } from '@/components/ArticleCard'
import { AnalystCard } from '@/components/AnalystCard'
import { AnalystIntelligenceView } from '@/components/AnalystIntelligenceView'

type Tab = 'market' | 'analyst'

function filterArticles(articles: Article[], filter: FilterTab, search: string): Article[] {
  let result = articles

  if (filter === 'portfolio-linked') {
    result = result.filter((a) => a.portfolioLinks?.length > 0)
  } else if (filter !== 'all') {
    result = result.filter((a) => a.category === (filter as ArticleCategory))
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (a) =>
        a.headline.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
    )
  }

  return result
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('market')
  const [selectedAnalystId, setSelectedAnalystId] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketFeedData | null>(null)
  const [sentiments, setSentiments] = useState<AnalystSentiment[]>([])
  const [loadingMarket, setLoadingMarket] = useState(false)
  const [loadingSentiment, setLoadingSentiment] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const pref = localStorage.getItem('dark-mode')
    if (pref === '1' || (pref === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('dark-mode', next ? '1' : '0')
  }

  useEffect(() => {
    async function fetchMarket() {
      setLoadingMarket(true)
      setMarketError(null)
      try {
        const res = await fetch('/api/market-feed')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setMarketData(data)
      } catch (err) {
        setMarketError(String(err))
      } finally {
        setLoadingMarket(false)
      }
    }
    fetchMarket()
  }, [])

  const fetchSentiment = async () => {
    setLoadingSentiment(true)
    try {
      const res = await fetch('/api/sentiment')
      if (!res.ok) return
      const data = await res.json()
      setSentiments(data.sentiments || [])
    } catch {}
    finally {
      setLoadingSentiment(false)
    }
  }

  const articles = useMemo(() => marketData?.articles || [], [marketData])
  const afrArticles = useMemo(() => articles.filter((a) => a.sourceType === 'afr'), [articles])
  const smhArticles = useMemo(() => articles.filter((a) => a.sourceType === 'smh'), [articles])
  const otherFreeArticles = useMemo(() => articles.filter((a) => a.sourceType === 'free'), [articles])
  const paywalledArticles = useMemo(() => articles.filter((a) => a.sourceType === 'paywalled'), [articles])
  const filteredArticles = useMemo(() => filterArticles(articles, filter, search), [articles, filter, search])

  const selectedAnalyst = analysts.find((a) => a.id === selectedAnalystId) || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
              Private Credit Intelligence
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Australian Superannuation Fund · Credit Team</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search headlines…"
                className="w-44 md:w-64 text-sm px-3 py-1.5 pl-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {marketData && (
              <span className="text-[10px] text-slate-400 hidden md:block">
                {(marketData as any).fromCache ? '⚡ Cached' : '🔄 Live'} · {new Date(marketData.generatedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-sm"
              title="Toggle dark mode"
            >
              {darkMode ? '☀' : '◑'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-screen-xl mx-auto px-4 flex gap-1 border-t border-slate-100 dark:border-slate-800 pt-1 pb-1">
          {(['market', 'analyst'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t === 'market' ? 'Market Feed' : 'Analyst Intelligence'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-5 space-y-5">
        {/* Overnight briefing */}
        {marketData?.overnightBriefing && (
          <OvernightBriefing text={marketData.overnightBriefing} />
        )}

        {/* Portfolio sentiment swimlanes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Portfolio Sentiment (30-day rolling)
            </h2>
            {sentiments.length === 0 && !loadingSentiment && (
              <button
                onClick={fetchSentiment}
                className="text-xs text-blue-500 hover:underline"
              >
                Load
              </button>
            )}
            {loadingSentiment && (
              <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <SentimentSwimLanes sentiments={sentiments} />
        </div>

        {/* ===== MARKET FEED ===== */}
        {tab === 'market' && (
          <>
            {marketData?.pricingCells && marketData.pricingCells.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  Pricing & Market Colour
                </h2>
                <PricingGrid cells={marketData.pricingCells} />
              </div>
            )}

            <div className="space-y-2">
              {articles.length > 0 && <MetricStrip articles={articles} />}
              <FilterBar active={filter} onChange={setFilter} articles={articles} />
            </div>

            {loadingMarket && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Fetching today's market intelligence…</p>
                <p className="text-xs text-slate-400 mt-1">Searching AFR, Bloomberg, Reuters and more</p>
              </div>
            )}

            {marketError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
                Error: {marketError}
              </div>
            )}

            {marketData && !loadingMarket && (
              <>
                {(filter !== 'all' || search) ? (
                  <div>
                    {filteredArticles.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No articles match this filter</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredArticles.map((a) => (
                          <ArticleCard key={a.id} article={a} searchQuery={search} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* AFR | SMH */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            AFR ({afrArticles.length})
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {afrArticles.length === 0
                            ? <p className="text-xs text-slate-400 italic">No AFR articles today</p>
                            : afrArticles.map((a) => <ArticleCard key={a.id} article={a} searchQuery={search} />)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            SMH ({smhArticles.length})
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {smhArticles.length === 0
                            ? <p className="text-xs text-slate-400 italic">No SMH articles today</p>
                            : smhArticles.map((a) => <ArticleCard key={a.id} article={a} searchQuery={search} />)}
                        </div>
                      </div>
                    </div>

                    {/* Other | Paywalled */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            Other Free Sources ({otherFreeArticles.length})
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {otherFreeArticles.length === 0
                            ? <p className="text-xs text-slate-400 italic">No other articles today</p>
                            : otherFreeArticles.map((a) => <ArticleCard key={a.id} article={a} searchQuery={search} />)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            Paywalled ({paywalledArticles.length})
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {paywalledArticles.length === 0
                            ? <p className="text-xs text-slate-400 italic">No paywalled articles today</p>
                            : paywalledArticles.map((a) => <ArticleCard key={a.id} article={a} searchQuery={search} />)}
                        </div>
                      </div>
                    </div>

                    {/* Portfolio-linked key themes */}
                    {articles.filter((a) => a.portfolioLinks?.length > 0).length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-3">
                          Key Themes — Portfolio-Linked ({articles.filter((a) => a.portfolioLinks?.length > 0).length})
                        </h3>
                        <div className="space-y-3">
                          {articles
                            .filter((a) => a.portfolioLinks?.length > 0)
                            .map((a) => (
                              <ArticleCard key={a.id} article={a} searchQuery={search} />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ===== ANALYST INTELLIGENCE ===== */}
        {tab === 'analyst' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {analysts.map((analyst) => (
                <AnalystCard
                  key={analyst.id}
                  analyst={analyst as any}
                  selected={selectedAnalystId === analyst.id}
                  onClick={() =>
                    setSelectedAnalystId(
                      selectedAnalystId === analyst.id ? null : analyst.id
                    )
                  }
                />
              ))}
            </div>

            {selectedAnalyst ? (
              <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <AnalystIntelligenceView
                  analyst={selectedAnalyst as any}
                  marketArticles={articles}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-2xl mb-3">↑</p>
                <p className="text-sm text-slate-500">Select an analyst above to load their intelligence brief</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-10 py-4 text-center text-[11px] text-slate-400">
        Private Credit Intelligence · Internal Use Only · Data refreshes daily at 7am AEST
      </footer>
    </div>
  )
}
