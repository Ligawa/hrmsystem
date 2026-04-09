import React from "react"
import Script from 'next/script'
import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const sourceSans = Source_Sans_3({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: 'World Vision International | WVI',
    template: '%s | World Vision International'
  },
  description: 'World Vision International works globally to promote sustainable economic development, reduce poverty and inequality, and build resilient economies for a better future.',
  keywords: ['World Vision International', 'WVI', 'international development', 'sustainable development', 'poverty reduction', 'global development', 'humanitarian'],
  icons: {
    icon: '/images/wvi-logo.svg',
    shortcut: '/images/wvi-logo.svg',
    apple: '/images/wvi-logo.svg',
  },
  openGraph: {
    title: 'World Vision International | WVI',
    description: 'Promoting sustainable economic development and reducing poverty worldwide.',
    type: 'website',
    siteName: 'World Vision International',
    images: [
      {
        url: '/images/wvi-logo.svg',
        width: 1200,
        height: 630,
        alt: 'World Vision International',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Vision International | WVI',
    description: 'Promoting sustainable economic development and reducing poverty worldwide.',
    images: ['/images/wvi-logo.svg'],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18074072728"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18074072728');
            `,
          }}
        />
      </head>
      <body className={`${sourceSans.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
