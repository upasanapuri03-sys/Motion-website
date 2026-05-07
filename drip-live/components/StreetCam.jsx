'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Static data ───────────────────────────────────────────────────────────────

const CELLS = [
  { src: '/textures/street1.jpg', bg: '#1a1a1f', location: 'HARAJUKU, 03:22AM'   },
  { src: '/textures/street2.jpg', bg: '#1f1a18', location: 'SHOREDITCH, 11:47PM' },
  { src: '/textures/street3.jpg', bg: '#171f18', location: 'LE MARAIS, 02:15AM'  },
  { src: '/textures/street4.jpg', bg: '#1f1a1f', location: 'SOHO NYC, 01:33AM'   },
  { src: '/textures/street5.jpg', bg: '#1a1f1f', location: 'KREUZBERG, 04:58AM'  },
  { src: '/textures/street6.jpg', bg: '#201818', location: 'SHIBUYA, 03:41AM'    },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0') }

function formatTs(d) {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} — ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ── StreetCell ────────────────────────────────────────────────────────────────
// Each cell owns its GSAP hover tweens and stays isolated from the parent's
// ScrollTrigger entrance so the two animation sets never conflict.

function StreetCell({ src, bg, location }) {
  const cellRef    = useRef(null)
  const imgRef     = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const cell    = cellRef.current
    const img     = imgRef.current
    const overlay = overlayRef.current
    if (!cell || !img || !overlay) return

    const onEnter = () => {
      gsap.to(img, {
        filter: 'saturate(1)',
        scale: 1.06,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    }

    const onLeave = () => {
      gsap.to(img, {
        filter: 'saturate(0.2)',
        scale: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      })
      gsap.to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' })
    }

    cell.addEventListener('mouseenter', onEnter)
    cell.addEventListener('mouseleave', onLeave)

    return () => {
      cell.removeEventListener('mouseenter', onEnter)
      cell.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf([img, overlay])
    }
  }, [])

  return (
    <div
      ref={cellRef}
      data-cell
      className="relative overflow-hidden"
      style={{ aspectRatio: '4 / 3' }}
    >
      {/* Image layer — desaturated by default, GSAP drives filter on hover */}
      {/* Swap bg-color <div> for <img src={src} className="absolute inset-0 w-full h-full object-cover" /> */}
      <div
        ref={imgRef}
        className="absolute inset-0"
        style={{
          backgroundImage:    `url(${src})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundColor:    bg,
          filter:             'saturate(0.2)',
          transformOrigin:    'center',
        }}
      />

      {/* Hover overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 flex flex-col justify-end p-4"
        style={{ background: 'rgba(0,0,0,0.52)', opacity: 0 }}
      >
        <span
          className="font-heading text-white leading-none"
          style={{ fontSize: 'clamp(20px, 2.6vw, 42px)' }}
        >
          SPOTTED ↗
        </span>
        <span
          className="font-mono text-white/60 mt-1"
          style={{ fontSize: 10, letterSpacing: '2px' }}
        >
          {location}
        </span>
      </div>
    </div>
  )
}

// ── StreetCam ─────────────────────────────────────────────────────────────────

export default function StreetCam() {
  const sectionRef = useRef(null)
  const titleRef   = useRef(null)
  const gridRef    = useRef(null)

  // Timestamp — initialised empty to avoid SSR/client hydration mismatch
  const [ts, setTs] = useState('')

  useEffect(() => {
    setTs(formatTs(new Date()))
    const id = setInterval(() => setTs(formatTs(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  // Title glitch helper
  const runGlitch = (el) => {
    const STEPS   = 10
    const STEP_MS = 400 / STEPS
    let count = 0
    const tick = setInterval(() => {
      if (count >= STEPS) {
        clearInterval(tick)
        el.style.textShadow = 'none'
        return
      }
      const dx = (Math.random() * 14 - 7).toFixed(1)
      const dy = (Math.random() * 6 - 3).toFixed(1)
      const a  = count % 2 === 0 ? '#FF1E1E' : '#C8FF00'
      const b  = count % 2 === 0 ? '#C8FF00' : '#FF1E1E'
      el.style.textShadow = `${dx}px ${dy}px 0 ${a}, ${-dx}px ${-dy}px 0 ${b}`
      count++
    }, STEP_MS)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Title entrance + glitch ─────────────────────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start:   'top 72%',
        once:    true,
        onEnter: () => {
          gsap.fromTo(
            titleRef.current,
            { opacity: 0, y: 24 },
            {
              opacity:  1,
              y:        0,
              duration: 0.8,
              ease:     'expo.out',
              onComplete: () => runGlitch(titleRef.current),
            }
          )
        },
      })

      // ── Grid cell stagger entrance ──────────────────────────────────────
      const cells = gridRef.current.querySelectorAll('[data-cell]')
      gsap.fromTo(
        cells,
        { opacity: 0, y: 30 },
        {
          opacity:  1,
          y:        0,
          duration: 0.55,
          ease:     'power2.out',
          stagger:  0.08,
          scrollTrigger: {
            trigger: gridRef.current,
            start:   'top 80%',
          },
        }
      )

    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-0"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Scanline overlay — sits above everything, pointer-events: none ─ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 4px)',
        }}
      />

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* REC indicator */}
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            style={{
              width:           10,
              height:          10,
              borderRadius:    '50%',
              background:      '#FF1E1E',
              animation:       'blink-rec 1s steps(2, end) infinite',
              flexShrink:      0,
            }}
          />
          <span
            className="font-mono"
            style={{ fontSize: 11, letterSpacing: '3px', color: '#FF1E1E' }}
          >
            REC
          </span>
        </div>

        {/* Live timestamp */}
        <span
          className="font-mono tabular-nums text-white/30"
          style={{ fontSize: 11, letterSpacing: '2px' }}
          suppressHydrationWarning
        >
          {ts}
        </span>
      </div>

      {/* ── Title ────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-10 pb-6">
        <h2
          ref={titleRef}
          className="font-heading text-white leading-none"
          style={{ fontSize: '6vw', opacity: 0 }}
        >
          SPOTTED IN THE WILD
        </h2>
      </div>

      {/* ── 3×2 image grid ───────────────────────────────────────────────── */}
      <div
        ref={gridRef}
        className="px-6 pb-10"
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 '2px',
        }}
      >
        {CELLS.map((cell) => (
          <StreetCell
            key={cell.location}
            src={cell.src}
            bg={cell.bg}
            location={cell.location}
          />
        ))}
      </div>
    </section>
  )
}
