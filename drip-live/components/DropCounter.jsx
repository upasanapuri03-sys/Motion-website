'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Drop date: 30 days from first render ─────────────────────────────────────
// Stored in module scope so it doesn't reset on re-render
const DROP_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0') }

function getTimeLeft() {
  const diff = Math.max(0, DROP_DATE - Date.now())
  const d = Math.floor(diff / 864e5)
  const h = Math.floor((diff % 864e5) / 36e5)
  const m = Math.floor((diff % 36e5) / 6e4)
  const s = Math.floor((diff % 6e4) / 1e3)
  return { d, h, m, s }
}

// ── FlipUnit ──────────────────────────────────────────────────────────────────
// Wraps a two-digit value; triggers the CSS perspective flip when it changes.

function FlipUnit({ value, label }) {
  const spanRef  = useRef(null)
  const prevRef  = useRef(null)

  useEffect(() => {
    const el = spanRef.current
    if (!el || prevRef.current === value) return
    prevRef.current = value

    // Remove then re-add class to restart the CSS animation
    el.classList.remove('flip-digit')
    // Force reflow so the browser sees the class removal
    void el.offsetWidth
    el.classList.add('flip-digit')
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          perspective: '400px',
          display: 'inline-block',
        }}
      >
        <span
          ref={spanRef}
          className="font-heading text-white leading-none tabular-nums inline-block"
          style={{ fontSize: 'clamp(60px, 9vw, 140px)', display: 'block' }}
        >
          {value}
        </span>
      </div>
      <span
        className="font-mono text-white/30 mt-2"
        style={{ fontSize: 10, letterSpacing: '3px' }}
      >
        {label}
      </span>
    </div>
  )
}

// ── GrainOverlay ──────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-10"
      style={{ overflow: 'hidden' }}
    >
      <svg
        className="absolute"
        style={{
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          animation: 'grain-shift 0.9s steps(1) infinite',
          opacity: 0.055,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  )
}

// ── DropCounter ───────────────────────────────────────────────────────────────

export default function DropCounter() {
  // null sentinel avoids SSR hydration mismatch
  const [time, setTime]   = useState(null)
  const [stock, setStock] = useState(null)

  const sectionRef = useRef(null)
  const innerRef   = useRef(null)
  const btnRef     = useRef(null)
  const stockRef   = useRef(null)

  // ── Tick ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTime(getTimeLeft())
    setStock(200)

    const timerId = setInterval(() => setTime(getTimeLeft()), 1000)

    // Stock decrement: random 8-12 s interval
    let stockTimeout
    const decrementStock = () => {
      setStock(prev => (prev !== null && prev > 0 ? prev - 1 : prev))
      stockTimeout = setTimeout(decrementStock, 8000 + Math.random() * 4000)
    }
    stockTimeout = setTimeout(decrementStock, 8000 + Math.random() * 4000)

    return () => {
      clearInterval(timerId)
      clearTimeout(stockTimeout)
    }
  }, [])

  // ── ScrollTrigger entrance ────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  // ── Button hover fill ─────────────────────────────────────────────────────
  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return

    const onEnter = () => gsap.to(btn, { backgroundColor: '#C8FF00', color: '#0a0a0a', duration: 0.25, ease: 'power2.out' })
    const onLeave = () => gsap.to(btn, { backgroundColor: 'transparent', color: '#C8FF00', duration: 0.2, ease: 'power2.in' })

    btn.addEventListener('mouseenter', onEnter)
    btn.addEventListener('mouseleave', onLeave)
    return () => {
      btn.removeEventListener('mouseenter', onEnter)
      btn.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const formatted = time
    ? {
        d: pad(time.d),
        h: pad(time.h),
        m: pad(time.m),
        s: pad(time.s),
      }
    : { d: '--', h: '--', m: '--', s: '--' }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#070707' }}
    >
      {/* Grain overlay */}
      <GrainOverlay />

      {/* Faint diagonal rule for texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 40px)',
        }}
      />

      {/* Content */}
      <div
        ref={innerRef}
        className="relative z-20 flex flex-col items-center text-center px-6"
        style={{ opacity: 0 }}
      >
        {/* Pre-label */}
        <span
          className="font-mono text-[#C8FF00] mb-8"
          style={{ fontSize: 11, letterSpacing: '5px' }}
        >
          DROP 001 — LAUNCHING IN
        </span>

        {/* Countdown row */}
        <div className="flex items-start gap-6 md:gap-12 mb-14">
          <FlipUnit value={formatted.d} label="DAYS"    />

          <span
            className="font-heading text-white/20 leading-none select-none"
            style={{ fontSize: 'clamp(40px, 6vw, 100px)', paddingTop: '0.05em' }}
          >
            :
          </span>

          <FlipUnit value={formatted.h} label="HOURS"   />

          <span
            className="font-heading text-white/20 leading-none select-none"
            style={{ fontSize: 'clamp(40px, 6vw, 100px)', paddingTop: '0.05em' }}
          >
            :
          </span>

          <FlipUnit value={formatted.m} label="MINUTES" />

          <span
            className="font-heading text-white/20 leading-none select-none"
            style={{ fontSize: 'clamp(40px, 6vw, 100px)', paddingTop: '0.05em' }}
          >
            :
          </span>

          <FlipUnit value={formatted.s} label="SECONDS" />
        </div>

        {/* Stock counter */}
        <div
          ref={stockRef}
          className="flex items-center gap-3 mb-12"
        >
          <div
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#C8FF00',
              animation: 'lime-pulse 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          <span
            className="font-mono text-white/50"
            style={{ fontSize: 11, letterSpacing: '2px' }}
            suppressHydrationWarning
          >
            {stock !== null
              ? `${stock} UNITS REMAINING`
              : 'CHECKING STOCK...'}
          </span>
        </div>

        {/* CTA button */}
        <button
          ref={btnRef}
          className="hoverable font-mono tracking-widest"
          style={{
            fontSize: 12,
            letterSpacing: '4px',
            padding: '18px 52px',
            border: '1px solid #C8FF00',
            background: 'transparent',
            color: '#C8FF00',
          }}
        >
          NOTIFY ME
        </button>

        {/* Fine print */}
        <p
          className="font-mono text-white/20 mt-8"
          style={{ fontSize: 9, letterSpacing: '1.5px' }}
        >
          PRIORITY ACCESS — LIMITED UNITS — NO RESTOCKS
        </p>
      </div>
    </section>
  )
}
