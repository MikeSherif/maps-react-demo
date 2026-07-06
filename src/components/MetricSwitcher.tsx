import type { Metric } from '../types/regions'

interface MetricSwitcherProps {
  value: Metric
  onChange: (metric: Metric) => void
}

export function MetricSwitcher({ value, onChange }: MetricSwitcherProps) {
  return (
    <div className="metric-switcher" role="group" aria-label="Метрика визуализации">
      <button
        className={`metric-btn${value === 'gdp' ? ' metric-btn--active' : ''}`}
        onClick={() => onChange('gdp')}
        type="button"
      >
        ВРП
      </button>
      <button
        className={`metric-btn${value === 'population' ? ' metric-btn--active' : ''}`}
        onClick={() => onChange('population')}
        type="button"
      >
        Население
      </button>
    </div>
  )
}
