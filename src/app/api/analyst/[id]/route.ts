import { NextResponse } from 'next/server'
import { getAESTDateKey, analystKey, getFromKV, setInKV } from '@/lib/kv'
import { fetchAnalystIntelligence } from '@/lib/anthropic'
import type { AnalystIntelligenceData } from '@/lib/types'
import analysts from '@/data/analysts.json'

export const maxDuration = 300

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const bustCache = searchParams.get('bust') === '1'

  const analyst = analysts.find((a) => a.id === params.id)
  if (!analyst) {
    return NextResponse.json({ error: 'Analyst not found' }, { status: 404 })
  }

  const date = getAESTDateKey()
  const key = analystKey(analyst.id, date)

  if (!bustCache) {
    const cached = await getFromKV<AnalystIntelligenceData>(key)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }
  }

  try {
    const data = await fetchAnalystIntelligence(analyst as any, date)
    await setInKV(key, data)
    return NextResponse.json({ ...data, fromCache: false })
  } catch (err) {
    console.error(`Analyst intelligence fetch error for ${analyst.id}:`, err)
    return NextResponse.json(
      { error: 'Failed to fetch analyst intelligence', details: String(err) },
      { status: 500 }
    )
  }
}
