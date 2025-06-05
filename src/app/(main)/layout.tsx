import { Suspense } from 'react'
import Load from './Loading'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="max-w-md mx-auto relative">
      <Suspense fallback={<Load />}>
        {children}
      </Suspense>
    </div>
  )
}
