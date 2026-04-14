export type Position = [number, number]

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}

export type RegionGeometry = PolygonGeometry | MultiPolygonGeometry

export interface RegionProperties {
  region: string
  population: number
  gdp: number
}

export interface RegionFeature {
  type: 'Feature'
  geometry: RegionGeometry
  properties: RegionProperties
  id?: number | string
}

export interface RegionFeatureCollection {
  type: 'FeatureCollection'
  features: RegionFeature[]
}

export interface TooltipState {
  x: number
  y: number
  region: RegionProperties
}
