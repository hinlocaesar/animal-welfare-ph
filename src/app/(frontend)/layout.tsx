import type { Metadata, Viewport } from 'next'
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Motion } from '@/components/Motion'
import { ScrollLink } from '@/components/ScrollLink'
import { Sprite } from '@/components/Sprite'

import './globals.css'

/* Variable fonts, self-hosted at build time. The SOFT/WONK axes give Fraunces
   its soft, slightly wonky details, and with them the "friendly" in the art direction. */
const display = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const text = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paws & Hearts PH: Animal Volunteer Opportunities in the Philippines',
  description:
    'A hand-verified directory of shelters, rescues, sanctuaries and conservation programs across Luzon, Visayas and Mindanao where you can volunteer to help animals.',
  applicationName: 'Paws & Hearts PH',
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  openGraph: {
    type: 'website',
    siteName: 'Paws & Hearts PH',
    locale: 'en_PH',
    title: 'Paws & Hearts PH: Animal Volunteer Opportunities in the Philippines',
    description:
      'Shelters, rescues, sanctuaries and conservation programs across three island regions, each listing checked against an official source.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  themeColor: '#121110',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <ScrollLink className="skip-link" href="#directory">
          Skip to the directory
        </ScrollLink>

        <div className="progress" aria-hidden="true">
          <span className="progress-bar" id="progress-bar" />
        </div>

        <Sprite />

        <Header />

        <main id="main">{children}</main>

        <Footer />

        <Motion />
      </body>
    </html>
  )
}
