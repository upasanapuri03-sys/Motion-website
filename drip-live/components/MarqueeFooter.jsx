'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Marquee row data ───────────────────────────────────────────────────────────

const ROW_A = 'DRIP LIVE · DROP 001 · SS26 · NO RULES · BUILT DIFFERENT · '
const ROW_B = 'HARAJUKU · SHOREDITCH · LE MARAIS · SOHO NYC · KREUZBERG · SHIBUYA · '

const NAV_LINKS = [
  { label: 'DROPS',     href: '#' },
  { label: 'LOOKBOOK',  href: '#' },
  { label: 'ABOUT',     href: '#' },
  { label: 'CONTACT',   href: '#' },
  { label: 'INSTAGRAM', href: '#' },
]

// ── MarqueeRow ────────────────────────────────────────────────────────────────
// Pure CSS infinite scroll — the text is duplicated so the seam is invisible.
// direction: 'left' | 'right'

function MarqueeRow({ text, direction = 'left', duration = 28 }) {
  const doubled = text + text

  return (
    <div
      className="overflow-hidden whitespace-nowrap"
      aria-hidden="true"
    >
      <span
        className="font-heading text-white/10 inline-block will-change-transform"
        style={{
          fontSize: 'clamp(28px, 3.5vw, 64px)',
          animation: `${direction === 'left' ? 'marquee-left' : 'marquee-right'} ${duration}s linear infinite`,
          letterSpacing: '0.04em',
        }}
      >
        {doubled}
      </span>
    </div>
  )
}

// ── MarqueeFooter ─────────────────────────────────────────────────────────────

export default function MarqueeFooter() {
  const sectionRef  = useRef(null)
  const footerRef   = useRef(null)
  const marqueeRef  = useRef(null)

  // ── Hero model exit + footer entrance on ScrollTrigger ───────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Walk the model off-screen when the footer enters the viewport
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const model = document.querySelector('[data-hero-model]')
          if (model) {
            gsap.to(model, {
              x: '-120vw',
              opacity: 0,
              duration: 0.9,
              ease: 'power3.in',
            })
          }

          // Marquee fade-in
          gsap.fromTo(
            marqueeRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: 'power2.out' }
          )

          // Footer links stagger
          gsap.fromTo(
            footerRef.current.querySelectorAll('[data-link]'),
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              stagger: 0.07,
            }
          )
        },
      })

    })
    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Marquee block ─────────────────────────────────────────────────── */}
      <div
        ref={marqueeRef}
        className="py-6 flex flex-col gap-3"
        style={{ opacity: 0 }}
      >
        <MarqueeRow text={ROW_A} direction="left"  duration={30} />
        <MarqueeRow text={ROW_B} direction="right" duration={24} />
      </div>

      {/* ── Hairline separator ────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* ── Footer bottom bar ─────────────────────────────────────────────── */}
      <div
        ref={footerRef}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-8"
      >
        {/* Brand wordmark */}
        <span
          data-link
          className="font-heading text-white/80 leading-none"
          style={{ fontSize: 'clamp(22px, 3vw, 44px)', opacity: 0 }}
        >
          DRIP LIVE
        </span>

        {/* Nav links */}
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              data-link
              href={href}
              className="hoverable font-mono text-white/35 hover:text-[#C8FF00] transition-colors duration-200"
              style={{ fontSize: 10, letterSpacing: '2.5px', opacity: 0 }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Legal */}
        <span
          data-link
          className="font-mono text-white/20"
          style={{ fontSize: 9, letterSpacing: '1.5px', opacity: 0 }}
        >
          © 2026 DRIP LIVE. ALL RIGHTS RESERVED.
        </span>
      </div>
    </footer>
  )
}
