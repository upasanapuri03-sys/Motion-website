'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

export default function Loader() {
  const [count, setCount] = useState(0)
  const [gone, setGone]   = useState(false)
  const overlayRef        = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const counter = { value: 0 }
    const tween = gsap.to(counter, {
      value: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate() { setCount(Math.round(counter.value)) },
      onComplete() {
        setTimeout(() => {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.55,
            ease: 'power2.in',
            onComplete() {
              document.body.style.overflow = ''
              setGone(true)
            },
          })
        }, 180)
      },
    })

    return () => {
      tween.kill()
      document.body.style.overflow = ''
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         99999,
        background:     '#0a0a0a',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            20,
        pointerEvents:  'all',
      }}
    >
      <span
        className="font-heading text-white leading-none"
        style={{ fontSize: 'clamp(36px, 7vw, 108px)', letterSpacing: '0.08em' }}
      >
        DRIP.LIVE
      </span>

      <span
        className="font-mono text-white/40 tabular-nums"
        style={{ fontSize: 13, letterSpacing: '4px' }}
        suppressHydrationWarning
      >
        {String(count).padStart(3, '0')}%
      </span>

      {/* Bottom progress line */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          height:     2,
          width:      `${count}%`,
          background: '#C8FF00',
          transition: 'width 0.06s linear',
        }}
      />
    </div>
  )
}
