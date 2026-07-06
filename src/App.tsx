import { useState } from 'react'
import { SvgMap } from './maps/SvgMap'
import { MapboxMap } from './maps/MapboxMap'
import { DeckMap } from './maps/DeckMap'
import { GlobeMap } from './maps/GlobeMap'
import { MetricSwitcher } from './components/MetricSwitcher'
import { RegionPanel } from './components/RegionPanel'
import type { Metric, RegionProperties } from './types/regions'

function App() {
  const [metric, setMetric] = useState<Metric>('gdp')
  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(null)

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">React + Vite + TypeScript + GeoJSON</p>
        <h1>Карты России</h1>
        <p className="subtitle">
          Четыре подхода к визуализации на одном наборе данных: SVG, MapLibre GL, Deck.gl и Globe.gl.
        </p>
        <MetricSwitcher value={metric} onChange={setMetric} />
      </header>

      <div className="maps-grid">
        <SvgMap metric={metric} onRegionClick={setSelectedRegion} />
        <MapboxMap metric={metric} onRegionClick={setSelectedRegion} />
        <DeckMap metric={metric} onRegionClick={setSelectedRegion} />
        <GlobeMap metric={metric} onRegionClick={setSelectedRegion} />
      </div>

      <RegionPanel region={selectedRegion} metric={metric} onClose={() => setSelectedRegion(null)} />
    </main>
  )
}

export default App
