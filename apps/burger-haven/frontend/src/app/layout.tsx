import type {Metadata} from 'next'
import {Inter, Playfair_Display} from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Burger Haven — Fresh Made Daily',
  description: 'Premium burgers, fresh ingredients, bold flavors.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-bh-cream antialiased">{children}</body>
    </html>
  )
}
