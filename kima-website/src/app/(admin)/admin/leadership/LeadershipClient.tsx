'use client'

import { useState } from 'react'

export const GROUP_LABELS: Record<string, string> = {
  ADVISOR:          '고문 · 자문위원',
  EXECUTIVE:        '운영위원회',
  LANGUAGE_CHAIR:   '언어권 위원장',
  REGION_CHAIR:     '지역 위원장',
  DENOMINATION_REP: '교단 대표',
  NETWORK_CHAIR:    '네트워크 위원장',
}

const GROUP_ORDER = ['ADVISOR', 'EXECUTIVE', 'LANGUAGE_CHAIR', 'REGION_CHAIR', 'DENOMINATION_REP', 'NETWORK_CHAIR']

type Leader = {
  id: string
  group: string
  title: string
  name: string
  org: string | null
  position: string | null
  phone: string | null
  email: string | null
  nations: string | null
  mission: string | null
  order: number
  isActive: boolean
}

type FormState = {
  group: string
  title: string
  name: string
  org: string
  position: string
  phone: string
  email: string
  nations: string
  mission: string
  order: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  group: 'ADVISOR', title: '', name: '', org: '', position: '',
  phone: '', email: '', nations: '', mission: '', order: '0', isActive: true,
}

function leaderToForm(l: Leader): FormState {
  return {
    group:    l.group,
    title:    l.title,
    name:     l.name,
    org:      l.org      ?? '',
    position: l.position ?? '',
    phone:    l.phone    ?? '',
    email:    l.email    ?? '',
    nations:  l.nations  ?? '',
    mission:  l.mission  ?? '',
    order:    String(l.order),
    isActive: l.isActive,
  }
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]'

export function LeadershipClient({ initialLeaders }: { initialLeaders: Leader[] }) {
  const [items, setItems]       = useState<Leader[]>(initialLeaders)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState<Leader | null>(null)
  const [form, setForm]         = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(leader: Leader) {
    setEditing(leader)
    setForm(leaderToForm(leader))
    setError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const body = {
        group:    form.group,
        title:    form.title.trim(),
        name:     form.name.trim(),
        org:      form.org.trim()      || null,
        position: form.position.trim() || null,
        phone:    form.phone.trim()    || null,
        email:    form.email.trim()    || null,
        nations:  form.nations.trim()  || null,
        mission:  form.mission.trim()  || null,
        order:    Number(form.order)   || 0,
        isActive: form.isActive,
      }

      const url    = editing ? `/api/admin/leaders/${editing.id}` : '/api/admin/leaders'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? '저장 실패')
      }
      const data = await res.json()
      const saved: Leader = data.leader

      if (editing) {
        setItems((prev) => prev.map((l) => l.id === saved.id ? saved : l))
      } else {
        setItems((prev) => [...prev, saved])
      }
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/leaders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      setItems((prev) => prev.filter((l) => l.id !== id))
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = GROUP_ORDER.reduce<Record<string, Leader[]>>((acc, g) => {
    acc[g] = items
      .filter((l) => l.group === g)
      .sort((a, b) => a.order - b.order || a.createdAt?.localeCompare?.(b.createdAt ?? '') ?? 0)
    return acc
  }, {})

  const displayGroups = activeGroup === 'ALL' ? GROUP_ORDER : [activeGroup]

  return (
    <div>
      {/* 상단 바 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveGroup('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeGroup === 'ALL' ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            전체 ({items.length})
          </button>
          {GROUP_ORDER.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeGroup === g ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {GROUP_LABELS[g]} ({grouped[g].length})
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-[#C8922A] text-white text-sm font-semibold rounded-lg hover:bg-[#b07d22] transition-colors"
        >
          + 임원 추가
        </button>
      </div>

      {/* 그룹별 목록 */}
      <div className="space-y-8">
        {displayGroups.map((g) => (
          <section key={g}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1B3A6B] border-b-2 border-[#C8922A] pb-1 inline-block">
                {GROUP_LABELS[g]}
              </h2>
              <span className="text-xs text-gray-400">{grouped[g].length}명</span>
            </div>
            {grouped[g].length === 0 ? (
              <p className="text-sm text-gray-400 py-3">등록된 임원이 없습니다.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left font-medium">순서</th>
                      <th className="px-3 py-2 text-left font-medium">직책</th>
                      <th className="px-3 py-2 text-left font-medium">이름</th>
                      <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">소속</th>
                      <th className="px-3 py-2 text-left font-medium hidden md:table-cell">이메일</th>
                      <th className="px-3 py-2 text-left font-medium hidden lg:table-cell">상태</th>
                      <th className="px-3 py-2 text-right font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {grouped[g].map((leader) => (
                      <tr key={leader.id} className={`hover:bg-gray-50 transition-colors ${!leader.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{leader.order}</td>
                        <td className="px-3 py-2.5 text-[#C8922A] font-medium text-xs">{leader.title}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-800">{leader.name}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell max-w-[180px] truncate">{leader.org ?? '-'}</td>
                        <td className="px-3 py-2.5 text-gray-400 text-xs hidden md:table-cell">{leader.email ?? '-'}</td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${leader.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {leader.isActive ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(leader)}
                              className="text-xs text-[#1B3A6B] hover:underline font-medium"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(leader.id)}
                              disabled={deletingId === leader.id}
                              className="text-xs text-red-500 hover:underline font-medium disabled:opacity-40"
                            >
                              {deletingId === leader.id ? '...' : '삭제'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-base font-bold text-[#1B3A6B]">
                {editing ? '임원 정보 수정' : '새 임원 추가'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">구분 *</label>
                  <select
                    required
                    value={form.group}
                    onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                    className={inputCls}
                    title="구분"
                  >
                    {GROUP_ORDER.map((g) => (
                      <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직책 *</label>
                  <input
                    required
                    maxLength={50}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="예: 상임대표, 고문"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
                  <input
                    required
                    maxLength={30}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="예: 홍길동"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직분</label>
                  <input
                    maxLength={50}
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    placeholder="예: 목사, 선교사"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">소속 단체</label>
                <input
                  maxLength={100}
                  value={form.org}
                  onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                  placeholder="예: ○○교회 / ○○선교회"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">연락처</label>
                  <input
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
                  <input
                    type="email"
                    maxLength={100}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="example@email.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">사역대상국가</label>
                <input
                  maxLength={200}
                  value={form.nations}
                  onChange={(e) => setForm((f) => ({ ...f, nations: e.target.value }))}
                  placeholder="예: 베트남, 네팔, 몽골"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">사역구분</label>
                <input
                  maxLength={200}
                  value={form.mission}
                  onChange={(e) => setForm((f) => ({ ...f, mission: e.target.value }))}
                  placeholder="예: 노동자, 유학생, 이주 가정"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">순서 (숫자 낮을수록 위)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    <span className="text-sm text-gray-600">활성 (공개 페이지 표시)</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                form="leader-form"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#1B3A6B] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a] disabled:opacity-50"
              >
                {submitting ? '저장 중...' : editing ? '수정 완료' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
