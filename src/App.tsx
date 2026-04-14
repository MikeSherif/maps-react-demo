import { SvgMap } from './maps/SvgMap'
import { MapboxMap } from './maps/MapboxMap'
import { DeckMap } from './maps/DeckMap'
import { GlobeMap } from './maps/GlobeMap'

function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">React + Vite + TypeScript + GeoJSON</p>
        <h1>Russia Interactive Maps Demo</h1>
        <p className="subtitle">
          Four visualization stacks, one dataset: SVG, MapLibre GL, Deck.gl, and Globe.gl.
        </p>
      </header>

      <div className="maps-grid">
        <SvgMap />
        <MapboxMap />
        <DeckMap />
        <GlobeMap />
      </div>
    </main>
  )
}

export default App
