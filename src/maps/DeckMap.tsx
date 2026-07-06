import { useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import { LightingEffect, AmbientLight, DirectionalLight, type PickingInfo } from '@deck.gl/core'
import { scaleQuantile } from 'd3-scale'
import { schemeOranges, schemeBlues } from 'd3-scale-chromatic'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import { Legend } from '../components/Legend'
import type { Metric, RegionFeature, RegionProperties, TooltipState } from '../types/regions'

const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 0.5 })
const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  direction: [-3, -10, -1],
  intensity: 1.2,
})
const lightingEffect = new LightingEffect({ ambientLight, directionalLight })

const initialViewState = {
  longitude: 92,
  latitude: 60,
  zoom: 1.52,
  minZoom: 1,
  maxZoom: 6,
  pitch: 30,
  bearing: 2,
}

const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

interface DeckMapProps {
  metric: Metric
  onRegionClick: (region: RegionProperties) => void
}

export function DeckMap({ metric, onRegionClick }: DeckMapProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const colorScale = useMemo(() => {
    const values = regionsGeoJson.features.map((f) =>
      metric === 'gdp' ? f.properties.gdp : f.properties.population,
    )
    const scheme = metric === 'gdp' ? schemeBlues[8] : schemeOranges[8]
    return scaleQuantile<string>().domain(values).range(scheme)
  }, [metric])

  const elevationExtent = useMemo(() => {
    return metric === 'gdp'
      ? { min: regionValueExtent.minGdp, max: regionValueExtent.maxGdp }
      : { min: regionValueExtent.minPopulation, max: regionValueExtent.maxPopulation }
  }, [metric])

  const layer = useMemo(() => {
    return new GeoJsonLayer<RegionProperties>({
      id: 'deck-russia-regions',
      data: regionsGeoJson.features,
      pickable: true,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 200],
      getFillColor: (feature) => {
        const value = metric === 'gdp' ? feature.properties.gdp : feature.properties.population
        const hex = colorScale(value)
        const rgb = hexToRgb(hex)
        const isHovered = hoveredName === feature.properties.region
        return [...rgb, isHovered ? 255 : 200] as [number, number, number, number]
      },
      getElevation: (feature) => {
        const value = metric === 'gdp' ? feature.properties.gdp : feature.properties.population
        const range = elevationExtent.max - elevationExtent.min
        return range > 0 ? ((value - elevationExtent.min) / range) * 600000 : 0
      },
      extruded: true,
      wireframe: false,
      material: {
        ambient: 0.34,
        diffuse: 0.65,
        shininess: 42,
        specularColor: [145, 189, 255],
      },
      transitions: {
        getFillColor: 200,
        getElevation: 250,
      },
      updateTriggers: {
        getFillColor: [hoveredName, metric],
        getElevation: metric,
      },
      onClick: (info) => {
        const feature = info.object as RegionFeature | null
        if (feature) onRegionClick(feature.properties)
      },
    })
  }, [colorScale, hoveredName, metric, elevationExtent, onRegionClick])

  const minVal = metric === 'gdp' ? regionValueExtent.minGdp : regionValueExtent.minPopulation
  const maxVal = metric === 'gdp' ? regionValueExtent.maxGdp : regionValueExtent.maxPopulation
  const scheme = metric === 'gdp' ? schemeBlues[8] : schemeOranges[8]

  return (
    <section className="map-shell map-shell--deck">
      <header className="map-header">
        <h2>Deck.gl</h2>
        <p>
          GPU-рендеринг через `GeoJsonLayer`: высокая производительность,
          хорош для плотных данных и аналитических слоев. Минусом является более высокий порог входа и сложность кастомизации.
        </p>
      </header>

      <div className="deck-canvas" ref={canvasRef}>
        <DeckGL
          initialViewState={initialViewState}
          controller
          layers={[layer]}
          effects={[lightingEffect]}
          getCursor={() => (hoveredName ? 'pointer' : 'grab')}
          onHover={(info: PickingInfo) => {
            const feature = info.object as RegionFeature | null
            if (!feature || info.x === undefined || info.y === undefined) {
              setHoveredName(null)
              setTooltip(null)
              return
            }
            // info.x/y are relative to the canvas; convert to viewport coords.
            const rect = canvasRef.current?.getBoundingClientRect()
            const x = rect ? rect.left + info.x : info.x
            const y = rect ? rect.top + info.y : info.y
            setHoveredName(feature.properties.region)
            setTooltip({ x, y, region: feature.properties })
          }}
        />
      </div>

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
