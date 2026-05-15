import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request Workflow',
  description: 'Internal Approval System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
