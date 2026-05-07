'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let raf: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // lerp factor 0.12 gives the slight lag
      cursorX += (mouseX - cursorX) * 0.12
      cursorY += (mouseY - cursorY) * 0.12
      cursor.style.transform = `translate(${cursorX - 8}px, ${cursorY - 8}px)`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
}
