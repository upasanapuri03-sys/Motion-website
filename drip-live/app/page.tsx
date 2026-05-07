import Hero from '@/components/Hero'
import Lookbook from '@/components/Lookbook'
import StyleSelector from '@/components/StyleSelector'
import StreetCam from '@/components/StreetCam'
import DropCounter from '@/components/DropCounter'
import MarqueeFooter from '@/components/MarqueeFooter'

export default function Home() {
  return (
    <main>
      <Hero />
      <Lookbook />
      <StyleSelector />
      <StreetCam />
      <DropCounter />
      <MarqueeFooter />
    </main>
  )
}
