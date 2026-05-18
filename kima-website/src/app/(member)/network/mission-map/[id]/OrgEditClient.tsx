'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_OPTIONS = ['교회', 'NGO', '법률', '의료', '교육', '다문화센터', '선교단체', '부설기관', '기타']
const TARGET_OPTIONS = ['이주노동자', '유학생', '결혼이민자', '다문화자녀', '난민미등록', '귀국이주민']
const LANG_OPTIONS = [
  '네팔', '베트남', '태국', '라오', '몽골', '러시아',
  '중국', '동포', '필리핀', '인도네시아', '캄보디아', '미얀마',
  '영어', '일본', '스리랑카', '아랍', '힌두', '인도',
  '우즈벡', '다문화', '한국어',
]

interface EditData {
  type: string
  targets: string[]
  languages: string[]
  address: string
  phone: string
  email: string
  website: string
  introLines: string[]
  contactItems: string[]
}

interface Props {
  orgId: number
  initial: EditData
}

export function OrgEditClient({ orgId, initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<EditData>(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const toggleArr = (key: 'targets' | 'languages', val: string) => {
    setForm((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      }
    })
  }

  const updateLines = (key: 'introLines' | 'contactItems', text: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: text.split('\n').map((l) => l.trim()).filter(Boolean),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/member/gmfsns-orgs/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (res.ok) {
        setMessage({ ok: true, text: '저장되었습니다.' })
        router.refresh()
      } else {
        setMessage({ ok: false, text: json.error ?? '저장 실패' })
      }
    } catch {
      setMessage({ ok: false, text: '네트워크 오류가 발생했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 유형 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">사역 유형</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {TYPE_OPTIONS.map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="radio"
                name="type"
                checked={form.type === t}
                onChange={() => setForm((p) => ({ ...p, type: t }))}
                className="accent-[#1B3A6B]"
              />
              <span className="text-sm text-gray-700">{t}</span>
            </label>
          ))}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="radio"
              name="type"
              checked={!TYPE_OPTIONS.includes(form.type)}
              onChange={() => setForm((p) => ({ ...p, type: '' }))}
              className="accent-[#1B3A6B]"
            />
            <span className="text-sm text-gray-400">비워두기</span>
          </label>
        </div>
      </div>

      {/* 사역대상 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">사역 대상</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {TARGET_OPTIONS.map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.targets.includes(t)}
                onChange={() => toggleArr('targets', t)}
                className="w-4 h-4 accent-[#1B3A6B]"
              />
              <span className="text-sm text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 언어 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">사역 언어</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {LANG_OPTIONS.map((l) => (
            <label key={l} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.languages.includes(l)}
                onChange={() => toggleArr('languages', l)}
                className="w-4 h-4 accent-[#1B3A6B]"
              />
              <span className="text-sm text-gray-700">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">전화번호</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="010-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="contact@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1">홈페이지</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1">주소</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="도로명 주소"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
          />
        </div>
      </div>

      {/* 사역소개 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">사역소개 (줄바꿈으로 항목 구분)</label>
        <textarea
          value={form.introLines.join('\n')}
          onChange={(e) => updateLines('introLines', e.target.value)}
          rows={5}
          placeholder="사역 내용을 한 줄씩 입력하세요..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 resize-y"
        />
      </div>

      {/* 연결정보 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">연결정보 (줄바꿈으로 항목 구분)</label>
        <textarea
          value={form.contactItems.join('\n')}
          onChange={(e) => updateLines('contactItems', e.target.value)}
          rows={4}
          placeholder="전화번호: 010-0000-0000&#10;이메일: ...&#10;주소: ..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 resize-y"
        />
      </div>

      {/* 저장 버튼 */}
      {message && (
        <p className={`text-sm font-medium ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a] disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  )
}
