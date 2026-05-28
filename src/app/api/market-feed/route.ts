import { NextResponse } from 'next/server'
import { getAESTDateKey, marketFeedKey, getFromKV, setInKV } from '@/lib/kv'
import { fetchMarketFeed } from '@/lib/anthropic'
import type { MarketFeedData } from '@/lib/types'

export const maxDuration = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bustCache = searchParams.get('bust') === '1'

  const date = getAESTDateKey()
  const key = marketFeedKey(date)

  if (!bustCache) {
    const cached = await getFromKV<MarketFeedData>(key)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }
  }

  try {
    const data = await fetchMarketFeed(date)
    await setInKV(key, data)
    return NextResponse.json({ ...data, fromCache: false })
  } catch (err) {
    console.error('Market feed fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch market feed', details: String(err) },
      { status: 500 }
    )
  }
}
