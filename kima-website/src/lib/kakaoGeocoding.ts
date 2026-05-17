interface KakaoGeoDoc {
  x: string  // 경도(lng)
  y: string  // 위도(lat)
  road_address: { address_name: string } | null
  address:      { address_name: string } | null
}

interface KakaoGeoResult {
  lat: number
  lng: number
  roadAddress: string | null
  jibunAddress: string | null
}

export async function geocodeAddress(address: string): Promise<KakaoGeoResult | null> {
  const key = process.env.KAKAO_REST_API_KEY
  if (!key || !address.trim()) return null

  // 건물명·층수 제거 ("서울시 종로구 세종대로 1, 2층" → "서울시 종로구 세종대로 1")
  const clean = address.split(',')[0].trim()

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(clean)}&size=1`,
      { headers: { Authorization: `KakaoAK ${key}` } }
    )
    if (!res.ok) return null

    const data = await res.json() as { documents: KakaoGeoDoc[] }
    const doc = data.documents?.[0]
    if (!doc) return null

    return {
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      roadAddress:  doc.road_address?.address_name ?? null,
      jibunAddress: doc.address?.address_name      ?? null,
    }
  } catch {
    return null
  }
}
