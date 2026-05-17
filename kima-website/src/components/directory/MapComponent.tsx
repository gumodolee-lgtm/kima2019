'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { Organization } from '@prisma/client'

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

// KIMA 네이비 색상의 SVG 마커
function makeIcon(L: typeof import('leaflet'), color = '#1B3A6B') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

function makeSelectedIcon(L: typeof import('leaflet')) {
  return makeIcon(L, '#C8922A')
}

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const [mapReady, setMapReady] = useState(false)

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      mapRef.current = L.map(containerRef.current, {
        center: [36.5, 127.9],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapRef.current)

      setMapReady(true)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
      setMapReady(false)
    }
  }, [])

  // 마커 갱신 — 지도가 준비되거나 단체 목록이 바뀔 때
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    import('leaflet').then((L) => {
      // 기존 마커 제거
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()

      const defaultIcon = makeIcon(L)
      const selectedIcon = makeSelectedIcon(L)

      const mappable = organizations.filter((o) => o.lat != null && o.lng != null)

      mappable.forEach((org) => {
        const icon = org.id === selectedId ? selectedIcon : defaultIcon
        const marker = L.marker([org.lat!, org.lng!], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:140px;font-family:inherit">
              <p style="font-weight:700;color:#1B3A6B;margin:0 0 3px;font-size:13px">${org.name}</p>
              ${org.region ? `<p style="font-size:11px;color:#6b7280;margin:0">${org.region}</p>` : ''}
              ${org.languages?.length ? `<p style="font-size:11px;color:#9ca3af;margin:2px 0 0">${(org.languages as string[]).join(' · ')}</p>` : ''}
            </div>`
          )
        marker.on('click', () => onSelectRef.current?.(org.id))
        markersRef.current.set(org.id, marker)
      })

      // 마커가 있으면 지도 범위 자동 조정
      if (mappable.length > 0) {
        const bounds = L.latLngBounds(mappable.map((o) => [o.lat!, o.lng!]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      }
    })
  }, [mapReady, organizations, selectedId])

  // 선택된 단체 팝업 열기
  useEffect(() => {
    if (!selectedId) return
    const marker = markersRef.current.get(selectedId)
    if (marker) {
      marker.openPopup()
      mapRef.current?.panTo(marker.getLatLng(), { animate: true })
    }
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
