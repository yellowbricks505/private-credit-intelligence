import { NextResponse } from 'next/server'
import { getAESTDateKey, marketFeedKey, analystKey, setInKV } from '@/lib/kv'
import { fetchMarketFeed, fetchAnalystIntelligence, fetchPortfolioSentiment } from '@/lib/anthropic'
import analysts from '@/data/analysts.json'

export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = getAESTDateKey()
  const results: Record<string, string> = {}

  // Market feed
  try {
    const marketData = await fetchMarketFeed(date)
    await setInKV(marketFeedKey(date), marketData)
    results['market-feed'] = 'ok'
  } catch (err) {
    results['market-feed'] = `error: ${String(err)}`
  }

  // Sentiment
  try {
    const sentiments = await fetchPortfolioSentiment(analysts as any, date)
    await setInKV(`sentiment-${date}`, sentiments)
    results['sentiment'] = 'ok'
  } catch (err) {
    results['sentiment'] = `error: ${String(err)}`
  }

  // Analyst feeds
  for (const analyst of analysts) {
    try {
      const data = await fetchAnalystIntelligence(analyst as any, date)
      await setInKV(analystKey(analyst.id, date), data)
      results[`analyst-${analyst.id}`] = 'ok'
    } catch (err) {
      results[`analyst-${analyst.id}`] = `error: ${String(err)}`
    }
  }

  return NextResponse.json({ date, results })
}
