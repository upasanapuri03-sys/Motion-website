import type { Metadata } from 'next'
import { Bebas_Neue, Space_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import CustomCursor from '@/components/CustomCursor'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DRIP.LIVE | SS26',
  description:
    'Next-generation fashion editorial. Raw, unfiltered street culture. Drop 001 launching soon.',
  openGraph: {
    title:       'DRIP.LIVE | SS26',
    description: 'Next-generation fashion editorial. Raw, unfiltered street culture.',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'DRIP.LIVE | SS26',
    description: 'Next-generation fashion editorial. Raw, unfiltered street culture.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable}`}>
      <body>
        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
