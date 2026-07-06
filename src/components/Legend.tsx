import type { Metric } from '../types/regions'

interface LegendProps {
  metric: Metric
  min: number
  max: number
  colorA: string
  colorB: string
}

const formatLegendValue = (value: number, metric: Metric): string => {
  if (metric === 'population') {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} млн`
    }
    return `${(value / 1000).toFixed(0)} тыс`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} трлн`
  }
  return `${(value / 1000).toFixed(0)} млрд`
}

export function Legend({ metric, min, max, colorA, colorB }: LegendProps) {
  const gradientId = `legend-grad-${metric}`
  const label = metric === 'gdp' ? 'ВРП' : 'Население'

  return (
    <div className="legend">
      <span className="legend-label">{label}</span>
      <div className="legend-scale">
        <span className="legend-value">{formatLegendValue(min, metric)}</span>
        <svg width="140" height="12" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={colorA} />
              <stop offset="100%" stopColor={colorB} />
            </linearGradient>
          </defs>
          <rect width="140" height="12" rx="3" fill={`url(#${gradientId})`} />
        </svg>
        <span className="legend-value">{formatLegendValue(max, metric)}</span>
      </div>
    </div>
  )
}
