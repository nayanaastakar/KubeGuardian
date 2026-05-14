import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KubeGuardian AI - Cloud Native DevSecOps Automation Platform',
  description: 'AI-powered Kubernetes security and DevSecOps automation platform',
  keywords: ['Kubernetes', 'Security', 'DevSecOps', 'AI', 'Automation', 'Cloud Native'],
  authors: [{ name: 'KubeGuardian AI Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`} style={{ backgroundColor: '#0d1117', color: '#e2e8f0' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
