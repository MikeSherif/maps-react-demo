import { useMemo, useState, type MouseEvent } from 'react'
import { geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { scaleSequential } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
import type { FeatureCollection, Geometry } from 'geojson'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import type { RegionFeature, TooltipState } from '../types/regions'

const WIDTH = 920
const HEIGHT = 460

export function SvgMap() {
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const colorScale = useMemo(() => {
    return scaleSequential(interpolateBlues).domain([
      regionValueExtent.minGdp,
      regionValueExtent.maxGdp,
    ])
  }, [])

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

  const onEnter = (
    feature: RegionFeature,
    event: MouseEvent<SVGPathElement>,
  ) => {
    setHoveredName(feature.properties.region)
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      region: feature.properties,
    })
  }

  const onMove = (
    feature: RegionFeature,
    event: MouseEvent<SVGPathElement>,
  ) => {
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      region: feature.properties,
    })
  }

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

          return (
            <path
              key={regionName}
              d={
                pathGenerator(feature as unknown as GeoPermissibleObjects) ?? ''
              }
              fill={colorScale(feature.properties.gdp)}
              stroke="#ffffff"
              strokeWidth={isHovered ? 2.3 : 1.2}
              style={{
                opacity: isHovered ? 1 : 0.85,
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
            />
          )
        })}
      </svg>

      <Tooltip data={tooltip} label="ВРП" />
    </section>
  )
}
