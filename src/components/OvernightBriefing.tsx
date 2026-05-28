'use client'

import { useState } from 'react'

export function OvernightBriefing({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
            ☀ Overnight Briefing
          </span>
          {!expanded && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
              {text.slice(0, 80)}…
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {expanded ? 'Collapse ▲' : 'Expand ▼'}
        </button>
      </div>
      {expanded && (
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {text}
        </p>
      )}
    </div>
  )
}
