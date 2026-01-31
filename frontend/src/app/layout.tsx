import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './globals.css'

import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { AppHeader } from '@/components/AppHeader'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'InBot - AI Chat Platform',
  description: 'Enterprise-grade AI chat platform with multi-turn conversations and knowledge base integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.variable}>
        <Providers>
          <MantineProvider defaultColorScheme="auto">
            <Notifications position="top-right" />
            <AppHeader />
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  )
}

