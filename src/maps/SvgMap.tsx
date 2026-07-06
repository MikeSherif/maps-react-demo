import { useMemo, useState, type MouseEvent } from 'react'
import { geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { scaleQuantile } from 'd3-scale'
import { schemeBlues, schemeOranges } from 'd3-scale-chromatic'
import type { FeatureCollection, Geometry } from 'geojson'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import { Legend } from '../components/Legend'
import type { Metric, RegionFeature, RegionProperties, TooltipState } from '../types/regions'

const WIDTH = 920
const HEIGHT = 460
const LABEL_MIN_WIDTH = 32

interface SvgMapProps {
  metric: Metric
  onRegionClick: (region: RegionProperties) => void
}

export function SvgMap({ metric, onRegionClick }: SvgMapProps) {
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const colorScale = useMemo(() => {
    const values = regionsGeoJson.features.map((f) =>
      metric === 'gdp' ? f.properties.gdp : f.properties.population,
    )
    const scheme = metric === 'gdp' ? schemeBlues[8] : schemeOranges[8]
    return scaleQuantile<string>().domain(values).range(scheme)
  }, [metric])

  const projection = useMemo(() => {
    return geoMercator().fitExtent(
      [
        [16, 18],
        [WIDTH - 20, HEIGHT - 18],
      ],
      regionsGeoJson as unknown as FeatureCollection<Geometry>,
    )
  }, [])

  const pathGenerator = useMemo(() => geoPath(projection), [projection])

  const centroids = useMemo(() => {
    return regionsGeoJson.features.map((feature) => {
      const bounds = pathGenerator.bounds(
        feature as unknown as GeoPermissibleObjects,
      )
      const bboxWidth = bounds[1][0] - bounds[0][0]
      if (bboxWidth < LABEL_MIN_WIDTH) return null
      const centroid = pathGenerator.centroid(
        feature as unknown as GeoPermissibleObjects,
      )
      if (!centroid || !isFinite(centroid[0]) || !isFinite(centroid[1])) return null
      return { name: feature.properties.region, cx: centroid[0], cy: centroid[1] }
    })
  }, [pathGenerator])

  const onEnter = (feature: RegionFeature, event: MouseEvent<SVGPathElement>) => {
    setHoveredName(feature.properties.region)
    setTooltip({ x: event.clientX, y: event.clientY, region: feature.properties })
  }

  const onMove = (feature: RegionFeature, event: MouseEvent<SVGPathElement>) => {
    setTooltip({ x: event.clientX, y: event.clientY, region: feature.properties })
  }

  const minVal = metric === 'gdp' ? regionValueExtent.minGdp : regionValueExtent.minPopulation
  const maxVal = metric === 'gdp' ? regionValueExtent.maxGdp : regionValueExtent.maxPopulation
  const scheme = metric === 'gdp' ? schemeBlues[8] : schemeOranges[8]

  return (
    <section className="map-shell map-shell--svg">
      <header className="map-header">
        <h2>SVG-карта</h2>
        <p>
          Ручной рендеринг GeoJSON в SVG-path. Максимальный контроль над версткой,
          анимациями и кастомным взаимодействием, но слабее масштабируется на очень больших наборах данных.
        </p>
      </header>

      <svg className="svg-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
        {regionsGeoJson.features.map((feature) => {
          const regionName = feature.properties.region
          const isHovered = hoveredName === regionName
          const value = metric === 'gdp' ? feature.properties.gdp : feature.properties.population

          return (
            <path
              key={regionName}
              d={pathGenerator(feature as unknown as GeoPermissibleObjects) ?? ''}
              fill={colorScale(value)}
              stroke="#ffffff"
              strokeWidth={isHovered ? 2.3 : 0.7}
              style={{
                opacity: isHovered ? 1 : 0.88,
                transition: 'all 160ms ease',
                filter: isHovered
                  ? 'drop-shadow(0px 0px 9px rgba(37, 99, 235, 0.75))'
                  : 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(event) => onEnter(feature, event)}
              onMouseMove={(event) => onMove(feature, event)}
              onMouseLeave={() => {
                setHoveredName(null)
                setTooltip(null)
              }}
              onClick={() => onRegionClick(feature.properties)}
            />
          )
        })}

        {centroids.map((c) => {
          if (!c) return null
          return (
            <text
              key={`lbl-${c.name}`}
              x={c.cx}
              y={c.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#0f172a"
              style={{
                pointerEvents: 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                paintOrder: 'stroke',
                stroke: 'rgba(255,255,255,0.7)',
                strokeWidth: 2.5,
              }}
            >
              {c.name.length > 14 ? c.name.slice(0, 13) + '…' : c.name}
            </text>
          )
        })}
      </svg>

      <Legend
        metric={metric}
        min={minVal}
        max={maxVal}
        colorA={scheme[1]}
        colorB={scheme[7]}
      />

      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} region={tooltip.region} metric={metric} />}
    </section>
  )
}
