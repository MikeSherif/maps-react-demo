import { SvgMap } from './maps/SvgMap'
import { MapboxMap } from './maps/MapboxMap'
import { DeckMap } from './maps/DeckMap'
import { GlobeMap } from './maps/GlobeMap'

function App() {
  return (
    <main className="app">
      <header className="hero">

        <h1>Карты России</h1>
        <p className="subtitle">
          Четыре подхода к визуализации на одном наборе данных: SVG, MapLibre GL, Deck.gl и Globe.gl.
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
