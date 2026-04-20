import { useEffect, useRef } from 'react'
import maplibregl, { type MapGeoJSONFeature, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { regionsGeoJson } from '../data/regions'

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'dark-background',
      type: 'background',
      paint: {
        'background-color': '#070b18',
      },
    },
  ],
}

const formatRuNumber = (value: number): string => value.toLocaleString('ru-RU')

export function MapboxMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

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
    })

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

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

      map.addLayer({
        id: 'region-fills',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'gdp'],
            18000,
            '#1f3b87',
            56000,
            '#2f87c6',
            128000,
            '#70d8ff',
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.9,
            0.62,
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
            1,
          ],
          'line-opacity': 0.75,
        },
      })

      map.on('mousemove', 'region-fills', (event) => {
        const feature = event.features?.[0] as MapGeoJSONFeature | undefined
        if (!feature || !feature.properties) {
          return
        }

        if (hoveredId !== null) {
          map.setFeatureState({ source: 'regions', id: hoveredId }, { hover: false })
        }

        hoveredId = feature.id ?? null
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'regions', id: hoveredId }, { hover: true })
        }

        const region = feature.properties.region as string
        const population = Number(feature.properties.population)
        const gdp = Number(feature.properties.gdp)

        popup
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${region}</strong><br/>Население: ${formatRuNumber(population)}<br/>ВРП: ${formatRuNumber(gdp)}`,
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
    })

    return () => {
      popup.remove()
      map.remove()
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
    </section>
  )
}
