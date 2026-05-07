'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Swap these for MODEL_PATHS + <img> once real photos are ready
const PLACEHOLDERS = [
  { bg: '#7BA69A', label: 'LOOK 01' }, // mint sage   → model1
  { bg: '#6B1F2A', label: 'LOOK 02' }, // burgundy    → model2
  { bg: '#5C3A1E', label: 'LOOK 03' }, // warm brown  → model3
  { bg: '#C9A84C', label: 'LOOK 04' }, // golden      → model4
  { bg: '#6B8C3E', label: 'LOOK 05' }, // olive green → model5
]

export default function Hero() {
  const modelRef   = useRef(null)
  const labelRef   = useRef(null)
  const headingRef = useRef(null)
  const subRef     = useRef(null)
  const lineRef    = useRef(null)
  const idxRef     = useRef(0)

  useEffect(() => {
    const model   = modelRef.current
    const label   = labelRef.current
    const heading = headingRef.current
    const sub     = subRef.current
    const line    = lineRef.current
    if (!model || !label || !heading || !sub || !line) return

    // ── 1. MODEL WALK-IN ─────────────────────────────────────────────────
    gsap.fromTo(
      model,
      { x: '120vw', opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )

    // ── 2. TEXT STAGGER ───────────────────────────────────────────────────
    gsap.fromTo(
      [heading, sub],
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.15,
        delay: 0.6,
      }
    )

    // ── 3. OUTFIT CYCLING (every 3 s) ─────────────────────────────────────
    const cycleInterval = setInterval(() => {
      const next = (idxRef.current + 1) % PLACEHOLDERS.length

      gsap.to(model, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          model.style.backgroundColor = PLACEHOLDERS[next].bg
          label.textContent = PLACEHOLDERS[next].label
          idxRef.current = next
          gsap.to(model, { opacity: 1, duration: 0.4, ease: 'power2.out' })
        },
      })
    }, 3000)

    // ── 4. GLITCH on "NO RULES." (every 4 s, lasts 300 ms) ───────────────
    const runGlitch = () => {
      const STEPS   = 8
      const STEP_MS = 300 / STEPS
      let count = 0

      const tick = setInterval(() => {
        if (count >= STEPS) {
          clearInterval(tick)
          sub.style.textShadow = 'none'
          return
        }
        const dx = (Math.random() * 8 - 4).toFixed(1)
        const dy = (Math.random() * 4 - 2).toFixed(1)
        const a  = count % 2 === 0 ? '#FF1E1E' : '#C8FF00'
        const b  = count % 2 === 0 ? '#C8FF00' : '#FF1E1E'
        sub.style.textShadow = `${dx}px ${dy}px 0 ${a}, ${-dx}px ${-dy}px 0 ${b}`
        count++
      }, STEP_MS)
    }

    const glitchInterval = setInterval(runGlitch, 4000)

    // ── 5. SCROLL LINE PULSE ──────────────────────────────────────────────
    gsap.fromTo(
      line,
      { scaleY: 0, transformOrigin: 'top center' },
      { scaleY: 1, duration: 0.9, ease: 'power2.inOut', repeat: -1, yoyo: true }
    )

    return () => {
      clearInterval(cycleInterval)
      clearInterval(glitchInterval)
      gsap.killTweensOf([model, heading, sub, line])
    }
  }, [])

  return (
    <section className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">

      {/* ── Placeholder box — swap for <img> when photos are ready ─────── */}
      <div
        ref={modelRef}
        data-hero-model
        className="absolute bottom-0 right-0 h-[70vh] w-[min(30vw,420px)] hidden md:flex flex-col items-center justify-end pb-10"
        style={{ opacity: 0, backgroundColor: PLACEHOLDERS[0].bg }}
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className="font-mono text-white/70 tracking-widest"
          style={{ fontSize: 11, letterSpacing: '4px' }}
        >
          {PLACEHOLDERS[0].label}
        </span>
      </div>

      {/* ── Text block ──────────────────────────────────────────────────── */}
      <div className="absolute left-[6vw] top-1/2 -translate-y-1/2 flex flex-col leading-none">
        <h1
          ref={headingRef}
          className="font-heading text-white leading-[0.9]"
          style={{ fontSize: 'clamp(52px, 15vw, 320px)', opacity: 0 }}
        >
          SS26
        </h1>
        <h2
          ref={subRef}
          className="font-heading text-[#C8FF00] leading-[0.9]"
          style={{ fontSize: 'clamp(28px, 8vw, 140px)', opacity: 0 }}
        >
          NO RULES.
        </h2>
      </div>

      {/* ── Scroll indicator ────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 select-none">
        <span
          className="font-mono text-white/50"
          style={{ fontSize: 11, letterSpacing: '4px' }}
        >
          SCROLL
        </span>
        <div
          ref={lineRef}
          className="w-px h-12 bg-white/40"
        />
      </div>

    </section>
  )
}
