"""
KIMA_premiun_2025.xlsx → public/orgs_data.json 변환 스크립트
Organization 스키마에 맞게 매핑
"""
import sys
import json
import re
sys.stdout.reconfigure(encoding='utf-8')

import openpyxl

VALID_REGIONS = ['서울경기인천', '부산경남', '대구경북', '광주전라', '대전충청', '강원제주']
VALID_LANGUAGES = ['베트남', '네팔', '몽골', '인도네시아', '필리핀', '러시아', '중국', '태국', '기타']
VALID_TARGETS = ['이주노동자', '유학생', '결혼이민자', '다문화자녀', '난민미등록', '귀국이주민']


def map_region(address: str) -> str:
    addr = address.strip().lower()
    if any(k in addr for k in ['서울', '경기', '인천']):
        return '서울경기인천'
    if any(k in addr for k in ['부산', '경남', '울산', '창원', '진주', '거제', '통영', '김해']):
        return '부산경남'
    if any(k in addr for k in ['대구', '경북', '포항', '구미', '경상북도', '안동', '영천']):
        return '대구경북'
    if any(k in addr for k in ['광주', '전남', '전북', '목포', '순천', '여수', '익산', '전라']):
        return '광주전라'
    if any(k in addr for k in ['대전', '충남', '충북', '세종', '천안', '청주', '충청']):
        return '대전충청'
    if any(k in addr for k in ['강원', '제주', '춘천', '원주', '강릉']):
        return '강원제주'
    return '서울경기인천'  # 기본값


def map_languages(country_str: str) -> list[str]:
    text = country_str.lower()
    langs = set()
    if any(k in text for k in ['베트남', 'vietnam']):
        langs.add('베트남')
    if any(k in text for k in ['네팔', 'nepal']):
        langs.add('네팔')
    if any(k in text for k in ['몽골', 'mongol']):
        langs.add('몽골')
    if any(k in text for k in ['인도네시아', 'indonesia']):
        langs.add('인도네시아')
    if any(k in text for k in ['필리핀', 'philipp']):
        langs.add('필리핀')
    if any(k in text for k in ['러시아', 'russia', 'cis', '우즈벡', '중앙아시아', '카자흐']):
        langs.add('러시아')
    if any(k in text for k in ['중국', 'china', '대만', '화교', '디아스포라']):
        langs.add('중국')
    if any(k in text for k in ['태국', '라오스', '캄보디아', '미얀마', '동남아', '아시아']):
        langs.add('태국')
    if not langs:
        langs.add('기타')
    return list(langs)


def map_targets(target_str: str) -> list[str]:
    text = target_str.lower()
    tgts = set()
    if any(k in text for k in ['노동자', '이주민', '근로자']):
        tgts.add('이주노동자')
    if any(k in text for k in ['유학생', '학생', '교수']):
        tgts.add('유학생')
    if any(k in text for k in ['이주 가정', '이주가정', '다문화 가정', '다문화가정', '결혼', '동포']):
        tgts.add('결혼이민자')
    if any(k in text for k in ['다음세대', '자녀', '미래']):
        tgts.add('다문화자녀')
    if any(k in text for k in ['난민', '무슬림', '미등록']):
        tgts.add('난민미등록')
    if any(k in text for k in ['탈북', '귀국', '북한']):
        tgts.add('귀국이주민')
    if not tgts:
        tgts.add('이주노동자')
    return list(tgts)


def clean_phone(phone: str) -> str:
    digits = re.sub(r'[^\d]', '', phone.strip())
    if len(digits) == 11 and digits.startswith('010'):
        return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
    if len(digits) == 10 and digits.startswith('0'):
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    return phone.strip() if len(phone.strip()) < 20 else ''


def clean_email(email: str) -> str:
    email = email.strip()
    if '@' in email and '.' in email.split('@')[-1]:
        return email[:100]
    return ''


def guess_type(target_str: str, country_str: str) -> str:
    combined = (target_str + country_str).lower()
    if any(k in combined for k in ['법률', '법적', '비자', '행정']):
        return '법률'
    if any(k in combined for k in ['의료', '병원', '건강']):
        return '의료'
    if any(k in combined for k in ['ngo', '지원', '센터', '단체']):
        return 'NGO'
    return '교회'


def main():
    wb = openpyxl.load_workbook('public/KIMA_premiun_2025.xlsx')
    ws = wb.active

    organizations = []
    skipped = 0

    for row in ws.iter_rows(min_row=2, values_only=True):
        seq, ts, name, position, org_name, phone, address, email, denomination, country, target_raw, target_other = row

        org_name = str(org_name or '').strip()
        address = str(address or '').strip()
        phone = str(phone or '').strip()
        email = str(email or '').strip()
        denomination = str(denomination or '').strip()
        country = str(country or '').strip()
        target_raw = str(target_raw or '').strip()
        name = str(name or '').strip()

        if not org_name or org_name in ['-', 'None', '']:
            skipped += 1
            continue

        region = map_region(address)
        languages = map_languages(country)
        targets = map_targets(target_raw)

        description_parts = []
        if denomination and denomination not in ['None', '-', '']:
            description_parts.append(f"소속교단: {denomination}")
        if name and name not in ['None', '-', '']:
            description_parts.append(f"담당자: {name}")

        org = {
            "name": org_name,
            "address": address[:200] if address else None,
            "region": region,
            "languages": languages,
            "targets": targets,
            "type": guess_type(target_raw, country),
            "phone": clean_phone(phone) if phone else None,
            "email": clean_email(email) if email else None,
            "description": ' | '.join(description_parts) if description_parts else None,
            "isPublic": True,
        }

        # Remove None values
        org = {k: v for k, v in org.items() if v is not None and v != ''}
        organizations.append(org)

    output = {"organizations": organizations}

    with open('public/orgs_data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✅ 변환 완료: {len(organizations)}개 단체 저장 (건너뜀: {skipped}개)")
    print(f"📄 저장 위치: public/orgs_data.json")


if __name__ == '__main__':
    main()
