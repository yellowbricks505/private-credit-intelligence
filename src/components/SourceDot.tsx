'use client'

const cfg: Record<string, { dot: string; label: string }> = {
  afr: { dot: 'bg-blue-500', label: 'AFR' },
  smh: { dot: 'bg-green-500', label: 'SMH' },
  paywalled: { dot: 'bg-pink-500', label: '' },
  free: { dot: 'bg-slate-400', label: '' },
}

export function SourceDot({
  sourceType,
  source,
}: {
  sourceType: string
  source: string
}) {
  const c = cfg[sourceType] || cfg.free
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {c.label || source}
      </span>
    </span>
  )
}
