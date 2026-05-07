'use client'

import { useEffect, useRef } from 'react'

const TRAIL_COLORS = ['#C8FF00', '#FF1E1E']

export default function CustomCursor() {
  const dotRef = useRef(null)
  const followerRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const follower = followerRef.current
    if (!dot || !follower) return

    let mouseX = 0
    let mouseY = 0
    let fx = 0         // follower x (lerped)
    let fy = 0         // follower y (lerped)
    let fSize = 40     // follower diameter (lerped separately for smooth resize)
    let targetSize = 40
    let isHovering = false
    let raf
    let trailColorIdx = 0

    // ── Snap the small dot to the exact cursor position ──────────────────
    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`
    }

    // ── Hover detection ───────────────────────────────────────────────────
    const isInteractive = (el) =>
      el.closest('a') || el.closest('button') || el.closest('.hoverable')

    const onMouseOver = (e) => {
      if (!isHovering && isInteractive(e.target)) {
        isHovering = true
        targetSize = 80
        follower.style.background = 'rgba(200, 255, 0, 0.30)'
        follower.style.borderColor = 'transparent'
      }
    }

    const onMouseOut = (e) => {
      if (isHovering && isInteractive(e.target)) {
        isHovering = false
        targetSize = 40
        follower.style.background = 'transparent'
        follower.style.borderColor = 'rgba(255, 255, 255, 0.50)'
      }
    }

    // ── Fading colour trail ───────────────────────────────────────────────
    const dropTrailDot = () => {
      const color = TRAIL_COLORS[trailColorIdx % 2]
      trailColorIdx++

      const el = document.createElement('div')
      el.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        z-index: 9998;
        transform: translate(${mouseX - 4}px, ${mouseY - 4}px);
        opacity: 1;
        transition: opacity 600ms ease-out;
      `
      document.body.appendChild(el)

      // Two nested rAFs guarantee the browser has painted once before we
      // flip opacity so the CSS transition actually fires.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '0'
      }))

      setTimeout(() => el.remove(), 660)
    }

    const trailTimer = setInterval(dropTrailDot, 80)

    // ── Lerp loop ─────────────────────────────────────────────────────────
    const animate = () => {
      fx += (mouseX - fx) * 0.08
      fy += (mouseY - fy) * 0.08
      fSize += (targetSize - fSize) * 0.15   // separate lerp for size

      follower.style.width = `${fSize}px`
      follower.style.height = `${fSize}px`
      follower.style.transform = `translate(${fx - fSize / 2}px, ${fy - fSize / 2}px)`

      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mouseout', onMouseOut)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout', onMouseOut)
      cancelAnimationFrame(raf)
      clearInterval(trailTimer)
    }
  }, [])

  return (
    <>
      {/* 12px dot — tracks cursor with no lag */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#ffffff',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
      {/* 40px follower — lags with lerp 0.08, expands on hover */}
      <div
        ref={followerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 255, 255, 0.50)',
          background: 'transparent',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform, width, height',
          transition: 'background 200ms ease, border-color 200ms ease',
        }}
        aria-hidden="true"
      />
    </>
  )
}
