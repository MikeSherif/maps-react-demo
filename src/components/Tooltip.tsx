import type { CSSProperties } from 'react'
import type { RegionProperties, TooltipState } from '../types/regions'

interface TooltipProps {
  data: TooltipState | null
  label?: string
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

const tooltipStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 99,
  minWidth: 180,
  maxWidth: 260,
  pointerEvents: 'none',
  borderRadius: 8,
  padding: '10px 12px',
  background:
    'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
  color: '#f8fafc',
  boxShadow: '0 8px 30px rgba(2, 6, 23, 0.35)',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  transform: 'translate(14px, 14px)',
  transition: 'opacity 120ms ease, transform 120ms ease',
}

const TooltipContent = ({
  region,
  label = 'GDP',
}: {
  region: RegionProperties
  label?: string
}) => {
  return (
    <>
      <strong style={{ display: 'block', marginBottom: 4 }}>{region.region}</strong>
      <div style={{ opacity: 0.9, fontSize: 13 }}>
        Population: {formatNumber(region.population)}
      </div>
      <div style={{ opacity: 0.9, fontSize: 13 }}>
        {label}: {formatNumber(region.gdp)}
      </div>
    </>
  )
}

export function Tooltip({ data, label }: TooltipProps) {
  if (!data) {
    return null
  }

  return (
    <div
      style={{
        ...tooltipStyle,
        left: data.x,
        top: data.y,
      }}
      role="status"
    >
      <TooltipContent region={data.region} label={label} />
    </div>
  )
}
