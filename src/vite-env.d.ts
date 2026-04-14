/// <reference types="vite/client" />

declare module '*.geojson' {
  const value: import('./types/regions').RegionFeatureCollection
  export default value
}
