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
    default: 'World Health Organisation | WHO',
    template: '%s | World Health Organisation'
  },
  description: 'World Health Organisation is the directing and coordinating authority for health within the United Nations system.',
  keywords: ['World Health Organisation', 'WHO', 'health', 'global health', 'public health', 'healthcare', 'disease prevention'],
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHO%20FAv%20Icon-3GW8trrW6xCuRYBOBiLUYMU5Qdvm98.jpg',
    shortcut: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHO%20FAv%20Icon-3GW8trrW6xCuRYBOBiLUYMU5Qdvm98.jpg',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHO%20FAv%20Icon-3GW8trrW6xCuRYBOBiLUYMU5Qdvm98.jpg',
  },
  openGraph: {
    title: 'World Health Organisation | WHO',
    description: 'World Health Organisation - directing and coordinating global health.',
    type: 'website',
    siteName: 'World Health Organisation',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Who%20GLOGAL-MMrhxYsSocOGgUS9nFz4sW2a7FyJDM.jpg',
        width: 1200,
        height: 630,
        alt: 'World Health Organization',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Health Organisation | WHO',
    description: 'World Health Organisation - directing and coordinating global health.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Who%20GLOGAL-MMrhxYsSocOGgUS9nFz4sW2a7FyJDM.jpg'],
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
