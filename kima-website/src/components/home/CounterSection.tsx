'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  label: string
  target: number
  suffix: string
  unit: string
}

const STATS: Stat[] = [
  { label: '가입 단체',     target: 120,  suffix: '+',  unit: '개' },
  { label: '이주민 대상국', target: 30,   suffix: '+',  unit: '개국' },
  { label: '활동 회원',     target: 500,  suffix: '+',  unit: '명' },
  { label: '등록 자료',     target: 1200, suffix: '+',  unit: '건' },
]

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])

  return count
}

function CounterItem({ stat, started }: { stat: Stat; started: boolean }) {
  const count = useCountUp(stat.target, 1800, started)
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-[#1B3A6B]">
        {count.toLocaleString()}
        <span className="text-2xl font-semibold text-[#C8922A]">{stat.suffix}</span>
        <span className="text-xl font-medium text-[#C8922A] ml-1">{stat.unit}</span>
      </p>
      <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
    </div>
  )
}

export function CounterSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white border-b border-gray-100" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <CounterItem key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  )
}
