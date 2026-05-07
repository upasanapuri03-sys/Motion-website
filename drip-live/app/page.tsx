'use client'

import dynamic from 'next/dynamic'
import Loader from '@/components/Loader'
import ScrollProgress from '@/components/ScrollProgress'

const Hero          = dynamic(() => import('@/components/Hero'),          { ssr: false })
const Lookbook      = dynamic(() => import('@/components/Lookbook'),      { ssr: false })
const StyleSelector = dynamic(() => import('@/components/StyleSelector'), { ssr: false })
const StreetCam     = dynamic(() => import('@/components/StreetCam'),     { ssr: false })
const DropCounter   = dynamic(() => import('@/components/DropCounter'),   { ssr: false })
const MarqueeFooter = dynamic(() => import('@/components/MarqueeFooter'), { ssr: false })

export default function Home() {
  return (
    <>
      <Loader />
      <ScrollProgress />
      <main>
        <Hero />
        <Lookbook />
        <StyleSelector />
        <StreetCam />
        <DropCounter />
        <MarqueeFooter />
      </main>
    </>
  )
}
