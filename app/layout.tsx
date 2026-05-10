import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  style: ['normal', 'italic'],
  preload: false,
})

export const metadata: Metadata = {
  title: 'CredibleState — Hyderabad\'s Verified Property Platform',
  description:
    'Find verified PGs, flats, and villas in Hyderabad. Zero brokerage, 100% verified listings, direct from owners. No fake listings, ever.',
  keywords: [
    'Hyderabad properties',
    'verified rentals Hyderabad',
    'flats for rent Hyderabad',
    'PG in Hyderabad',
    'zero brokerage Hyderabad',
    'CredibleState',
  ],
  openGraph: {
    title: 'CredibleState — Hyderabad\'s Verified Property Platform',
    description:
      'Verified rentals and sales across Hyderabad. Zero brokerage, direct from owners.',
    url: 'https://crediblestate.com',
    siteName: 'CredibleState',
    locale: 'en_IN',
    type: 'website',
  },
  metadataBase: new URL('https://crediblestate.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} antialiased`}
    >
      <body style={{ margin: 0, padding: 0, background: '#FAF7F2', color: '#100E0B', fontFamily: 'var(--font-inter), system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
