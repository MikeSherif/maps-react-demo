import rawRegions from './russia-regions.geojson?raw'
import rawExtra from './extra-regions.geojson?raw'
import type { RawRegionCollection } from './region-types'
import type {
  RegionFeatureCollection,
  RegionProperties,
} from '../types/regions'

const source = JSON.parse(rawRegions) as RawRegionCollection
const extraSource = JSON.parse(rawExtra) as RawRegionCollection

// Реальные (приближённые) данные по ключевым регионам.
// Население — человек, ВРП — млн руб (ориентировочно по данным Росстата).
const REAL_DATA: Record<string, { population: number; gdp: number }> = {
  'Москва':                               { population: 13010000, gdp: 26200000 },
  'Санкт-Петербург':                      { population: 5600000,  gdp: 6100000  },
  'Московская область':                   { population: 8700000,  gdp: 4450000  },
  'Краснодарский край':                   { population: 5900000,  gdp: 3200000  },
  'Свердловская область':                 { population: 4300000,  gdp: 3100000  },
  'Татарстан':                            { population: 4000000,  gdp: 3000000  },
  'Ханты-Мансийский автономный округ - Югра': { population: 1700000, gdp: 6900000 },
  'Ямало-Ненецкий автономный округ':      { population: 560000,   gdp: 4100000  },
  'Красноярский край':                    { population: 2900000,  gdp: 2700000  },
  'Ростовская область':                   { population: 4100000,  gdp: 2000000  },
  'Башкортостан':                         { population: 4100000,  gdp: 1900000  },
  'Нижегородская область':                { population: 3100000,  gdp: 1900000  },
  'Кемеровская область':                  { population: 2600000,  gdp: 1750000  },
  'Иркутская область':                    { population: 2400000,  gdp: 1750000  },
  'Самарская область':                    { population: 3100000,  gdp: 1700000  },
  'Тюменская область':                    { population: 1600000,  gdp: 1700000  },
  'Пермский край':                        { population: 2600000,  gdp: 1550000  },
  'Сахалинская область':                  { population: 480000,   gdp: 1500000  },
  'Оренбургская область':                 { population: 1900000,  gdp: 1100000  },
  'Вологодская область':                  { population: 1150000,  gdp: 900000   },
  'Ленинградская область':                { population: 2050000,  gdp: 1450000  },
  'Челябинская область':                  { population: 3400000,  gdp: 1600000  },
  'Волгоградская область':                { population: 2500000,  gdp: 1000000  },
  'Новосибирская область':                { population: 2900000,  gdp: 1450000  },
  'Омская область':                       { population: 1950000,  gdp: 900000   },
  // Новые субъекты
  'Республика Крым':                      { population: 2416000,  gdp: 370000   },
  'Херсонская область':                   { population: 1060000,  gdp: 168000   },
  'Запорожская область':                  { population: 1700000,  gdp: 285000   },
  'Донецкая Народная Республика':         { population: 2150000,  gdp: 420000   },
  'Луганская Народная Республика':        { population: 1450000,  gdp: 210000   },
}

const estimateMetrics = (
  name: string,
  index: number,
): Pick<RegionProperties, 'population' | 'gdp'> => {
  if (REAL_DATA[name]) {
    return REAL_DATA[name]
  }
  const seed = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 97
  const population = 450000 + (seed % 2500000)
  const gdp = 180000 + (seed % 900000)
  return { population, gdp }
}

const getRegionName = (
  feature: RawRegionCollection['features'][number],
  index: number,
): string => {
  const name = feature.properties?.name
  if (typeof name === 'string' && name.trim().length > 0) {
    return name
  }
  const nameLatin = feature.properties?.name_latin
  if (typeof nameLatin === 'string' && nameLatin.trim().length > 0) {
    return nameLatin
  }
  return `Регион России ${index + 1}`
}

// Объединяем исходный датасет с регионами из Natural Earth.
const allRawFeatures = [...source.features, ...extraSource.features]

// Первый проход — базовые данные без rank/share.
type BaseFeature = Omit<RegionFeatureCollection['features'][number], 'properties'> & {
  properties: Pick<RegionProperties, 'region' | 'population' | 'gdp'>
}

const baseFeatures: BaseFeature[] = allRawFeatures.map((feature, index) => {
  const region = getRegionName(feature, index)
  const metrics = estimateMetrics(region, index)
  return {
    type: 'Feature',
    id:
      typeof feature.properties?.cartodb_id === 'number'
        ? feature.properties.cartodb_id
        : index,
    geometry: feature.geometry,
    properties: { region, population: metrics.population, gdp: metrics.gdp },
  }
})

// Суммы для вычисления доли.
const totalPopulation = baseFeatures.reduce((s, f) => s + f.properties.population, 0)
const totalGdp = baseFeatures.reduce((s, f) => s + f.properties.gdp, 0)

// Ранги (1 = наибольшее значение).
const byPopulation = [...baseFeatures]
  .sort((a, b) => b.properties.population - a.properties.population)
  .map((f) => f.properties.region)

const byGdp = [...baseFeatures]
  .sort((a, b) => b.properties.gdp - a.properties.gdp)
  .map((f) => f.properties.region)

const populationRankMap = new Map(byPopulation.map((name, i) => [name, i + 1]))
const gdpRankMap = new Map(byGdp.map((name, i) => [name, i + 1]))

export const regionsGeoJson: RegionFeatureCollection = {
  type: 'FeatureCollection',
  features: baseFeatures.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      populationRank: populationRankMap.get(f.properties.region) ?? 0,
      gdpRank: gdpRankMap.get(f.properties.region) ?? 0,
      populationShare:
        Math.round((f.properties.population / totalPopulation) * 1000) / 10,
      gdpShare: Math.round((f.properties.gdp / totalGdp) * 1000) / 10,
    },
  })),
}

export const regionValueExtent = regionsGeoJson.features.reduce(
  (acc, feature) => ({
    minGdp: Math.min(acc.minGdp, feature.properties.gdp),
    maxGdp: Math.max(acc.maxGdp, feature.properties.gdp),
    minPopulation: Math.min(acc.minPopulation, feature.properties.population),
    maxPopulation: Math.max(acc.maxPopulation, feature.properties.population),
  }),
  {
    minGdp: Number.POSITIVE_INFINITY,
    maxGdp: Number.NEGATIVE_INFINITY,
    minPopulation: Number.POSITIVE_INFINITY,
    maxPopulation: Number.NEGATIVE_INFINITY,
  },
)

export const totalRegions = regionsGeoJson.features.length
