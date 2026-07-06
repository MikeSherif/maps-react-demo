import type { Metric, RegionProperties } from '../types/regions'
import { totalRegions } from '../data/regions'

interface RegionPanelProps {
  region: RegionProperties | null
  metric: Metric
  onClose: () => void
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('ru-RU').format(value)

export function RegionPanel({ region, metric, onClose }: RegionPanelProps) {
  return (
    <aside className={`region-panel${region ? ' region-panel--visible' : ''}`}>
      {region && (
        <>
          <button
            className="region-panel__close"
            onClick={onClose}
            type="button"
            aria-label="Закрыть"
          >
            ✕
          </button>

          <h3 className="region-panel__title">{region.region}</h3>

          <dl className="region-panel__list">
            <div className="region-panel__row region-panel__row--highlight">
              <dt>Население</dt>
              <dd>
                {formatNumber(region.population)}
                <span className="region-panel__rank">
                  #{region.populationRank} из {totalRegions}
                </span>
              </dd>
            </div>

            <div className="region-panel__row">
              <dt>Доля населения РФ</dt>
              <dd>{region.populationShare}%</dd>
            </div>

            <div className="region-panel__row region-panel__row--highlight">
              <dt>ВРП</dt>
              <dd>
                {formatNumber(region.gdp)}
                <span className="region-panel__rank">
                  #{region.gdpRank} из {totalRegions}
                </span>
              </dd>
            </div>

            <div className="region-panel__row">
              <dt>Доля ВРП РФ</dt>
              <dd>{region.gdpShare}%</dd>
            </div>
          </dl>

          <p className="region-panel__metric-hint">
            {metric === 'gdp'
              ? 'Карты сейчас показывают ВРП'
              : 'Карты сейчас показывают Население'}
          </p>
        </>
      )}
    </aside>
  )
}
