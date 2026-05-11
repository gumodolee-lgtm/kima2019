'use client'

import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import type { Organization } from '@prisma/client'

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }
const DEFAULT_CENTER = { lat: 36.5, lng: 127.9 } // 한국 중심
const DEFAULT_ZOOM = 7

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const [activeMarker, setActiveMarker] = useState<string | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'kima-google-maps',
  })

  const handleMarkerClick = useCallback(
    (id: string) => {
      setActiveMarker(id)
      onSelect?.(id)
    },
    [onSelect]
  )

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center p-8">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm text-gray-500 font-medium">지도를 표시하려면</p>
          <p className="text-sm text-gray-400">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 환경변수를 설정해 주세요
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl">
        <p className="text-sm text-red-500">지도를 불러오지 못했습니다.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
        <p className="text-sm text-gray-400">지도 로딩 중...</p>
      </div>
    )
  }

  const mappable = organizations.filter((o) => o.lat && o.lng)

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {mappable.map((org) => (
        <Marker
          key={org.id}
          position={{ lat: org.lat!, lng: org.lng! }}
          title={org.name}
          icon={
            selectedId === org.id
              ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
          onClick={() => handleMarkerClick(org.id)}
        />
      ))}
      {activeMarker && (() => {
        const org = organizations.find((o) => o.id === activeMarker)
        if (!org?.lat || !org?.lng) return null
        return (
          <InfoWindow
            position={{ lat: org.lat, lng: org.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 max-w-[160px]">
              <p className="text-sm font-semibold text-[#1B3A6B]">{org.name}</p>
              {org.region && <p className="text-xs text-gray-500 mt-0.5">{org.region}</p>}
            </div>
          </InfoWindow>
        )
      })()}
    </GoogleMap>
  )
}
