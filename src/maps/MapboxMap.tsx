import { useEffect, useRef } from 'react'
import maplibregl, { type MapGeoJSONFeature, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { regionsGeoJson, regionValueExtent } from '../data/regions'
import { Legend } from '../components/Legend'
import type { Metric, RegionProperties } from '../types/regions'

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'dark-background',
      type: 'background',
      paint: { 'background-color': '#070b18' },
    },
  ],
}

const formatRuNumber = (value: number): string => value.toLocaleString('ru-RU')

const gdpExpression = (minGdp: number, maxGdp: number): maplibregl.ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['get', 'gdp'],
  minGdp,   '#1f3b87',
  (minGdp + maxGdp) / 2, '#2f87c6',
  maxGdp,   '#70d8ff',
]

const populationExpression = (
  minPop: number,
  maxPop: number,
): maplibregl.ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['get', 'population'],
  minPop,   '#7f2704',
  (minPop + maxPop) / 2, '#e05c00',
  maxPop,   '#fed7aa',
]

interface MapboxMapProps {
  metric: Metric
  onRegionClick: (region: RegionProperties) => void
}

export function MapboxMap({ metric, onRegionClick }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const metricRef = useRef<Metric>(metric)
  const onClickRef = useRef(onRegionClick)

  useEffect(() => { metricRef.current = metric }, [metric])
  useEffect(() => { onClickRef.current = onRegionClick }, [onRegionClick])

  // Update paint when metric changes after map is ready.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const expr = metric === 'gdp'
      ? gdpExpression(regionValueExtent.minGdp, regionValueExtent.maxGdp)
      : populationExpression(regionValueExtent.minPopulation, regionValueExtent.maxPopulation)

    map.setPaintProperty('region-fills', 'fill-color', expr)
  }, [metric])

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [95, 60],
      zoom: 1.45,
      minZoom: 1,
      maxZoom: 6,
      pitch: 14,
      dragRotate: false,
      attributionControl: false,
      renderWorldCopies: false,
    })

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    let hoveredId: number | string | null = null

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 8,
      className: 'region-popup',
    })

    map.on('load', () => {
      map.addSource('regions', {
        type: 'geojson',
        data: regionsGeoJson,
        generateId: true,
      })

      const initialExpr = metricRef.current === 'gdp'
        ? gdpExpression(regionValueExtent.minGdp, regionValueExtent.maxGdp)
        : populationExpression(regionValueExtent.minPopulation, regionValueExtent.maxPopulation)

      map.addLayer({
        id: 'region-fills',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': initialExpr,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.9,
            0.65,
          ],
          'fill-opacity-transition': { duration: 180 },
        },
      })

      map.addLayer({
        id: 'region-borders',
        type: 'line',
        source: 'regions',
        paint: {
          'line-color': '#f8fafc',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0.8,
          ],
          'line-opacity': 0.7,
        },
      })

      map.addLayer({
        id: 'region-labels',
        type: 'symbol',
        source: 'regions',
        minzoom: 3,
        layout: {
          'text-field': ['get', 'region'],
          'text-size': 11,
          'text-font': ['Open Sans Regular'],
          'text-anchor': 'center',
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#f8fafc',
          'text-halo-color': '#070b18',
          'text-halo-width': 1.5,
        },
      })

      map.on('mousemove', 'region-fills', (event) => {
        const feature = event.features?.[0] as MapGeoJSONFeature | undefined
        if (!feature?.properties) return

        if (hoveredId !== null) {
          map.setFeatureState({ source: 'regions', id: hoveredId }, { hover: false })
        }
        hoveredId = feature.id ?? null
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'regions', id: hoveredId }, { hover: true })
        }

        const props = feature.properties
        const cur = metricRef.current
        const rankHtml = cur === 'gdp'
          ? `Рейтинг по ВРП: #${props.gdpRank}`
          : `Рейтинг по населению: #${props.populationRank}`
        const shareHtml = cur === 'gdp'
          ? `Доля ВРП: ${props.gdpShare}%`
          : `Доля населения: ${props.populationShare}%`

        popup
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${props.region}</strong><br/>` +
            `Население: ${formatRuNumber(Number(props.population))}<br/>` +
            `ВРП: ${formatRuNumber(Number(props.gdp))}<br/>` +
            `<span style="opacity:0.75;font-size:0.85em">${rankHtml} &bull; ${shareHtml}</span>`,
          )
          .addTo(map)
      })

      map.on('mouseleave', 'region-fills', () => {
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'regions', id: hoveredId }, { hover: false })
        }
        hoveredId = null
        popup.remove()
      })

      map.on('click', 'region-fills', (event) => {
        const feature = event.features?.[0] as MapGeoJSONFeature | undefined
        if (!feature?.properties) return

        onClickRef.current(feature.properties as RegionProperties)
        map.flyTo({ center: event.lngLat, zoom: 4, duration: 800 })
      })
    })

    return () => {
      popup.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <section className="map-shell map-shell--mapbox">
      <header className="map-header">
        <h2>MapLibre GL</h2>
        <p>
          Современная веб-карта с плавным pan/zoom, слоями и `feature-state`.
          Сильна в интерактивных картах приложений, но требует аккуратной настройки источников и стилей.
        </p>
      </header>
      <div className="maplibre-canvas" ref={containerRef} />
      <Legend
        metric={metric}
        min={metric === 'gdp' ? regionValueExtent.minGdp : regionValueExtent.minPopulation}
        max={metric === 'gdp' ? regionValueExtent.maxGdp : regionValueExtent.maxPopulation}
        colorA={metric === 'gdp' ? '#1f3b87' : '#7f2704'}
        colorB={metric === 'gdp' ? '#70d8ff' : '#fed7aa'}
      />
    </section>
  )
}
