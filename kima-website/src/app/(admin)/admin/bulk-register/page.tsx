'use client'

import { useState, useRef } from 'react'

interface MemberRow {
  name: string
  email: string
  organization?: string
  phone?: string
  region?: string
}

interface Result {
  created: number
  skipped: number
  failed: number
  details: { email: string; status: 'created' | 'skipped' | 'failed'; reason?: string }[]
}

const TEMPLATE_CSV = `이름,이메일,소속단체,전화번호,지역
홍길동,hong@example.com,서울이주민센터,010-1234-5678,서울경기인천
김영희,kim@example.com,부산다문화교회,,부산경남`

function parseCsv(text: string): MemberRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  // 헤더 제거
  const rows = lines.slice(1)
  return rows
    .map((line) => {
      const [name, email, organization, phone, region] = line.split(',').map((c) => c.trim())
      return { name, email, organization: organization || undefined, phone: phone || undefined, region: region || undefined }
    })
    .filter((r) => r.name && r.email)
}

export default function BulkRegisterPage() {
  const [csvText, setCsvText] = useState('')
  const [parsed, setParsed] = useState<MemberRow[]>([])
  const [initialPassword, setInitialPassword] = useState('kima123456')
  const [sendEmail, setSendEmail] = useState(true)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCsvChange = (text: string) => {
    setCsvText(text)
    setParseError('')
    try {
      const rows = parseCsv(text)
      setParsed(rows)
      if (rows.length === 0 && text.trim()) setParseError('파싱된 행이 없습니다. 형식을 확인해주세요.')
    } catch {
      setParseError('CSV 파싱 중 오류가 발생했습니다.')
      setParsed([])
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => handleCsvChange(ev.target?.result as string)
    reader.readAsText(file, 'UTF-8')
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob(['﻿' + TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'kima_members_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async () => {
    if (parsed.length === 0) { setError('등록할 회원 목록이 없습니다.'); return }
    if (!initialPassword || initialPassword.length < 8) { setError('초기 비밀번호는 8자 이상이어야 합니다.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bulk-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: parsed, initialPassword, sendWelcomeEmail: sendEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '등록 실패')
      setResult(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1B3A6B]">회원 일괄 등록 — 결과</h1>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{result.created}</p>
            <p className="text-sm text-green-700 mt-1">등록 완료</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-yellow-600">{result.skipped}</p>
            <p className="text-sm text-yellow-700 mt-1">중복 건너뜀</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-red-600">{result.failed}</p>
            <p className="text-sm text-red-700 mt-1">실패</p>
          </div>
        </div>

        {result.details.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">이메일</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">결과</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500">메모</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {result.details.map((d, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-gray-700">{d.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === 'created' ? 'bg-green-100 text-green-700' :
                        d.status === 'skipped' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {d.status === 'created' ? '완료' : d.status === 'skipped' ? '건너뜀' : '실패'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">{d.reason ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() => { setResult(null); setCsvText(''); setParsed([]) }}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold"
        >
          다시 등록하기
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1B3A6B]">회원 일괄 등록</h1>
        <p className="text-sm text-gray-500 mt-1">CSV 파일로 회원을 일괄 등록하고 초기 비밀번호를 설정합니다.</p>
      </div>

      {/* 템플릿 다운로드 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
        <span className="text-lg">📄</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">CSV 파일 형식</p>
          <p className="text-xs text-blue-600 mt-0.5">이름, 이메일, 소속단체(선택), 전화번호(선택), 지역(선택) 순서로 작성해 주세요.</p>
          <p className="text-xs text-blue-500 mt-1 font-mono">이름,이메일,소속단체,전화번호,지역</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium"
        >
          템플릿 다운로드
        </button>
      </div>

      {/* CSV 입력 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">회원 목록 입력</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              CSV 파일 불러오기
            </button>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} aria-label="CSV 파일 선택" title="CSV 파일 선택" />
          </div>
        </div>
        <textarea
          value={csvText}
          onChange={(e) => handleCsvChange(e.target.value)}
          rows={10}
          placeholder={`이름,이메일,소속단체,전화번호,지역\n홍길동,hong@example.com,서울이주민센터,010-1234-5678,서울경기인천`}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 resize-y"
        />
        {parseError && <p className="mt-1 text-xs text-red-500">{parseError}</p>}
        {parsed.length > 0 && (
          <p className="mt-1 text-xs text-green-600 font-medium">{parsed.length}명 파싱됨</p>
        )}
      </div>

      {/* 파싱 미리보기 */}
      {parsed.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto mb-6">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">미리보기 (처음 5행)</p>
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['이름', '이메일', '소속단체', '전화번호', '지역'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {parsed.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-gray-700">{r.name}</td>
                  <td className="px-4 py-2 text-gray-700">{r.email}</td>
                  <td className="px-4 py-2 text-gray-400">{r.organization ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-400">{r.phone ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-400">{r.region ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsed.length > 5 && (
            <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50">... 외 {parsed.length - 5}명</p>
          )}
        </div>
      )}

      {/* 초기 비밀번호 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          초기 비밀번호 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 items-start">
          <input
            type="text"
            value={initialPassword}
            onChange={(e) => setInitialPassword(e.target.value)}
            aria-label="초기 비밀번호"
            placeholder="초기 비밀번호 입력"
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 font-mono w-64"
          />
          <div className="text-xs text-gray-400 pt-2">
            모든 신규 회원에게 동일하게 적용됩니다.<br />
            회원들에게 로그인 후 반드시 변경하도록 안내하세요.
          </div>
        </div>
      </div>

      {/* 환영 이메일 */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">가입 환영 이메일 발송 (패스워드 변경 안내 포함)</span>
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || parsed.length === 0}
          className="px-6 py-2.5 bg-[#1B3A6B] text-white rounded-lg text-sm font-semibold hover:bg-[#15306a] transition-colors disabled:opacity-50"
        >
          {loading ? '등록 중...' : `${parsed.length}명 일괄 등록`}
        </button>
      </div>
    </div>
  )
}
