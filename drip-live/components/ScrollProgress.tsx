'use client'

import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const update = () => {
      const scrolled = window.scrollY
      const total    = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        right:         0,
        height:        2,
        zIndex:        9000,
        background:    'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={barRef}
        style={{
          height:          '100%',
          background:      '#C8FF00',
          transformOrigin: 'left',
          transform:       'scaleX(0)',
          willChange:      'transform',
        }}
      />
    </div>
  )
}
