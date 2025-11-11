import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Globe Telecom - Interface d\'Administration',
  description: 'Interface d\'administration sécurisée pour la gestion des messages de contact Globe Telecom',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster 
          position="top-right"
          richColors
          expand={false}
          closeButton
        />
      </body>
    </html>
  )
}