'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ScrollTrigger must know about Lenis's virtual scroll position, not
    // window.scrollY, otherwise pin calculations are off by the smoothing lag.
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    // Push every Lenis scroll event into ScrollTrigger so its progress
    // tracking uses the smoothed position, not the native one.
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP's ticker instead of a separate rAF loop so
    // both systems share the same frame budget. GSAP time is in seconds;
    // Lenis.raf expects milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tick)
    }
  }, [])

  return <>{children}</>
}
