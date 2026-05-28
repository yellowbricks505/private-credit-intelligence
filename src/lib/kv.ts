import { kv } from '@vercel/kv'

export const KV_TTL = 60 * 60 * 25 // 25 hours

export function getAESTDateKey(): string {
  const now = new Date()
  // AEST = UTC+10, AEDT = UTC+11; use a simple offset
  const aest = new Date(now.getTime() + 10 * 60 * 60 * 1000)
  const y = aest.getUTCFullYear()
  const m = String(aest.getUTCMonth() + 1).padStart(2, '0')
  const d = String(aest.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function marketFeedKey(date: string): string {
  return `market-${date}`
}

export function analystKey(analystId: string, date: string): string {
  return `analyst-${analystId}-${date}`
}

export async function getFromKV<T>(key: string): Promise<T | null> {
  try {
    return await kv.get<T>(key)
  } catch {
    return null
  }
}

export async function setInKV<T>(key: string, value: T, ex = KV_TTL): Promise<void> {
  try {
    await kv.set(key, value, { ex })
  } catch (err) {
    console.error('KV set error:', err)
  }
}
