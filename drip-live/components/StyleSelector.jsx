'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Catalog data ──────────────────────────────────────────────────────────────
// thumb/color values are placeholder colors matching each garment's actual hue.
// Replace thumb with a real image path and swap the colored <div> for <img>
// in the thumbnail slot when product photos are ready.

const CATEGORIES = [
  {
    id: 'tops',
    label: 'TOPS',
    layerZ: 10,
    // Placement is relative to the model container (percentage-based)
    layerPos: { top: '8%', left: '18%', width: '64%', height: '38%' },
    options: [
      { id: 't1', name: 'OVERSIZED SHIRT', price: 89,  color: '#d4c5b0' },
      { id: 't2', name: 'LEATHER VEST',    price: 245, color: '#3d2b1e' },
      { id: 't3', name: 'CROP POLO',       price: 65,  color: '#b8cfd8' },
    ],
  },
  {
    id: 'bottoms',
    label: 'BOTTOMS',
    layerZ: 20,
    layerPos: { top: '42%', left: '18%', width: '64%', height: '42%' },
    options: [
      { id: 'b1', name: 'WIDE LEG JEANS', price: 165, color: '#6b8fad' },
      { id: 'b2', name: 'DENIM MINI',     price: 120, color: '#9bb5c8' },
      { id: 'b3', name: 'CULOTTES',       price: 135, color: '#1c1c28' },
    ],
  },
  {
    id: 'shoes',
    label: 'SHOES',
    layerZ: 30,
    layerPos: { top: '80%', left: '22%', width: '56%', height: '18%' },
    options: [
      { id: 's1', name: 'POINTED HEELS',     price: 285, color: '#6b1f2a' },
      { id: 's2', name: 'PLATFORM SNEAKERS', price: 195, color: '#e8e0d0' },
      { id: 's3', name: 'STRAPPY HEELS',     price: 160, color: '#1a1a28' },
    ],
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    layerZ: 40,
    // Accessories float top-right like a bag or glasses overlay
    layerPos: { top: '14%', right: '6%', width: '26%', height: '24%' },
    options: [
      { id: 'a1', name: 'PATENT MINI BAG',  price: 320, color: '#5c1518' },
      { id: 'a2', name: 'CHAIN + CHARM',    price: 85,  color: '#b8941f' },
      { id: 'a3', name: 'OVERSIZED FRAMES', price: 195, color: '#1c1c1c' },
    ],
  },
]

// ── OutfitLayer ───────────────────────────────────────────────────────────────
// Manages its own GSAP fade so each swap animates independently.

function OutfitLayer({ option, zIndex, layerPos }) {
  const ref         = useRef(null)
  const displayedRef = useRef(null) // tracks what is visually rendered

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Guard: no change
    if (displayedRef.current?.id === (option?.id ?? null)) return

    const had = displayedRef.current
    const has = option ?? null

    if (has && !had) {
      // ── First selection: colour is already set by render, fade in ────
      displayedRef.current = has
      el.style.backgroundColor = has.color
      gsap.fromTo(el, { opacity: 0 }, { opacity: 0.82, duration: 0.3, ease: 'power2.out' })

    } else if (!has && had) {
      // ── Deselect: fade out, then clear colour ────────────────────────
      displayedRef.current = null
      gsap.to(el, {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => { el.style.backgroundColor = 'transparent' },
      })

    } else {
      // ── Swap: fade out → swap colour → fade in ───────────────────────
      gsap.to(el, {
        opacity: 0, duration: 0.15, ease: 'power2.in',
        onComplete: () => {
          displayedRef.current = has
          el.style.backgroundColor = has.color
          gsap.to(el, { opacity: 0.82, duration: 0.3, ease: 'power2.out' })
        },
      })
    }
  }, [option])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        zIndex,
        opacity: 0,
        pointerEvents: 'none',
        borderRadius: 2,
        ...layerPos,
      }}
    />
  )
}

// ── StyleSelector ─────────────────────────────────────────────────────────────

export default function StyleSelector() {
  const [selections, setSelections] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c.id, null]))
  )

  const sectionRef = useRef(null)
  const leftRef    = useRef(null)
  const rightRef   = useRef(null)

  // ── ScrollTrigger panel entrance ─────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const shared = {
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      }
      if (window.innerWidth >= 768) {
        // Desktop: slide in from sides
        gsap.fromTo(leftRef.current,
          { x: '-100%', opacity: 0 }, { x: 0, opacity: 1, ...shared }
        )
        gsap.fromTo(rightRef.current,
          { x: '100%',  opacity: 0 }, { x: 0, opacity: 1, ...shared }
        )
      } else {
        // Mobile: fade up both panels
        gsap.fromTo(
          [leftRef.current, rightRef.current],
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.15, ...shared }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  const handleSelect = (catId, option) => {
    setSelections(prev => ({
      ...prev,
      // clicking the active item deselects it
      [catId]: prev[catId]?.id === option.id ? null : option,
    }))
  }

  const selectedCount = CATEGORIES.filter(c => selections[c.id]).length
  const allSelected   = selectedCount === CATEGORIES.length
  const total         = CATEGORIES.reduce((s, c) => s + (selections[c.id]?.price ?? 0), 0)

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col md:flex-row min-h-screen md:h-screen overflow-hidden"
      style={{ background: '#111' }}
    >
      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <div
        ref={leftRef}
        className="relative flex flex-col justify-center gap-8 px-6 md:px-12 py-10 overflow-y-auto w-full md:w-[48%] border-b border-white/[0.06] md:border-b-0 md:border-r md:border-r-white/[0.06]"
      >
        <h2
          className="font-heading text-white leading-none"
          style={{ fontSize: 'clamp(28px, 4vw, 72px)' }}
        >
          BUILD YOUR FIT
        </h2>

        {/* Category rows */}
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-3">

              {/* Row label */}
              <span
                className="font-mono text-white/40"
                style={{ fontSize: 11, letterSpacing: '3px' }}
              >
                {cat.label}
              </span>

              {/* Option buttons */}
              <div className="flex gap-3">
                {cat.options.map((opt) => {
                  const active = selections[cat.id]?.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      className="hoverable relative flex-none overflow-hidden"
                      onClick={() => handleSelect(cat.id, opt)}
                      title={`${opt.name} — $${opt.price}`}
                      style={{
                        width: 80,
                        height: 80,
                        border: active
                          ? '2px solid #C8FF00'
                          : '2px solid rgba(255,255,255,0.12)',
                        boxShadow: active
                          ? '0 0 0 3px rgba(200,255,0,0.15), 0 0 18px rgba(200,255,0,0.22)'
                          : 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        background: 'none',
                        padding: 0,
                      }}
                    >
                      {/* Thumbnail placeholder — swap for <img> when product photos exist */}
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: opt.color }}
                      />

                      {/* Active indicator badge */}
                      {active && (
                        <span
                          className="absolute bottom-1 right-1 font-mono leading-none"
                          style={{
                            fontSize: 8,
                            color: '#0a0a0a',
                            background: '#C8FF00',
                            padding: '1px 3px',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected item name — always present, fades in/out */}
              <p
                className="font-mono text-[#C8FF00]"
                style={{
                  fontSize: 11,
                  letterSpacing: '1px',
                  height: 16,
                  opacity: selections[cat.id] ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {selections[cat.id]?.name ?? ''}
              </p>

            </div>
          ))}
        </div>

        {/* ── Price total ──────────────────────────────────────────────────── */}
        <div
          className="flex items-baseline gap-4 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span
            className="font-mono text-white/35"
            style={{ fontSize: 11, letterSpacing: '2px' }}
          >
            TOTAL
          </span>
          <span
            className="font-heading text-white"
            style={{
              fontSize: 'clamp(26px, 3vw, 52px)',
              transition: 'all 0.25s ease',
            }}
          >
            ${total.toLocaleString()}
          </span>
          <span
            className="font-mono text-white/25"
            style={{
              fontSize: 10,
              letterSpacing: '1px',
              opacity: selectedCount > 0 ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            {selectedCount} / 4
          </span>
        </div>

        {/* ── ADD FULL LOOK button — slides up when all 4 selected ─────────── */}
        <div
          style={{
            opacity: allSelected ? 1 : 0,
            transform: allSelected ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents: allSelected ? 'auto' : 'none',
          }}
        >
          <button
            className="hoverable font-mono w-full py-4 font-bold tracking-widest"
            style={{
              fontSize: 13,
              letterSpacing: '3px',
              color: '#0a0a0a',
              background: '#C8FF00',
              border: 'none',
              animation: allSelected ? 'lime-pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            ADD FULL LOOK →
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        className="relative flex items-center justify-center w-full md:w-[52%] py-10 md:py-0"
      >
        {/* Model container — 2:3 portrait aspect matching a fashion silhouette */}
        <div
          className="relative"
          style={{ height: 'clamp(300px, 60vw, 82vh)', aspectRatio: '2 / 3' }}
        >
          {/* Base silhouette — swap for:
              <img src="/models/base.png" className="absolute inset-0 w-full h-full object-contain" />
              when the base PNG is ready */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ background: '#1c1c1c', borderRadius: 2 }}
          />

          {/* Outfit layers stacked by z-index */}
          {CATEGORIES.map((cat) => (
            <OutfitLayer
              key={cat.id}
              option={selections[cat.id]}
              zIndex={cat.layerZ}
              layerPos={cat.layerPos}
            />
          ))}

          {/* Empty-state nudge */}
          {selectedCount === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 50, opacity: 0.25 }}
            >
              <span
                className="font-mono text-white text-center"
                style={{ fontSize: 11, letterSpacing: '2px' }}
              >
                ← SELECT ITEMS
              </span>
            </div>
          )}
        </div>

        {/* Layer legend — bottom-right corner */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-[6px]">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: selections[cat.id]?.color ?? 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.3s ease',
                }}
              />
              <span
                className="font-mono text-white/30"
                style={{ fontSize: 9, letterSpacing: '1.5px' }}
              >
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
