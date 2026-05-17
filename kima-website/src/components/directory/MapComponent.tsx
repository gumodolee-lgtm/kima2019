'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Organization } from '@prisma/client'

declare global {
  interface Window { kakao: any }
}

interface MapComponentProps {
  organizations: Organization[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function MapComponent({ organizations, selectedId, onSelect }: MapComponentProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<any>(null)
  const overlaysRef   = useRef<Map<string, any>>(new Map())
  const infoOverlayRef = useRef<any>(null)
  const onSelectRef   = useRef(onSelect)
  onSelectRef.current = onSelect

  const [ready, setReady] = useState(false)

  // ── 지도 초기화 ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let raf: number

    const tryInit = () => {
      if (typeof window !== 'undefined' && window.kakao?.maps) {
        // autoload=false 이므로 load() 호출 후 콜백에서 maps.Map이 사용 가능
        window.kakao.maps.load(() => {
          if (!containerRef.current) return
          const map = new window.kakao.maps.Map(containerRef.current, {
            center: new window.kakao.maps.LatLng(36.5, 127.9),
            level: 8,
          })
          mapRef.current = map

          // 지도 빈 곳 클릭 시 InfoWindow 닫기
          window.kakao.maps.event.addListener(map, 'click', () => {
            infoOverlayRef.current?.setMap(null)
            infoOverlayRef.current = null
          })

          setReady(true)
        })
      } else {
        raf = requestAnimationFrame(tryInit)
      }
    }

    raf = requestAnimationFrame(tryInit)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── InfoWindow 표시 ───────────────────────────────────────────
  const showInfo = useCallback((org: Organization, pos: any) => {
    infoOverlayRef.current?.setMap(null)
    infoOverlayRef.current = null
    if (!mapRef.current) return

    const wrap = document.createElement('div')
    wrap.style.cssText = [
      'background:white',
      'border-radius:10px',
      'padding:10px 32px 10px 14px',
      'box-shadow:0 4px 16px rgba(0,0,0,0.18)',
      'min-width:150px',
      'max-width:230px',
      'position:relative',
      "font-family:'Noto Sans KR',sans-serif",
    ].join(';')

    const title = document.createElement('p')
    title.style.cssText = 'margin:0 0 3px;font-weight:700;color:#1B3A6B;font-size:13px;line-height:1.4'
    title.textContent = org.name
    wrap.appendChild(title)

    if (org.address) {
      const addr = document.createElement('p')
      addr.style.cssText = 'margin:0;font-size:11px;color:#6b7280;line-height:1.4'
      addr.textContent = org.address
      wrap.appendChild(addr)
    }
    if (org.region) {
      const region = document.createElement('p')
      region.style.cssText = 'margin:2px 0 0;font-size:11px;color:#9ca3af'
      region.textContent = org.region
      wrap.appendChild(region)
    }

    // 닫기 버튼
    const close = document.createElement('button')
    close.textContent = '×'
    close.style.cssText = 'position:absolute;top:6px;right:8px;background:none;border:none;color:#aaa;cursor:pointer;font-size:16px;line-height:1;padding:0'
    close.addEventListener('click', (e) => {
      e.stopPropagation()
      infoOverlayRef.current?.setMap(null)
      infoOverlayRef.current = null
    })
    wrap.appendChild(close)

    // 말풍선 꼬리
    const tail = document.createElement('div')
    tail.style.cssText = 'position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid white;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.08))'
    wrap.appendChild(tail)

    const overlay = new window.kakao.maps.CustomOverlay({
      position: pos,
      content: wrap,
      xAnchor: 0.5,
      yAnchor: 1.18,
      zIndex: 20,
    })
    overlay.setMap(mapRef.current)
    infoOverlayRef.current = overlay
  }, [])

  // ── 마커 갱신 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return

    // 기존 마커·인포 제거
    overlaysRef.current.forEach((ov) => ov.setMap(null))
    overlaysRef.current.clear()
    infoOverlayRef.current?.setMap(null)
    infoOverlayRef.current = null

    const mappable = organizations.filter((o) => o.lat != null && o.lng != null)

    mappable.forEach((org) => {
      const isSelected = org.id === selectedId
      const pos = new window.kakao.maps.LatLng(org.lat!, org.lng!)

      const dot = document.createElement('div')
      const size = isSelected ? 20 : 14
      const bg   = isSelected ? '#1B3A6B' : '#C8922A'
      dot.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `background:${bg}`,
        'border:2.5px solid white',
        'border-radius:50%',
        'cursor:pointer',
        'box-shadow:0 1px 5px rgba(0,0,0,0.35)',
        'transition:transform 0.12s ease',
      ].join(';')

      dot.addEventListener('mouseenter', () => { dot.style.transform = 'scale(1.4)' })
      dot.addEventListener('mouseleave', () => { dot.style.transform = 'scale(1)' })
      dot.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current?.(org.id)
        showInfo(org, pos)
      })

      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: dot,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: isSelected ? 10 : 5,
      })
      overlay.setMap(mapRef.current)
      overlaysRef.current.set(org.id, overlay)
    })

    // 마커가 있으면 전체가 보이도록 bounds 조정
    if (mappable.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds()
      mappable.forEach((o) => bounds.extend(new window.kakao.maps.LatLng(o.lat!, o.lng!)))
      mapRef.current.setBounds(bounds)
    }

    // 선택된 단체 InfoWindow 표시
    if (selectedId) {
      const org = mappable.find((o) => o.id === selectedId)
      if (org) {
        const pos = new window.kakao.maps.LatLng(org.lat!, org.lng!)
        mapRef.current.panTo(pos)
        showInfo(org, pos)
      }
    }
  }, [ready, organizations, selectedId, showInfo])

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

  if (!kakaoKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <p className="text-sm font-medium text-gray-600">지도를 표시하려면</p>
          <p className="text-xs text-gray-400 mt-1">
            NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수를 설정해 주세요
          </p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
