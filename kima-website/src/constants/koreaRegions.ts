/**
 * 대한민국 행정구역 매핑 상수
 * Province → City/District 전체 목록
 * KIMA region filter (서울/경기/인천/부산경남/...)와 연계
 */

export type Province =
  | '서울특별시' | '경기도' | '인천광역시'
  | '부산광역시' | '경상남도' | '울산광역시'
  | '대구광역시' | '경상북도'
  | '광주광역시' | '전라남도' | '전북특별자치도'
  | '대전광역시' | '충청남도' | '충청북도' | '세종특별자치시'
  | '강원특별자치도' | '제주특별자치도'

export interface CityEntry {
  province: Province
  city: string
  aliases?: string[]
}

/** 시도 단축명 → 공식 전체명 */
export const PROVINCE_ALIASES: Record<string, Province> = {
  // ── 공식 약칭 ──────────────────────────────────────────────
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  강원도: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전라북도: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
  // ── 주소에서 자주 쓰이는 비공식 "시" 약칭 ─────────────────
  서울시: '서울특별시',
  인천시: '인천광역시',
  부산시: '부산광역시',
  대구시: '대구광역시',
  대전시: '대전광역시',
  울산시: '울산광역시',
  세종시: '세종특별자치시',
}

/** Province → KIMA 지역 필터 값 */
export const PROVINCE_TO_KIMA_REGION: Record<Province, string> = {
  서울특별시: '서울',
  경기도: '경기',
  인천광역시: '인천',
  부산광역시: '부산경남',
  경상남도: '부산경남',
  울산광역시: '부산경남',
  대구광역시: '대구경북',
  경상북도: '대구경북',
  광주광역시: '광주전라',
  전라남도: '광주전라',
  전북특별자치도: '광주전라',
  대전광역시: '대전충청',
  충청남도: '대전충청',
  충청북도: '대전충청',
  세종특별자치시: '대전충청',
  강원특별자치도: '강원제주',
  제주특별자치도: '강원제주',
}

export const ALL_PROVINCES: Province[] = [
  '서울특별시', '경기도', '인천광역시',
  '부산광역시', '경상남도', '울산광역시',
  '대구광역시', '경상북도',
  '광주광역시', '전라남도', '전북특별자치도',
  '대전광역시', '충청남도', '충청북도', '세종특별자치시',
  '강원특별자치도', '제주특별자치도',
]

export const KOREA_CITIES: CityEntry[] = [
  // ── 서울특별시 ──────────────────────────────────────────────
  { province: '서울특별시', city: '종로구' },
  { province: '서울특별시', city: '중구' },
  { province: '서울특별시', city: '용산구' },
  { province: '서울특별시', city: '성동구' },
  { province: '서울특별시', city: '광진구' },
  { province: '서울특별시', city: '동대문구' },
  { province: '서울특별시', city: '중랑구' },
  { province: '서울특별시', city: '성북구' },
  { province: '서울특별시', city: '강북구' },
  { province: '서울특별시', city: '도봉구' },
  { province: '서울특별시', city: '노원구' },
  { province: '서울특별시', city: '은평구' },
  { province: '서울특별시', city: '서대문구' },
  { province: '서울특별시', city: '마포구' },
  { province: '서울특별시', city: '양천구' },
  { province: '서울특별시', city: '강서구' },
  { province: '서울특별시', city: '구로구' },
  { province: '서울특별시', city: '금천구' },
  { province: '서울특별시', city: '영등포구' },
  { province: '서울특별시', city: '동작구' },
  { province: '서울특별시', city: '관악구' },
  { province: '서울특별시', city: '서초구' },
  { province: '서울특별시', city: '강남구' },
  { province: '서울특별시', city: '송파구' },
  { province: '서울특별시', city: '강동구' },

  // ── 경기도 ──────────────────────────────────────────────────
  { province: '경기도', city: '수원시', aliases: ['수원'] },
  { province: '경기도', city: '성남시', aliases: ['성남'] },
  { province: '경기도', city: '고양시', aliases: ['고양'] },
  { province: '경기도', city: '용인시', aliases: ['용인'] },
  { province: '경기도', city: '부천시', aliases: ['부천'] },
  { province: '경기도', city: '안산시', aliases: ['안산'] },
  { province: '경기도', city: '안양시', aliases: ['안양'] },
  { province: '경기도', city: '남양주시', aliases: ['남양주'] },
  { province: '경기도', city: '화성시', aliases: ['화성'] },
  { province: '경기도', city: '평택시', aliases: ['평택'] },
  { province: '경기도', city: '의정부시', aliases: ['의정부'] },
  { province: '경기도', city: '시흥시', aliases: ['시흥'] },
  { province: '경기도', city: '파주시', aliases: ['파주'] },
  { province: '경기도', city: '광명시', aliases: ['광명'] },
  { province: '경기도', city: '김포시', aliases: ['김포'] },
  { province: '경기도', city: '군포시', aliases: ['군포'] },
  { province: '경기도', city: '광주시', aliases: ['광주'] },
  { province: '경기도', city: '이천시', aliases: ['이천'] },
  { province: '경기도', city: '양주시', aliases: ['양주'] },
  { province: '경기도', city: '오산시', aliases: ['오산'] },
  { province: '경기도', city: '구리시', aliases: ['구리'] },
  { province: '경기도', city: '안성시', aliases: ['안성'] },
  { province: '경기도', city: '포천시', aliases: ['포천'] },
  { province: '경기도', city: '의왕시', aliases: ['의왕'] },
  { province: '경기도', city: '하남시', aliases: ['하남'] },
  { province: '경기도', city: '여주시', aliases: ['여주'] },
  { province: '경기도', city: '동두천시', aliases: ['동두천'] },
  { province: '경기도', city: '과천시', aliases: ['과천'] },
  { province: '경기도', city: '양평군', aliases: ['양평'] },
  { province: '경기도', city: '가평군', aliases: ['가평'] },
  { province: '경기도', city: '연천군', aliases: ['연천'] },

  // ── 인천광역시 ──────────────────────────────────────────────
  { province: '인천광역시', city: '중구' },
  { province: '인천광역시', city: '동구' },
  { province: '인천광역시', city: '미추홀구' },
  { province: '인천광역시', city: '연수구' },
  { province: '인천광역시', city: '남동구' },
  { province: '인천광역시', city: '부평구' },
  { province: '인천광역시', city: '계양구' },
  { province: '인천광역시', city: '서구' },
  { province: '인천광역시', city: '강화군' },
  { province: '인천광역시', city: '옹진군' },

  // ── 강원특별자치도 ──────────────────────────────────────────
  { province: '강원특별자치도', city: '춘천시', aliases: ['춘천'] },
  { province: '강원특별자치도', city: '원주시', aliases: ['원주'] },
  { province: '강원특별자치도', city: '강릉시', aliases: ['강릉'] },
  { province: '강원특별자치도', city: '동해시', aliases: ['동해'] },
  { province: '강원특별자치도', city: '태백시', aliases: ['태백'] },
  { province: '강원특별자치도', city: '속초시', aliases: ['속초'] },
  { province: '강원특별자치도', city: '삼척시', aliases: ['삼척'] },
  { province: '강원특별자치도', city: '홍천군', aliases: ['홍천'] },
  { province: '강원특별자치도', city: '횡성군', aliases: ['횡성'] },
  { province: '강원특별자치도', city: '영월군', aliases: ['영월'] },
  { province: '강원특별자치도', city: '평창군', aliases: ['평창'] },
  { province: '강원특별자치도', city: '정선군', aliases: ['정선'] },
  { province: '강원특별자치도', city: '철원군', aliases: ['철원'] },
  { province: '강원특별자치도', city: '화천군', aliases: ['화천'] },
  { province: '강원특별자치도', city: '양구군', aliases: ['양구'] },
  { province: '강원특별자치도', city: '인제군', aliases: ['인제'] },
  { province: '강원특별자치도', city: '고성군', aliases: ['고성'] },
  { province: '강원특별자치도', city: '양양군', aliases: ['양양'] },

  // ── 부산광역시 ──────────────────────────────────────────────
  { province: '부산광역시', city: '중구' },
  { province: '부산광역시', city: '서구' },
  { province: '부산광역시', city: '동구' },
  { province: '부산광역시', city: '영도구' },
  { province: '부산광역시', city: '부산진구' },
  { province: '부산광역시', city: '동래구' },
  { province: '부산광역시', city: '남구' },
  { province: '부산광역시', city: '북구' },
  { province: '부산광역시', city: '해운대구' },
  { province: '부산광역시', city: '사하구' },
  { province: '부산광역시', city: '금정구' },
  { province: '부산광역시', city: '강서구' },
  { province: '부산광역시', city: '연제구' },
  { province: '부산광역시', city: '수영구' },
  { province: '부산광역시', city: '사상구' },
  { province: '부산광역시', city: '기장군' },

  // ── 경상남도 ────────────────────────────────────────────────
  { province: '경상남도', city: '창원시', aliases: ['창원'] },
  { province: '경상남도', city: '진주시', aliases: ['진주'] },
  { province: '경상남도', city: '통영시', aliases: ['통영'] },
  { province: '경상남도', city: '사천시', aliases: ['사천'] },
  { province: '경상남도', city: '김해시', aliases: ['김해'] },
  { province: '경상남도', city: '밀양시', aliases: ['밀양'] },
  { province: '경상남도', city: '거제시', aliases: ['거제'] },
  { province: '경상남도', city: '양산시', aliases: ['양산'] },
  { province: '경상남도', city: '의령군', aliases: ['의령'] },
  { province: '경상남도', city: '함안군', aliases: ['함안'] },
  { province: '경상남도', city: '창녕군', aliases: ['창녕'] },
  { province: '경상남도', city: '고성군', aliases: ['고성'] },
  { province: '경상남도', city: '남해군', aliases: ['남해'] },
  { province: '경상남도', city: '하동군', aliases: ['하동'] },
  { province: '경상남도', city: '산청군', aliases: ['산청'] },
  { province: '경상남도', city: '함양군', aliases: ['함양'] },
  { province: '경상남도', city: '거창군', aliases: ['거창'] },
  { province: '경상남도', city: '합천군', aliases: ['합천'] },

  // ── 울산광역시 ──────────────────────────────────────────────
  { province: '울산광역시', city: '중구' },
  { province: '울산광역시', city: '남구' },
  { province: '울산광역시', city: '동구' },
  { province: '울산광역시', city: '북구' },
  { province: '울산광역시', city: '울주군' },

  // ── 대구광역시 ──────────────────────────────────────────────
  { province: '대구광역시', city: '중구' },
  { province: '대구광역시', city: '동구' },
  { province: '대구광역시', city: '서구' },
  { province: '대구광역시', city: '남구' },
  { province: '대구광역시', city: '북구' },
  { province: '대구광역시', city: '수성구' },
  { province: '대구광역시', city: '달서구' },
  { province: '대구광역시', city: '달성군' },

  // ── 경상북도 ────────────────────────────────────────────────
  { province: '경상북도', city: '포항시', aliases: ['포항'] },
  { province: '경상북도', city: '경주시', aliases: ['경주'] },
  { province: '경상북도', city: '김천시', aliases: ['김천'] },
  { province: '경상북도', city: '안동시', aliases: ['안동'] },
  { province: '경상북도', city: '구미시', aliases: ['구미'] },
  { province: '경상북도', city: '영주시', aliases: ['영주'] },
  { province: '경상북도', city: '영천시', aliases: ['영천'] },
  { province: '경상북도', city: '상주시', aliases: ['상주'] },
  { province: '경상북도', city: '문경시', aliases: ['문경'] },
  { province: '경상북도', city: '경산시', aliases: ['경산'] },
  { province: '경상북도', city: '의성군', aliases: ['의성'] },
  { province: '경상북도', city: '청송군', aliases: ['청송'] },
  { province: '경상북도', city: '영양군', aliases: ['영양'] },
  { province: '경상북도', city: '영덕군', aliases: ['영덕'] },
  { province: '경상북도', city: '청도군', aliases: ['청도'] },
  { province: '경상북도', city: '고령군', aliases: ['고령'] },
  { province: '경상북도', city: '성주군', aliases: ['성주'] },
  { province: '경상북도', city: '칠곡군', aliases: ['칠곡'] },
  { province: '경상북도', city: '예천군', aliases: ['예천'] },
  { province: '경상북도', city: '봉화군', aliases: ['봉화'] },
  { province: '경상북도', city: '울진군', aliases: ['울진'] },
  { province: '경상북도', city: '울릉군', aliases: ['울릉'] },

  // ── 광주광역시 ──────────────────────────────────────────────
  { province: '광주광역시', city: '동구' },
  { province: '광주광역시', city: '서구' },
  { province: '광주광역시', city: '남구' },
  { province: '광주광역시', city: '북구' },
  { province: '광주광역시', city: '광산구' },

  // ── 전라남도 ────────────────────────────────────────────────
  { province: '전라남도', city: '목포시', aliases: ['목포'] },
  { province: '전라남도', city: '여수시', aliases: ['여수'] },
  { province: '전라남도', city: '순천시', aliases: ['순천'] },
  { province: '전라남도', city: '나주시', aliases: ['나주'] },
  { province: '전라남도', city: '광양시', aliases: ['광양'] },
  { province: '전라남도', city: '담양군', aliases: ['담양'] },
  { province: '전라남도', city: '곡성군', aliases: ['곡성'] },
  { province: '전라남도', city: '구례군', aliases: ['구례'] },
  { province: '전라남도', city: '고흥군', aliases: ['고흥'] },
  { province: '전라남도', city: '보성군', aliases: ['보성'] },
  { province: '전라남도', city: '화순군', aliases: ['화순'] },
  { province: '전라남도', city: '장흥군', aliases: ['장흥'] },
  { province: '전라남도', city: '강진군', aliases: ['강진'] },
  { province: '전라남도', city: '해남군', aliases: ['해남'] },
  { province: '전라남도', city: '영암군', aliases: ['영암'] },
  { province: '전라남도', city: '무안군', aliases: ['무안'] },
  { province: '전라남도', city: '함평군', aliases: ['함평'] },
  { province: '전라남도', city: '영광군', aliases: ['영광'] },
  { province: '전라남도', city: '장성군', aliases: ['장성'] },
  { province: '전라남도', city: '완도군', aliases: ['완도'] },
  { province: '전라남도', city: '진도군', aliases: ['진도'] },
  { province: '전라남도', city: '신안군', aliases: ['신안'] },

  // ── 전북특별자치도 ──────────────────────────────────────────
  { province: '전북특별자치도', city: '전주시', aliases: ['전주'] },
  { province: '전북특별자치도', city: '군산시', aliases: ['군산'] },
  { province: '전북특별자치도', city: '익산시', aliases: ['익산'] },
  { province: '전북특별자치도', city: '정읍시', aliases: ['정읍'] },
  { province: '전북특별자치도', city: '남원시', aliases: ['남원'] },
  { province: '전북특별자치도', city: '김제시', aliases: ['김제'] },
  { province: '전북특별자치도', city: '완주군', aliases: ['완주'] },
  { province: '전북특별자치도', city: '진안군', aliases: ['진안'] },
  { province: '전북특별자치도', city: '무주군', aliases: ['무주'] },
  { province: '전북특별자치도', city: '장수군', aliases: ['장수'] },
  { province: '전북특별자치도', city: '임실군', aliases: ['임실'] },
  { province: '전북특별자치도', city: '순창군', aliases: ['순창'] },
  { province: '전북특별자치도', city: '고창군', aliases: ['고창'] },
  { province: '전북특별자치도', city: '부안군', aliases: ['부안'] },

  // ── 대전광역시 ──────────────────────────────────────────────
  { province: '대전광역시', city: '동구' },
  { province: '대전광역시', city: '중구' },
  { province: '대전광역시', city: '서구' },
  { province: '대전광역시', city: '유성구' },
  { province: '대전광역시', city: '대덕구' },

  // ── 충청남도 ────────────────────────────────────────────────
  { province: '충청남도', city: '천안시', aliases: ['천안'] },
  { province: '충청남도', city: '공주시', aliases: ['공주'] },
  { province: '충청남도', city: '보령시', aliases: ['보령'] },
  { province: '충청남도', city: '아산시', aliases: ['아산'] },
  { province: '충청남도', city: '서산시', aliases: ['서산'] },
  { province: '충청남도', city: '논산시', aliases: ['논산'] },
  { province: '충청남도', city: '계룡시', aliases: ['계룡'] },
  { province: '충청남도', city: '당진시', aliases: ['당진'] },
  { province: '충청남도', city: '금산군', aliases: ['금산'] },
  { province: '충청남도', city: '부여군', aliases: ['부여'] },
  { province: '충청남도', city: '서천군', aliases: ['서천'] },
  { province: '충청남도', city: '청양군', aliases: ['청양'] },
  { province: '충청남도', city: '홍성군', aliases: ['홍성'] },
  { province: '충청남도', city: '예산군', aliases: ['예산'] },
  { province: '충청남도', city: '태안군', aliases: ['태안'] },

  // ── 충청북도 ────────────────────────────────────────────────
  { province: '충청북도', city: '청주시', aliases: ['청주'] },
  { province: '충청북도', city: '충주시', aliases: ['충주'] },
  { province: '충청북도', city: '제천시', aliases: ['제천'] },
  { province: '충청북도', city: '보은군', aliases: ['보은'] },
  { province: '충청북도', city: '옥천군', aliases: ['옥천'] },
  { province: '충청북도', city: '영동군', aliases: ['영동'] },
  { province: '충청북도', city: '증평군', aliases: ['증평'] },
  { province: '충청북도', city: '진천군', aliases: ['진천'] },
  { province: '충청북도', city: '괴산군', aliases: ['괴산'] },
  { province: '충청북도', city: '음성군', aliases: ['음성'] },
  { province: '충청북도', city: '단양군', aliases: ['단양'] },

  // ── 세종특별자치시 ──────────────────────────────────────────
  { province: '세종특별자치시', city: '세종시', aliases: ['세종'] },

  // ── 제주특별자치도 ──────────────────────────────────────────
  { province: '제주특별자치도', city: '제주시', aliases: ['제주'] },
  { province: '제주특별자치도', city: '서귀포시', aliases: ['서귀포'] },
]

/**
 * 특정 도시명이 몇 개의 시도에 존재하는지 파악
 * 중구/동구/서구/남구/북구처럼 여러 시도에 공존하는 이름 감지용
 */
const cityProvinceCount = new Map<string, number>()
for (const e of KOREA_CITIES) {
  cityProvinceCount.set(e.city, (cityProvinceCount.get(e.city) ?? 0) + 1)
}
export const AMBIGUOUS_CITY_NAMES = new Set(
  [...cityProvinceCount.entries()].filter(([, count]) => count > 1).map(([city]) => city)
)
