import type { Metadata } from 'next'
import { Poppins, Roboto } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { RoleBasedNavigation } from '@/components/RoleBasedNavigation'
import { AdminPreviewBanner } from '@/components/AdminPreviewBanner'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto'
})

export const metadata: Metadata = {
  title: 'Laundry Management System',
  description: 'Complete laundry management solution with order tracking, branch management, and customer support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable} font-roboto`}>
        <Providers>
          <RoleBasedNavigation>
            <AdminPreviewBanner />
            {children}
          </RoleBasedNavigation>
        </Providers>
      </body>
    </html>
  )
}
