import rawRegions from './russia-regions.geojson?raw'
import type {
  RegionFeatureCollection,
  RegionGeometry,
  RegionProperties,
} from '../types/regions'

interface RawRegionFeature {
  type: 'Feature'
  geometry: RegionGeometry
  properties?: Record<string, unknown>
}

interface RawRegionCollection {
  type: 'FeatureCollection'
  features: RawRegionFeature[]
}

const source = JSON.parse(rawRegions) as RawRegionCollection

const estimateMetrics = (name: string, index: number): Pick<RegionProperties, 'population' | 'gdp'> => {
  const seed = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 97
  const population = 450000 + (seed % 10000000)
  const gdp = 18000 + (seed % 125000)
  return { population, gdp }
}

const getRegionName = (raw: RawRegionFeature, index: number): string => {
  const nameLatin = raw.properties?.name_latin
  if (typeof nameLatin === 'string' && nameLatin.trim().length > 0) {
    return nameLatin
  }

  const name = raw.properties?.name
  if (typeof name === 'string' && name.trim().length > 0) {
    return name
  }

  return `Russian Region ${index + 1}`
}

export const regionsGeoJson: RegionFeatureCollection = {
  type: 'FeatureCollection',
  features: source.features.map((feature, index) => {
    const region = getRegionName(feature, index)
    const metrics = estimateMetrics(region, index)

    return {
      type: 'Feature',
      id:
        typeof feature.properties?.cartodb_id === 'number'
          ? feature.properties.cartodb_id
          : index,
      geometry: feature.geometry,
      properties: {
        region,
        population: metrics.population,
        gdp: metrics.gdp,
      },
    }
  }),
}

export const regionValueExtent = regionsGeoJson.features.reduce(
  (acc, feature) => {
    return {
      minGdp: Math.min(acc.minGdp, feature.properties.gdp),
      maxGdp: Math.max(acc.maxGdp, feature.properties.gdp),
      minPopulation: Math.min(acc.minPopulation, feature.properties.population),
      maxPopulation: Math.max(acc.maxPopulation, feature.properties.population),
    }
  },
  {
    minGdp: Number.POSITIVE_INFINITY,
    maxGdp: Number.NEGATIVE_INFINITY,
    minPopulation: Number.POSITIVE_INFINITY,
    maxPopulation: Number.NEGATIVE_INFINITY,
  },
)
