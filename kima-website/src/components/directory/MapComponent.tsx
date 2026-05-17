'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, CircleMarker } from 'leaflet'
import type { Organization } from '@prisma/client'

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

const DOT_DEFAULT  = { color: '#ffffff', fillColor: '#C8922A', fillOpacity: 1, weight: 2, radius: 9 }
const DOT_SELECTED = { color: '#ffffff', fillColor: '#1B3A6B', fillOpacity: 1, weight: 2.5, radius: 12 }

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<LeafletMap | null>(null)
  const markersRef   = useRef<Map<string, CircleMarker>>(new Map())
  const onSelectRef  = useRef(onSelect)
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

      // CartoDB Positron — 깔끔한 베이지/흰 배경 타일
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(mapRef.current)

      setMapReady(true)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
      setMapReady(false)
    }
  }, [])

  // 마커 갱신 — 지도가 준비되거나 단체 목록·선택이 바뀔 때
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const map = mapRef.current

    import('leaflet').then((L) => {
      // 기존 마커 전부 제거
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()

      const mappable = organizations.filter((o) => o.lat != null && o.lng != null)

      mappable.forEach((org) => {
        const style = org.id === selectedId ? DOT_SELECTED : DOT_DEFAULT

        const marker = L.circleMarker([org.lat!, org.lng!], style)
          .addTo(map)
          .bindTooltip(org.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -8],
            className: 'kima-tooltip',
          })

        marker.on('click', () => {
          onSelectRef.current?.(org.id)
        })

        markersRef.current.set(org.id, marker)
      })

      // 마커가 있으면 모든 마커가 보이도록 자동 줌
      if (mappable.length > 0) {
        const bounds = L.latLngBounds(mappable.map((o) => [o.lat!, o.lng!]))
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 })
      }
    })
  }, [mapReady, organizations, selectedId])

  // 선택된 단체 — 지도 이동
  useEffect(() => {
    if (!selectedId) return
    const marker = markersRef.current.get(selectedId)
    if (marker) {
      mapRef.current?.panTo(marker.getLatLng(), { animate: true })
      marker.openTooltip()
    }
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
