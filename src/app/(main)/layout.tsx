import { Suspense } from 'react'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="max-w-md mx-auto relative">
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </div>
  )
}
