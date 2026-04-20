import { useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import { scaleSequential } from 'd3-scale'
import { interpolateMagma } from 'd3-scale-chromatic'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Tooltip } from '../components/Tooltip'
import type { RegionFeature, TooltipState } from '../types/regions'

export function GlobeMap() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<RegionFeature | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 920, height: 460 })

  const colorScale = scaleSequential(interpolateMagma).domain([
    regionValueExtent.minGdp,
    regionValueExtent.maxGdp,
  ])

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.34
      controls.enablePan = false
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      const width = Math.max(320, Math.floor(entry.contentRect.width))
      const nextHeight = Math.max(360, Math.floor(width * 0.5))
      setSize({
        width,
        height: nextHeight,
      })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const tooltip: TooltipState | null = hoveredRegion
    ? {
        x: cursor.x,
        y: cursor.y,
        region: hoveredRegion.properties,
      }
    : null

  return (
    <section
      className="map-shell map-shell--globe"
      onMouseMove={(event) => setCursor({ x: event.clientX, y: event.clientY })}
    >
      <header className="map-header">
        <h2>Globe.gl</h2>
        <p>
          Эффектная 3D-визуализация с атмосферой, вращением камеры и объемными полигонами.
          Отлично подходит для презентаций, но хуже для точного чтения границ и сравнения соседних регионов.
        </p>
      </header>

      <div className="globe-canvas" ref={containerRef}>
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
            const isHovered = hoveredRegion?.properties.region === region.properties.region
            return isHovered ? 'rgba(248, 250, 252, 0.88)' : colorScale(region.properties.gdp)
          }}
          polygonSideColor={() => 'rgba(59, 130, 246, 0.18)'}
          polygonStrokeColor={() => 'rgba(255, 255, 255, 0.65)'}
          polygonAltitude={(feature) => {
            const region = feature as RegionFeature
            const hovered = hoveredRegion?.properties.region === region.properties.region
            return hovered ? 0.2 : 0.08 + region.properties.gdp / 820000
          }}
          polygonsTransitionDuration={260}
          onPolygonHover={(polygon) => {
            setHoveredRegion((polygon as RegionFeature | null) ?? null)
          }}
        />
      </div>

      <Tooltip data={tooltip} label="ВРП" />
    </section>
  )
}
