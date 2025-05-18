'use client'

import { LocationStateProvider } from '@location-state/core'
import { NuqsAdapter } from 'nuqs/adapters/next'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider>
      <NuqsAdapter>
        {children}
      </NuqsAdapter>
    </LocationStateProvider>
  )
}
