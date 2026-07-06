import { useCallback, useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import { scaleQuantile } from 'd3-scale'
import { interpolateMagma } from 'd3-scale-chromatic'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import { Legend } from '../components/Legend'
import type { Metric, RegionFeature, RegionProperties, TooltipState } from '../types/regions'

const MAGMA8 = Array.from({ length: 8 }, (_, i) => interpolateMagma(0.15 + (i / 7) * 0.75))

interface GlobeMapProps {
  metric: Metric
  onRegionClick: (region: RegionProperties) => void
}

export function GlobeMap({ metric, onRegionClick }: GlobeMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hoveredRegionRef = useRef<RegionFeature | null>(null)
  const mousePosRef = useRef({ x: 0, y: 0 })

  const [hoveredRegion, setHoveredRegion] = useState<RegionFeature | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [size, setSize] = useState({ width: 920, height: 460 })

  const colorScale = scaleQuantile<string>()
    .domain(
      regionsGeoJson.features.map((f) =>
        metric === 'gdp' ? f.properties.gdp : f.properties.population,
      ),
    )
    .range(MAGMA8)

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.34
      controls.enablePan = false
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = Math.max(320, Math.floor(entry.contentRect.width))
      setSize({ width, height: Math.max(360, Math.floor(width * 0.5)) })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleMouseEnterCanvas = useCallback(() => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = false
  }, [])

  const handleMouseLeaveCanvas = useCallback(() => {
    const controls = globeRef.current?.controls()
    if (controls) controls.autoRotate = true
    hoveredRegionRef.current = null
    setHoveredRegion(null)
    setTooltip(null)
  }, [])

  // Always track mouse position so onPolygonHover can use it immediately.
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    mousePosRef.current = { x: event.clientX, y: event.clientY }
    // Update tooltip position if a region is already hovered.
    if (hoveredRegionRef.current) {
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        region: hoveredRegionRef.current.properties,
      })
    }
  }, [])

  const minVal = metric === 'gdp' ? regionValueExtent.minGdp : regionValueExtent.minPopulation
  const maxVal = metric === 'gdp' ? regionValueExtent.maxGdp : regionValueExtent.maxPopulation

  return (
    <section className="map-shell map-shell--globe">
      <header className="map-header">
        <h2>Globe.gl</h2>
        <p>
          Эффектная 3D-визуализация с атмосферой, вращением камеры и объемными полигонами.
          Отлично подходит для презентаций, но хуже для точного чтения границ и сравнения соседних регионов.
        </p>
      </header>

      <div
        className="globe-canvas"
        ref={containerRef}
        onMouseEnter={handleMouseEnterCanvas}
        onMouseLeave={handleMouseLeaveCanvas}
        onMouseMove={handleMouseMove}
      >
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="#020617"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#60a5fa"
          atmosphereAltitude={0.22}
          polygonsData={regionsGeoJson.features}
          polygonCapColor={(feature) => {
            const region = feature as RegionFeature
            const isHovered =
              hoveredRegion?.properties.region === region.properties.region
            if (isHovered) return 'rgba(248, 250, 252, 0.9)'
            const value =
              metric === 'gdp' ? region.properties.gdp : region.properties.population
            return colorScale(value)
          }}
          polygonSideColor={() => 'rgba(59, 130, 246, 0.18)'}
          polygonStrokeColor={() => 'rgba(255, 255, 255, 0.6)'}
          polygonAltitude={(feature) => {
            const region = feature as RegionFeature
            const hovered =
              hoveredRegion?.properties.region === region.properties.region
            if (hovered) return 0.22
            const value =
              metric === 'gdp' ? region.properties.gdp : region.properties.population
            const normalized = (value - minVal) / (maxVal - minVal || 1)
            return 0.04 + normalized * 0.14
          }}
          polygonsTransitionDuration={260}
          onPolygonHover={(polygon) => {
            // Second argument is prevPolygon, NOT a mouse event.
            const region = (polygon as RegionFeature | null) ?? null
            hoveredRegionRef.current = region
            setHoveredRegion(region)
            if (region) {
              // Use last known mouse position from handleMouseMove.
              setTooltip({
                x: mousePosRef.current.x,
                y: mousePosRef.current.y,
                region: region.properties,
              })
            } else {
              setTooltip(null)
            }
          }}
          onPolygonClick={(polygon) => {
            const region = polygon as RegionFeature
            if (region?.properties) onRegionClick(region.properties)
          }}
        />
      </div>

      <Legend
        metric={metric}
        min={minVal}
        max={maxVal}
        colorA={MAGMA8[1]}
        colorB={MAGMA8[7]}
      />

      {tooltip && (
        <Tooltip x={tooltip.x} y={tooltip.y} region={tooltip.region} metric={metric} />
      )}
    </section>
  )
}
