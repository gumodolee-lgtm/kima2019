import type { Metadata } from 'next'

export const metadata: Metadata = { title: '임원단 소개 | KIMA' }

interface Member {
  title: string
  name: string
  org: string
  position?: string   // 직분 (Excel)
  phone?: string      // 핸드폰 번호
  email?: string      // 이메일 (Excel)
  nations?: string    // 사역대상국가 (Excel)
  mission?: string    // 사역구분 (Excel)
}

const ADVISORS: Member[] = [
  { title: '고문',   name: '허명호', org: '월드네이버 대표',            position: '목사/선교사', email: 'hur0121@naver.com',          nations: '200개국 이주민 사역',  mission: '노동자, 이주 가정' },
  { title: '고문',   name: '정노화', org: '군포이주와다문화센터',         position: '선교사',     phone: '010-3880-4980', email: 'pmf@naver.com', nations: '서울경기인천',        mission: '이주노동자, 결혼이민자' },
  { title: '자문위원', name: '신상록', org: '함께하는다문화네트워크 이사장', position: '교장',       email: 'pc745745@nate.com',          nations: '이주민 자녀',         mission: '이주민 자녀 교육' },
  { title: '자문위원', name: '문창선', org: '위디선교회 대표' },
  { title: '자문위원', name: '허은열', org: '씨앗선교교회',              position: '대표',       email: 'all4dcf@hanmail.net',        nations: '다국적',             mission: '노동자, 유학생, 이주 가정, 무슬림, 난민' },
  { title: '자문위원', name: '서기원', org: '부천몽골교회',              position: '담임목사',    email: 'Worldfamily333@gmail.com',   nations: '몽골',               mission: '노동자, 유학생, 이주 가정' },
  { title: '자문위원', name: '이승주', org: '탄자니아 선교사 / 귀국 후 이주민지원사역', position: '선교사', email: 'kkamjwi@gmail.com', nations: '탄자니아, 중동',     mission: '노동자, 유학생' },
  { title: '자문위원', name: '박찬식', org: '국제이주자선교포럼 대표',    position: '선교사',     email: 'kcisr@hanmail.net',          nations: '이주민선교 연구(중국)', mission: '노동자' },
]

const EXECUTIVES: Member[] = [
  { title: '상임대표',   name: '남양규', org: '서울내이션즈교회',         position: '목사',    email: 'namnamadfc@hanmail.net',     nations: '이주민',              mission: '노동자, 유학생' },
  { title: '공동대표',   name: '최고수', org: '공촌교회',                position: '담임목사', email: 'choigosu60@naver.com',       nations: '몽골',                mission: '노동자, 유학생, 이주 가정' },
  { title: '공동대표',   name: '안정호', org: '송우벗사랑베트남교회',     position: '선교목사', email: 'jeongho7001@hanmail.com',    nations: '베트남, 북한, 이스라엘', mission: '노동자, 유학생, 이주 가정' },
  { title: '공동대표',   name: '이동철', org: '삼목회' },
  { title: '공동대표',   name: '오승재', org: '권능태국인교회 (천안)',    position: '목사',    email: 'thank119@naver.com',         nations: '태국',                mission: '노동자, 유학생, 이주 가정' },
  { title: '감사',      name: '손승호', org: '울산·경남세계선교협의회 사무총장' },
  { title: '감사',      name: '안명호', org: '할렐루야시니어 한국팀장' },
  { title: '훈련원장',  name: '최고수', org: '한영대학교 이주민선교사훈련원', position: '담임목사', email: 'choigosu60@naver.com', nations: '몽골', mission: '노동자, 유학생, 이주 가정' },
  { title: '사무총장',  name: '홍광표', org: '새생명태국인교회',          position: '목사',    email: 'hkp7252@hanmail.net',        nations: '태국, 라오스',         mission: '노동자, 유학생, 이주 가정, 난민' },
  { title: '사무부총장', name: '박세호', org: '킨미니스트리',             position: '목사',    email: 'strongsethpark@gmail.com',   nations: '카렌(미얀마)',          mission: '노동자, 유학생, 이주 가정, 난민' },
  { title: '서기',      name: '이병인', org: '엘림이주민센터',            position: '목사',    email: 'kumohdo@hanmail.net',        nations: '중국',                mission: '이주 가정' },
  { title: '부서기',    name: '정유식', org: '네팔노동자교회',            position: '선교사',  email: 'newhouse2022@naver.com',     nations: '네팔',                mission: '노동자' },
  { title: '회계',      name: '이창호', org: '러브스리랑카교회',          position: '목사',    email: 'dynamic-logos28@hanmail.net', nations: '스리랑카',            mission: '노동자, 이주 가정' },
  { title: '부회계',    name: '강은혜', org: '에스더기도운동 / Global Intercessory Network' },
]

const LANGUAGE_CHAIRS: Member[] = [
  { title: '몽골위원장',      name: '이해동', org: '다하나국제교회',        position: '상임대표·목사', email: 'all4mn@naver.com',          nations: '몽골',              mission: '노동자, 유학생, 이주 가정' },
  { title: '유학생위원장',    name: '정재훈', org: '영락교회 유학생담당' },
  { title: '네팔위원장',      name: '유병설', org: '광탄열방교회',          position: '목사',   email: 'amarina@hanmail.net',        nations: '네팔',              mission: '노동자' },
  { title: '이슬람위원장',    name: '안드레', org: '열무김치회장',          position: '선교사', email: 'ahndrewjoshua@gmail.com',    nations: '23개 아랍 국가',     mission: '노동자, 이주 가정, 무슬림, 난민' },
  { title: '태국위원장',      name: '윤윤경', org: '인천태국인교회',        position: '선교사', email: 'laurayoun@hanmail.net',      nations: '태국',              mission: '노동자, 이주 가정' },
  { title: '스리랑카위원장',  name: '이창호', org: '러브스리랑카교회',      position: '목사',   email: 'dynamic-logos28@hanmail.net', nations: '스리랑카',          mission: '노동자, 이주 가정' },
  { title: '인도네시아위원장', name: '렌디',  org: 'AIC수원지부' },
  { title: '필리핀위원장',    name: '최경식', org: '안산' },
  { title: '러시아권위원장',  name: '한예승', org: '인천하늘영광교회' },
  { title: '중국위원장',      name: '강철민', org: 'KMAC 상임총무' },
]

const REGION_CHAIRS: Member[] = [
  { title: '경기남부 지역위원장', name: '이민기', org: '평택 쉼터교회',              position: '목사',   email: 'meankey00@gmail.com',   nations: '인도네시아, 베트남',  mission: '노동자, 이주 가정' },
  { title: '경기서부 지역위원장', name: '안드레', org: '베이튼누루센터',             position: '선교사', email: 'ahndrewjoshua@gmail.com', nations: '23개 아랍 국가',    mission: '노동자, 이주 가정, 무슬림, 난민' },
  { title: '경기북부 지역위원장', name: '김광현', org: '동두천예수사랑교회' },
  { title: '호남 지역위원장',    name: '김창식', org: '하나되는 교회 / 물댄동산다문화센터', position: '목사', email: 'jj6231118@naver.com', nations: '인도, 파키스탄',    mission: '노동자' },
  { title: '충청 지역위원장',    name: '권정현', org: '싼티팝코리아태국인교회 (천안)' },
  { title: '강원 지역위원장',    name: '노인국', org: '영월서머나교회' },
  { title: '제주 지역위원장',    name: '한용길', org: '사)제주외국인평화공동체' },
]

const DENOMINATION_REPS: Member[] = [
  { title: '합동교단 대표',  name: '최규정', org: '인천올프렌즈교회',          position: '목사/선교사', email: 'gyujungchoi@hotmail.com', nations: '캄보디아',     mission: '노동자, 유학생' },
  { title: '백석교단 대표',  name: '허은열', org: '씨앗선교회 대표',           position: '대표',       email: 'all4dcf@hanmail.net',     nations: '다국적',       mission: '노동자, 유학생, 이주 가정, 무슬림, 난민' },
  { title: '통합교단 대표',  name: '도주명', org: '전주 온교회' },
  { title: '순복음교단 대표', name: '이익성', org: '이주민월드비전교회',        position: '목사/선교사', email: 'johnleeik@naver.com',     nations: '페루, 인도',   mission: '노동자, 이주 가정, 무슬림, 난민' },
  { title: '침례교단 대표',  name: '장인식', org: '침례교해외선교회 (지구촌교회파송)', position: '목사/선교사', email: 'yindeej@daum.net',   nations: '태국',         mission: '노동자, 유학생, 이주 가정' },
  { title: '대신교단 대표',  name: '박만규', org: '세종시',                   position: '목사/선교사', email: 'maranatha300@naver.com',  nations: '동남아',       mission: '노동자, 이주 가정' },
  { title: '고신교단 대표',  name: '강하전', org: '부산 중국인 유학생 선교사' },
  { title: '합신교단 대표',  name: '박용수', org: '용인대 중국인 유학생 선교사' },
  { title: '기장교단 대표',  name: '이정혁', org: '',                         position: '목사',       email: '5663004@hanmail.net',     nations: '중국',         mission: '노동자, 동포' },
]

const NETWORK_CHAIRS: Member[] = [
  { title: '현지인사역자네트워크위원장', name: '하니프', org: '한국미술인선교회 선교사' },
  { title: '지역교회네트워크위원장',   name: '김귀희', org: '사랑의 교회, 디아스포라 고문' },
]

function MemberCard({ title, name, org, position, phone, email, nations, mission }: Member) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
        {name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#C8922A] font-semibold">{title}</p>
        <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
          <p className="text-base font-bold text-gray-900">{name}</p>
          {position && (
            <span className="text-xs text-gray-400 font-medium">{position}</span>
          )}
        </div>
        {org && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{org}</p>}

        {(nations || mission || phone || email) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 space-y-1">
            {nations && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 w-14">대상국가</span>
                <span className="text-xs text-gray-600 leading-snug">{nations}</span>
              </div>
            )}
            {mission && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 w-14">사역구분</span>
                <span className="text-xs text-gray-600 leading-snug">{mission}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 w-14">연락처</span>
                <a
                  href={`tel:${phone}`}
                  className="text-xs text-[#1B3A6B] hover:underline leading-snug"
                >
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 w-14">이메일</span>
                <a
                  href={`mailto:${email}`}
                  className="text-xs text-[#1B3A6B] hover:underline break-all leading-snug"
                >
                  {email}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, members }: { title: string; members: Member[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-[#1B3A6B] border-b-2 border-[#C8922A] pb-2 mb-5 inline-block">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <MemberCard key={`${m.name}-${i}`} {...m} />
        ))}
      </div>
    </section>
  )
}

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#1B3A6B] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#C8922A] text-sm font-semibold tracking-widest uppercase mb-2">Leadership</p>
          <h1 className="text-3xl font-bold">임원단 소개</h1>
          <p className="mt-3 text-blue-200">KIMA 4기 임원단 · 2026년 5월 7일 현재</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Section title="고문 · 자문위원" members={ADVISORS} />
        <Section title="핵심 임원" members={EXECUTIVES} />
        <Section title="언어권 위원장" members={LANGUAGE_CHAIRS} />
        <Section title="지역 위원장" members={REGION_CHAIRS} />
        <Section title="교단 대표" members={DENOMINATION_REPS} />
        <Section title="네트워크 위원장" members={NETWORK_CHAIRS} />

        <p className="text-center text-sm text-gray-400 mt-4">
          문의: kima20191227@gmail.com
        </p>
      </div>
    </div>
  )
}
