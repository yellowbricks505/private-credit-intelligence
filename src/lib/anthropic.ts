import Anthropic from '@anthropic-ai/sdk'
import type {
  MarketFeedData,
  AnalystIntelligenceData,
  Article,
  PricingCell,
  PortfolioLink,
  AnalystIntelligenceArticle,
  AnalystSentiment,
  PortfolioSentiment,
} from './types'
import type { Analyst } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ALL_BORROWERS: Record<string, string[]> = {
  AB: ['Guardian Early Learning', 'Hirepool', 'Coronet', 'Jaybro', 'Craveable Brands', 'StraitNZ', 'CFS', 'Fisher Funds'],
  BC: ['Visy Properties', 'Kinetic', 'NewCold', 'Icon Cancer Care', 'Ritchies', 'Worley', 'NextDC'],
  DS: ['SCT Logistics', 'YHA', 'ATI', 'AirTrunk', 'Patties Foods', 'ATOM', 'Questas'],
  SD: ['Harris Farm Markets', 'ProbeCX', 'Iron Mountain', 'TEEG', 'Arrotex', 'Device Technologies', 'Velocity', 'APM', 'DC Co'],
}

const ALL_PORTFOLIO_NAMES = Object.values(ALL_BORROWERS).flat()

function buildPortfolioLinks(headline: string, summary: string): PortfolioLink[] {
  const text = `${headline} ${summary}`.toLowerCase()
  const links: PortfolioLink[] = []
  for (const [analystId, borrowers] of Object.entries(ALL_BORROWERS)) {
    for (const borrower of borrowers) {
      if (text.includes(borrower.toLowerCase())) {
        const initialsMap: Record<string, string> = { AB: 'AB', BC: 'BC', DS: 'DS', SD: 'SD' }
        links.push({ borrower, analystId, analystInitials: initialsMap[analystId] })
      }
    }
  }
  return links
}

export async function fetchMarketFeed(date: string): Promise<MarketFeedData> {
  const portfolioList = ALL_PORTFOLIO_NAMES.join(', ')

  const systemPrompt = `You are a senior credit analyst at an Australian superannuation fund.
Your role is to curate and synthesise market intelligence for the private credit investment team.
Always respond with valid JSON matching the exact schema provided. Be specific, factual, and use actual market data.`

  const userPrompt = `Today is ${date} AEST. Search for today's private credit and leveraged finance market news.

Search for news from these sources: AFR (Australian Financial Review), SMH (Sydney Morning Herald), Bloomberg, Reuters, Financial Times, Wall Street Journal, Debtwire, LCD/Leveraged Commentary & Data, and major financial news sites.

Focus on: Australian private credit, unitranche, direct lending, leveraged loans, real estate credit, infrastructure debt, data centres, structured credit, M&A financing, private equity activity, fund news, macro/rates, RBA updates, sponsor/PE deal activity, sector headwinds, regulatory changes, pricing trends, capital markets.

Also flag any news about these portfolio companies: ${portfolioList}

Return a JSON object with this exact schema:
{
  "overnightBriefing": "2-3 sentence summary of the most material stories since yesterday, written for a super fund credit team",
  "pricingCells": [
    {"label": "AU Unitranche / Direct Lending", "content": "market colour on Australian unitranche and direct lending spreads, deal flow, pricing trends", "trend": "tighter|wider|stable|mixed"},
    {"label": "US TLB Market", "content": "US term loan B market colour, technicals, supply/demand", "trend": "tighter|wider|stable|mixed"},
    {"label": "EU TLB / Leveraged Loans", "content": "European leveraged loan market colour", "trend": "tighter|wider|stable|mixed"},
    {"label": "AU IG New Issuance", "content": "Australian investment grade new issuance pipeline and pricing", "trend": "tighter|wider|stable|mixed"},
    {"label": "US HY / IG Spreads", "content": "US high yield and investment grade spread levels and direction", "trend": "tighter|wider|stable|mixed"},
    {"label": "BBSW & RBA", "content": "BBSW levels, RBA outlook, cash rate expectations", "trend": "tighter|wider|stable|mixed"}
  ],
  "articles": [
    {
      "id": "unique-slug",
      "headline": "Article headline",
      "source": "AFR|SMH|Bloomberg|Reuters|FT|WSJ|Debtwire|LCD|Other",
      "sourceType": "afr|smh|paywalled|free",
      "url": "https://...",
      "publishedAt": "ISO datetime or date string",
      "summary": "2-3 sentence summary with credit-relevant context",
      "relevance": "high|medium|low",
      "category": "deals-lbos|macro|pricing|credit|infrastructure|real-estate|funds-lps|general",
      "isWatch": true/false (true if macro/sponsor/regulatory signal worth watching),
      "portfolioLinks": [],
      "creditRelevanceNote": "brief note on credit relevance"
    }
  ]
}

Include 15-25 articles. AFR and SMH articles should be sourceType "afr" and "smh" respectively. Bloomberg, Reuters, FT, WSJ are "paywalled". Others are "free".
Mark isWatch=true for RBA decisions, regulatory changes, major sponsor activity, sector-wide headwinds, macro inflection points.
For portfolioLinks, only include if the article directly mentions a portfolio company name from this list: ${portfolioList}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  // Extract the final text response
  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text
      break
    }
  }

  // Strip markdown code fences if present
  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    // Attempt to extract JSON object from the response
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) {
      parsed = JSON.parse(match[0])
    } else {
      throw new Error('Failed to parse market feed JSON from model response')
    }
  }

  // Enrich portfolio links from text matching (model may miss some)
  const articles: Article[] = (parsed.articles || []).map((a: any) => {
    const detected = buildPortfolioLinks(a.headline, a.summary)
    const merged = [...(a.portfolioLinks || []), ...detected]
    const unique = merged.filter(
      (l: PortfolioLink, i: number, arr: PortfolioLink[]) =>
        arr.findIndex((x) => x.borrower === l.borrower) === i
    )
    return {
      ...a,
      id: a.id || `article-${Math.random().toString(36).slice(2)}`,
      portfolioLinks: unique,
    } as Article
  })

  return {
    date,
    overnightBriefing: parsed.overnightBriefing || '',
    pricingCells: (parsed.pricingCells || []) as PricingCell[],
    articles,
    generatedAt: new Date().toISOString(),
  }
}

export async function fetchAnalystIntelligence(
  analyst: Analyst,
  date: string
): Promise<AnalystIntelligenceData> {
  const portfolioStr = analyst.portfolio.join(', ')
  const sectorsStr = analyst.sectors.join(', ')

  const systemPrompt = `You are a credit research assistant specialising in Australian private credit and leveraged finance.
Respond only with valid JSON matching the exact schema provided.`

  const userPrompt = `Today is ${date} AEST. Search for targeted intelligence for ${analyst.name} (${analyst.initials}), a credit analyst covering:

Portfolio companies: ${portfolioStr}
Sectors: ${sectorsStr}

Search thoroughly for:
1. Any direct news about the portfolio companies (earnings, refinancings, sponsor activity, operational news, credit events)
2. Australian sector developments in: ${sectorsStr}
3. International peers and industry dynamics relevant to these sectors

Return JSON with this exact schema:
{
  "briefingSummary": "3-4 sentence plain English briefing summary of the most important items for ${analyst.name} today",
  "articles": [
    {
      "id": "unique-slug",
      "headline": "Article headline",
      "source": "Source name",
      "summary": "2-3 sentence summary",
      "relevance": "high|medium|low",
      "borrowerTag": "Portfolio company name if directly relevant, else null",
      "creditRelevanceNote": "1-2 sentence explanation of credit relevance to ${analyst.name}'s portfolio",
      "section": "direct|sector|international"
    }
  ]
}

Sections:
- "direct": articles directly mentioning portfolio companies (${portfolioStr})
- "sector": Australian sector developments relevant to the analyst's coverage
- "international": international peers, global industry dynamics, overseas comparable situations

Include 10-20 articles total. Prioritise direct portfolio hits. creditRelevanceNote should be specific and actionable.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text
      break
    }
  }

  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) {
      parsed = JSON.parse(match[0])
    } else {
      throw new Error(`Failed to parse analyst intelligence JSON for ${analyst.id}`)
    }
  }

  const articles: AnalystIntelligenceArticle[] = (parsed.articles || []).map((a: any) => ({
    ...a,
    id: a.id || `article-${Math.random().toString(36).slice(2)}`,
  }))

  return {
    analystId: analyst.id,
    date,
    briefingSummary: parsed.briefingSummary || '',
    articles,
    generatedAt: new Date().toISOString(),
  }
}

export async function fetchPortfolioSentiment(
  analysts: Analyst[],
  date: string
): Promise<AnalystSentiment[]> {
  const allPortfolio = analysts.map((a) => ({
    analystId: a.id,
    borrowers: a.portfolio,
  }))

  const systemPrompt = `You are a credit risk analyst. Respond only with valid JSON.`

  const userPrompt = `Today is ${date} AEST. Assess the 30-day rolling sentiment for these portfolio companies, based on any recent news, market developments, sector trends, and credit signals you can find.

Portfolio:
${allPortfolio.map((a) => `${a.analystId}: ${a.borrowers.join(', ')}`).join('\n')}

For each borrower, assess:
- sentiment: "positive" (strong performance, refinancing success, sector tailwinds), "cautious" (some headwinds, watchlist, mixed signals), "negative" (credit stress, sector deterioration, adverse developments), "neutral" (no material news)
- hasRecentAlert: true if there is notable news in the last 7 days that overrides the 30-day rolling sentiment
- note: 1 sentence explaining the sentiment

Return JSON:
{
  "sentiments": [
    {
      "analystId": "AB|BC|DS|SD",
      "borrower": "Borrower name",
      "sentiment": "positive|cautious|negative|neutral",
      "hasRecentAlert": true/false,
      "note": "Brief explanation"
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  let jsonText = ''
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text
      break
    }
  }

  jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
    else return analysts.map((a) => ({ analystId: a.id, items: [], generatedAt: new Date().toISOString() }))
  }

  const sentimentRows: any[] = parsed.sentiments || []

  return analysts.map((analyst) => {
    const items: PortfolioSentiment[] = sentimentRows
      .filter((s: any) => s.analystId === analyst.id)
      .map((s: any) => ({
        borrower: s.borrower,
        sentiment: s.sentiment,
        hasRecentAlert: s.hasRecentAlert,
        note: s.note,
      }))

    // Fill in neutral for any missing
    for (const borrower of analyst.portfolio) {
      if (!items.find((i) => i.borrower === borrower)) {
        items.push({ borrower, sentiment: 'neutral', hasRecentAlert: false })
      }
    }

    return { analystId: analyst.id, items, generatedAt: new Date().toISOString() }
  })
}
