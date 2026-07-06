import type { RegionGeometry } from '../types/regions'

export interface RawRegionFeature {
  type: 'Feature'
  geometry: RegionGeometry
  properties?: Record<string, unknown>
}

export interface RawRegionCollection {
  type: 'FeatureCollection'
  features: RawRegionFeature[]
}
