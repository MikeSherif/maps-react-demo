import { useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { GeoJsonLayer } from '@deck.gl/layers'
import type { PickingInfo } from '@deck.gl/core'
import { scaleSequential } from 'd3-scale'
import { interpolateTurbo } from 'd3-scale-chromatic'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import type { RegionFeature, RegionProperties, TooltipState } from '../types/regions'

const initialViewState = {
  longitude: 92,
  latitude: 60,
  zoom: 1.52,
  minZoom: 1,
  maxZoom: 6,
  pitch: 30,
  bearing: 2,
}

export function DeckMap() {
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const colorScale = useMemo(() => {
    return scaleSequential(interpolateTurbo).domain([
      regionValueExtent.minPopulation,
      regionValueExtent.maxPopulation,
    ])
  }, [])

  const layer = useMemo(() => {
    return new GeoJsonLayer<RegionProperties>({
      id: 'deck-russia-regions',
      data: regionsGeoJson.features,
      pickable: true,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 1.2,
      getLineColor: [255, 255, 255, 235],
      getFillColor: (feature) => {
        const rgb = colorScale(feature.properties.population)
          .replace('rgb(', '')
          .replace(')', '')
          .split(',')
          .map((value: string) => Number(value.trim()))

        const [r, g, b] = rgb
        const isHovered = hoveredName === feature.properties.region
        return [r, g, b, isHovered ? 255 : 195]
      },
      getElevation: (feature) => feature.properties.gdp / 1750,
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
        getFillColor: hoveredName,
      },
    })
  }, [colorScale, hoveredName])

  return (
    <section className="map-shell map-shell--deck">
      <header className="map-header">
        <h2>Deck.gl (GPU Rendering)</h2>
        <p>High-performance `GeoJsonLayer` with color scaling and elevation encoding.</p>
      </header>

      <div className="deck-canvas">
        <DeckGL
          initialViewState={initialViewState}
          controller
          layers={[layer]}
          getCursor={() => (hoveredName ? 'pointer' : 'grab')}
          onHover={(info: PickingInfo) => {
            const feature = info.object as RegionFeature | null
            if (!feature || info.x === undefined || info.y === undefined) {
              setHoveredName(null)
              setTooltip(null)
              return
            }

            setHoveredName(feature.properties.region)
            setTooltip({
              x: info.x,
              y: info.y,
              region: feature.properties,
            })
          }}
        />
      </div>
      <Tooltip data={tooltip} label="GDP Index" />
    </section>
  )
}
