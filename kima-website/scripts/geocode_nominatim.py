"""
Nominatim(OpenStreetMap)으로 DB 단체 주소 → 위경도 좌표 일괄 변환
실행: python scripts/geocode_nominatim.py
"""
import sys
import re
import time
import json
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(dotenv_path='.env.local')

import os
import psycopg2

DATABASE_URL = os.getenv('DATABASE_URL')


def clean_address(address: str) -> str:
    """주소에서 동호수, 층수, 상가명 등 제거"""
    addr = address.strip()
    # 쉼표 이후 부가 정보 제거
    addr = re.sub(r',\s*(B?\d+F|\d+층|\d+호|\d+동|\d+번지|지하|옥상|[A-Z]동).*$', '', addr, flags=re.IGNORECASE)
    # 괄호 제거
    addr = re.sub(r'\(.*?\)', '', addr)
    # 연속 공백 제거
    addr = re.sub(r'\s+', ' ', addr).strip()
    return addr


def geocode(address: str) -> tuple[float, float] | None:
    """Nominatim API로 주소 → (lat, lng)"""
    cleaned = clean_address(address)
    if not cleaned:
        return None

    # 전체 주소 → 상위 주소 순으로 시도
    attempts = []
    parts = cleaned.split()

    # 시도 1: 전체 주소
    attempts.append(cleaned)
    # 시도 2: 앞 5단어 (대략 시군구 + 도로명)
    if len(parts) >= 4:
        attempts.append(' '.join(parts[:5]))
    # 시도 3: 앞 3단어 (시군구)
    if len(parts) >= 3:
        attempts.append(' '.join(parts[:3]))

    url_base = 'https://nominatim.openstreetmap.org/search'
    headers = {'User-Agent': 'KIMA-geocoder/1.0 (kima2019.org)'}

    for attempt in attempts:
        params = urllib.parse.urlencode({
            'q': attempt,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'kr',
            'accept-language': 'ko',
        })
        req = urllib.request.Request(f'{url_base}?{params}', headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
                if data:
                    return float(data[0]['lat']), float(data[0]['lon'])
        except Exception:
            pass
        time.sleep(1)  # Nominatim 사용 정책: 초당 1회

    return None


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, address
        FROM "Organization"
        WHERE lat IS NULL AND address IS NOT NULL AND address != ''
        ORDER BY name
    """)
    orgs = cur.fetchall()

    print(f'📍 좌표 없는 단체: {len(orgs)}개\n')

    success = 0
    failed = 0
    failed_list = []

    for i, (org_id, name, address) in enumerate(orgs):
        result = geocode(address)
        if result:
            lat, lng = result
            cur.execute(
                'UPDATE "Organization" SET lat = %s, lng = %s WHERE id = %s',
                (lat, lng, org_id)
            )
            conn.commit()
            print(f'  ✅ [{i+1}/{len(orgs)}] {name}: {lat:.4f}, {lng:.4f}')
            success += 1
        else:
            print(f'  ❌ [{i+1}/{len(orgs)}] {name}: 실패 ({address[:35]})')
            failed += 1
            failed_list.append({'name': name, 'address': address})

        time.sleep(1.1)  # Nominatim 1req/s 정책

    cur.close()
    conn.close()

    print(f'\n{"─"*45}')
    print(f'✅ 성공: {success}개')
    print(f'❌ 실패: {failed}개')
    if failed_list:
        with open('scripts/geocode_failed.json', 'w', encoding='utf-8') as f:
            json.dump(failed_list, f, ensure_ascii=False, indent=2)
        print(f'📋 실패 목록: scripts/geocode_failed.json')
    print('─'*45)


if __name__ == '__main__':
    main()
