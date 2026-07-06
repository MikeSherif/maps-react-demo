import { createPortal } from 'react-dom'
import type { Metric, RegionProperties } from '../types/regions'
import { totalRegions } from '../data/regions'

interface TooltipProps {
  x: number
  y: number
  region: RegionProperties
  metric: Metric
}

const formatRu = (value: number) => new Intl.NumberFormat('ru-RU').format(value)

export function Tooltip({ x, y, region, metric }: TooltipProps) {
  const rank = metric === 'gdp' ? region.gdpRank : region.populationRank
  const share = metric === 'gdp' ? region.gdpShare : region.populationShare

  return createPortal(
    <div
      className="tooltip"
      style={{
        left: x + 14,
        top: y - 10,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="tooltip-title">{region.region}</div>
      <div className="tooltip-row">
        <span className="tooltip-label">Население</span>
        <span className="tooltip-value">{formatRu(region.population)}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">ВРП</span>
        <span className="tooltip-value">{formatRu(region.gdp)}</span>
      </div>
      <div className="tooltip-divider" />
      <div className="tooltip-row tooltip-row--accent">
        <span className="tooltip-label">
          {metric === 'gdp' ? 'Рейтинг по ВРП' : 'Рейтинг по населению'}
        </span>
        <span className="tooltip-value">
          #{rank} / {totalRegions}
        </span>
      </div>
      <div className="tooltip-row tooltip-row--accent">
        <span className="tooltip-label">Доля от РФ</span>
        <span className="tooltip-value">{share}%</span>
      </div>
    </div>,
    document.body,
  )
}
