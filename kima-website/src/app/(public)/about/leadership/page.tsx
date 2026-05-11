import type { Metadata } from 'next'

export const metadata: Metadata = { title: '임원단 소개 | KIMA' }

const LEADERS = [
  { title: '대표', name: '이창호', region: '서울', org: '사무국', bio: '한국이주민선교연합회 창립 이후 대표직을 맡아 전국 다문화사역 연합을 이끌고 있습니다.' },
  { title: '서울경기인천 위원장', name: '홍○○', region: '서울경기인천', org: '', bio: '서울·경기·인천 지역 다문화사역 단체들의 연합을 담당합니다.' },
  { title: '부산경남 위원장', name: '김○○', region: '부산경남', org: '', bio: '부산·경남 지역 이주민 사역 네트워크를 총괄합니다.' },
  { title: '대구경북 위원장', name: '박○○', region: '대구경북', org: '', bio: '대구·경북 지역 다문화사역 협력을 이끕니다.' },
  { title: '광주전라 위원장', name: '최○○', region: '광주전라', org: '', bio: '광주·전라 지역 이주민 사역자들의 연합을 담당합니다.' },
  { title: '대전충청 위원장', name: '정○○', region: '대전충청', org: '', bio: '대전·충청 지역 다문화사역 네트워크를 총괄합니다.' },
  { title: '강원제주 위원장', name: '강○○', region: '강원제주', org: '', bio: '강원·제주 지역 이주민 사역 협력을 담당합니다.' },
]

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Leadership</p>
          <h1 className="text-3xl font-bold">임원단 소개</h1>
          <p className="mt-3 text-blue-200">전국 다문화사역을 이끄는 위원장·임원진을 소개합니다</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEADERS.map((leader) => (
            <div key={leader.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {/* 아바타 */}
              <div className="w-16 h-16 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                {leader.name[0]}
              </div>
              <div className="text-center">
                <p className="text-xs text-[#C8922A] font-semibold mb-1">{leader.title}</p>
                <p className="text-lg font-bold text-gray-900">{leader.name}</p>
                {leader.region && (
                  <p className="text-sm text-gray-400 mt-0.5">{leader.region}</p>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed text-center">{leader.bio}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-12">
          임원단 정보는 순차적으로 업데이트됩니다. 문의: kima20191227@gmail.com
        </p>
      </div>
    </div>
  )
}
