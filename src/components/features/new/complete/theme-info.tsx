// src/components/complete-page/theme-info.tsx
'use client'

import React from 'react'
import InfoCard from './info-card'
import { Palette } from 'lucide-react'

interface ThemeInfoProps {
  theme: string
}

export default function ThemeInfo({ theme }: ThemeInfoProps) {
  return (
    <InfoCard title="テーマ" icon={Palette}>
      <p className="text-gray-200 text-base">{theme}</p>
    </InfoCard>
  )
}
