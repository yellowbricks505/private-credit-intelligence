import { NextResponse } from 'next/server'
import { getAESTDateKey, getFromKV, setInKV } from '@/lib/kv'
import { fetchPortfolioSentiment } from '@/lib/anthropic'
import type { AnalystSentiment } from '@/lib/types'
import analysts from '@/data/analysts.json'

export const maxDuration = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bustCache = searchParams.get('bust') === '1'

  const date = getAESTDateKey()
  const key = `sentiment-${date}`

  if (!bustCache) {
    const cached = await getFromKV<AnalystSentiment[]>(key)
    if (cached) {
      return NextResponse.json({ sentiments: cached, fromCache: true })
    }
  }

  try {
    const sentiments = await fetchPortfolioSentiment(analysts as any, date)
    await setInKV(key, sentiments)
    return NextResponse.json({ sentiments, fromCache: false })
  } catch (err) {
    console.error('Sentiment fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment', details: String(err) },
      { status: 500 }
    )
  }
}
