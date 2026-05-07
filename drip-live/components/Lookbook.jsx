'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LOOKS = [
  {
    num: '01',
    name: 'URBAN GHOST',
    textureBg: '#0f1f1c',
    modelBg:   '#4A7C73',
    textureImg: '/textures/look1.jpg',
    modelImg:   '/models/model1.png',
    tags: ['OVERSIZED ↗', 'DROP 001 ↗', 'UNISEX ↗'],
  },
  {
    num: '02',
    name: 'BLOOD MONEY',
    textureBg: '#1a0e11',
    modelBg:   '#6B1F2A',
    textureImg: '/textures/look2.jpg',
    modelImg:   '/models/model2.png',
    tags: ['STATEMENT ↗', 'DROP 001 ↗'],
  },
  {
    num: '03',
    name: 'DIRTY LUXE',
    textureBg: '#1a1309',
    modelBg:   '#5C3A1E',
    textureImg: '/textures/look3.jpg',
    modelImg:   '/models/model3.png',
    tags: ['LAYERED ↗', 'VINTAGE ↗', 'DROP 002 ↗'],
  },
  {
    num: '04',
    name: 'SOFT POWER',
    textureBg: '#0d170f',
    modelBg:   '#3D6B57',
    textureImg: '/textures/look4.jpg',
    modelImg:   '/models/model4.png',
    tags: ['MINIMAL ↗', 'STREET ↗'],
  },
  {
    num: '05',
    name: 'NO MERCY',
    textureBg: '#0f1a08',
    modelBg:   '#4A6B1F',
    textureImg: '/textures/look5.jpg',
    modelImg:   '/models/model5.png',
    tags: ['BOLD ↗', 'DROP 002 ↗', 'LIMITED ↗'],
  },
]

const CARD_COUNT = LOOKS.length

export default function Lookbook() {
  const wrapperRef  = useRef(null)
  const trackRef    = useRef(null)
  const progressRef = useRef(null)
  const bgRefs      = useRef([])   // one per card — for parallax

  useEffect(() => {
    const wrapper  = wrapperRef.current
    const track    = trackRef.current
    const progress = progressRef.current
    if (!wrapper || !track || !progress) return

    // Total scroll distance = (cards - 1) * viewport width
    const scrollDist = () => (CARD_COUNT - 1) * window.innerWidth

    // ── Float animation on every [data-float] tag ─────────────────────
    const tags = Array.from(wrapper.querySelectorAll('[data-float]'))
    tags.forEach((el, i) => {
      gsap.to(el, {
        y: -8,
        duration: 2 + (i % 3) * 0.35,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.18,
      })
    })

    // ── Horizontal scroll ─────────────────────────────────────────────
    const tween = gsap.to(track, {
      x: () => -scrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${scrollDist()}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,  // recalculates end on resize
        onUpdate: (self) => {
          // ── Progress bar ──────────────────────────────────────────
          progress.style.transform = `scaleX(${self.progress})`

          // ── Parallax: shift each bg layer opposite to track motion ─
          // bg layer is 110% wide (5% bleed each side), so ±5% of vw
          // is the safe parallax budget without revealing edges.
          const trackX = -self.progress * scrollDist()
          bgRefs.current.forEach((bg, i) => {
            if (!bg) return
            const cardLeft = i * window.innerWidth + trackX
            // shift bg opposite direction: 5% of how far card is off-center
            bg.style.transform = `translateX(${-cardLeft * 0.05}px)`
          })
        },
      },
    })

    ScrollTrigger.refresh()

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      tags.forEach((el) => gsap.killTweensOf(el))
    }
  }, [])

  return (
    <section
      ref={wrapperRef}
      className="relative h-screen overflow-hidden bg-[#0a0a0a]"
    >
      {/* ── Scroll progress bar ──────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 h-[2px]"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          ref={progressRef}
          className="h-full bg-[#C8FF00] origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* ── Horizontal track ─────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="flex h-full will-change-transform"
        style={{ width: `${CARD_COUNT * 100}vw` }}
      >
        {LOOKS.map((look, i) => (
          <div
            key={look.num}
            className="relative flex-none w-screen h-screen overflow-hidden group"
          >
            {/* Background — solid color fallback; backgroundImage shows when
                texture files are added to /public/textures/             */}
            <div
              ref={(el) => { bgRefs.current[i] = el }}
              className="absolute will-change-transform"
              style={{
                inset: '-5%',
                width: '110%',
                height: '110%',
                backgroundColor: look.textureBg,
                backgroundImage: `url(${look.textureImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Legibility overlay */}
            <div className="absolute inset-0 bg-black/35 z-[1]" />

            {/* ── Decorative look number ──────────────────────────────────── */}
            <span
              className="absolute top-6 left-8 font-heading text-white z-[2] select-none pointer-events-none leading-none"
              style={{ fontSize: '20vw', opacity: 0.08 }}
              aria-hidden="true"
            >
              {look.num}
            </span>

            {/* ── Model placeholder (bottom-right, scales on hover) ───────── */}
            {/* Replace the inner <div> with <img src={look.modelImg} ... />
                when model PNGs are ready — the group-hover scale stays the same */}
            <div
              className="absolute bottom-0 z-[3]"
              style={{
                right: '5vw',
                height: '60vh',
                aspectRatio: '2/3',
                transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transformOrigin: 'bottom center',
              }}
              // group-hover via JS because aspectRatio makes Tailwind's
              // group-hover:scale-105 apply to dimensions, not transform
            >
              <div
                className="w-full h-full group-hover:scale-105 transition-transform duration-[400ms]"
                style={{
                  backgroundColor: look.modelBg,
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              />
            </div>

            {/* ── Bottom-left: look name + floating tags ──────────────────── */}
            <div className="absolute bottom-10 left-8 z-[4] flex flex-col gap-5">
              <h3
                className="font-heading text-white leading-none"
                style={{ fontSize: 'clamp(24px, 5vw, 88px)' }}
              >
                {look.name}
              </h3>

              <div className="flex flex-wrap gap-2">
                {look.tags.map((tag, t) => (
                  <span
                    key={t}
                    data-float
                    className="font-mono text-[#C8FF00] border border-[#C8FF00]/35 px-2 py-[5px] leading-none"
                    style={{ fontSize: 11, letterSpacing: '1.5px' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  )
}
