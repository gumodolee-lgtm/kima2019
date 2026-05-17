'use client'

import { useEffect, useRef } from 'react'
import type { Organization } from '@prisma/client'

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<{
    map: import('leaflet').Map
    markers: Map<string, import('leaflet').Marker>
  } | null>(null)

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [36.5, 127.9],
        zoom: 7,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const redIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      const markers = new Map<string, import('leaflet').Marker>()

      organizations
        .filter((o) => o.lat && o.lng)
        .forEach((org) => {
          const marker = L.marker([org.lat!, org.lng!], { icon: redIcon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:120px"><strong style="color:#1B3A6B">${org.name}</strong>${org.region ? `<br/><span style="font-size:12px;color:#6b7280">${org.region}</span>` : ''}</div>`
            )
          marker.on('click', () => onSelect?.(org.id))
          markers.set(org.id, marker)
        })

      leafletRef.current = { map, markers }
    })

    return () => {
      leafletRef.current?.map.remove()
      leafletRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!leafletRef.current) return
    const { markers } = leafletRef.current
    markers.forEach((marker, id) => {
      if (id === selectedId) {
        marker.openPopup()
      }
    })
  }, [selectedId])

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl z-0" />
  )
}
