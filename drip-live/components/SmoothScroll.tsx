'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    let raf: number

    function animate(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
