'use client'

import {useState} from 'react'

export interface FetchMetric {
  label: string
  durationMs: number
  payloadBytes: number
  itemCount: number
  cacheStatus?: string
  timestamp: number
}

interface Props {
  metrics: FetchMetric[]
}

export function CdnLatencyPanel({metrics}: Props) {
  const [open, setOpen] = useState(false)
  const last = metrics[metrics.length - 1]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">⚡</span>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-bh-dark">
              CDN Latency
            </p>
            {last ? (
              <p className="text-[11px] text-bh-gray">
                Last fetch: <span className="font-mono">{last.durationMs.toFixed(0)}ms</span> ·{' '}
                {last.itemCount} rule{last.itemCount === 1 ? '' : 's'} ·{' '}
                {formatBytes(last.payloadBytes)}
                {last.cacheStatus ? ` · ${last.cacheStatus}` : ''}
              </p>
            ) : (
              <p className="text-[11px] text-bh-gray italic">No fetches yet</p>
            )}
          </div>
        </div>
        <span
          className={`text-bh-gray text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3 max-h-64 overflow-y-auto">
          {metrics.length === 0 ? (
            <p className="text-xs text-bh-gray italic">No metrics recorded.</p>
          ) : (
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-bh-gray text-left">
                  <th className="font-semibold pb-1">Time</th>
                  <th className="font-semibold pb-1">Source</th>
                  <th className="font-semibold pb-1 text-right">Latency</th>
                  <th className="font-semibold pb-1 text-right">Size</th>
                  <th className="font-semibold pb-1 text-right">Items</th>
                  <th className="font-semibold pb-1 text-right">Cache</th>
                </tr>
              </thead>
              <tbody>
                {[...metrics].reverse().map((m, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1 text-bh-gray/70">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-1">{m.label}</td>
                    <td
                      className={`py-1 text-right font-bold ${
                        m.durationMs < 100
                          ? 'text-emerald-600'
                          : m.durationMs < 300
                            ? 'text-amber-600'
                            : 'text-red-600'
                      }`}
                    >
                      {m.durationMs.toFixed(0)}ms
                    </td>
                    <td className="py-1 text-right text-bh-gray">
                      {formatBytes(m.payloadBytes)}
                    </td>
                    <td className="py-1 text-right text-bh-gray">{m.itemCount}</td>
                    <td className="py-1 text-right text-bh-gray">{m.cacheStatus ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-[10px] text-bh-gray/60 leading-relaxed">
            Sanity&apos;s CDN serves the rules in milliseconds.{' '}
            For the JitB use case, this is what makes client-side rule eval feasible
            on every cart open.
          </p>
        </div>
      )}
    </div>
  )
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b}B`
  return `${(b / 1024).toFixed(1)}KB`
}
