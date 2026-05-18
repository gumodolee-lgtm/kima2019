import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이주민 단체 지도 | KIMA',
  description: '전국 이주민 선교 단체 지도 — GMFSNS 제공',
}

export default function MissionMapPage() {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* 상단 안내 바 */}
      <div className="bg-[#1B3A6B] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[#C8922A] text-xs font-semibold tracking-widest uppercase mr-3">Mission Map</span>
          <span className="text-sm font-semibold">이주민 단체 지도</span>
        </div>
        <a
          href="https://gmfsns.org/missionmap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-200 hover:text-white transition-colors"
        >
          새 탭에서 열기 ↗
        </a>
      </div>

      {/* 지도 iframe */}
      <iframe
        src="https://gmfsns.org/missionmap"
        title="이주민 단체 지도 (GMFSNS)"
        className="flex-1 w-full border-0"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
