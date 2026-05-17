'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker, Icon } from 'leaflet'
import type { Organization } from '@prisma/client'

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<Map<string, Marker>>(new Map())
  const iconRef = useRef<Icon | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

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

      iconRef.current = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // 단체 목록이 바뀔 때마다 마커 갱신
  useEffect(() => {
    if (!mapRef.current || !iconRef.current) {
      // 지도 아직 준비 안 됐으면 잠시 후 재시도
      const timer = setTimeout(() => {
        if (!mapRef.current || !iconRef.current) return
        updateMarkers()
      }, 300)
      return () => clearTimeout(timer)
    }
    updateMarkers()

    function updateMarkers() {
      const map = mapRef.current!
      const icon = iconRef.current!

      // 기존 마커 전부 제거
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()

      // 좌표 있는 단체만 마커 추가
      import('leaflet').then((L) => {
        organizations
          .filter((o) => o.lat != null && o.lng != null)
          .forEach((org) => {
            const marker = L.marker([org.lat!, org.lng!], { icon })
              .addTo(map)
              .bindPopup(
                `<div style="min-width:130px">
                  <p style="font-weight:700;color:#1B3A6B;margin:0 0 2px">${org.name}</p>
                  ${org.region ? `<p style="font-size:12px;color:#6b7280;margin:0">${org.region}</p>` : ''}
                </div>`
              )
            marker.on('click', () => {
              onSelectRef.current?.(org.id)
            })
            markersRef.current.set(org.id, marker)
          })
      })
    }
  }, [organizations])

  // 선택된 단체 팝업 열기
  useEffect(() => {
    if (!selectedId) return
    const marker = markersRef.current.get(selectedId)
    if (marker) marker.openPopup()
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
