'use client'

import { LocationStateProvider, NavigationSyncer } from '@location-state/core'
import { unsafeNavigation } from '@location-state/core/unsafe-navigation'
import { NuqsAdapter } from 'nuqs/adapters/next'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationStateProvider syncer={new NavigationSyncer(unsafeNavigation)}>
      <NuqsAdapter>
        {children}
      </NuqsAdapter>
    </LocationStateProvider>
  )
}
