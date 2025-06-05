// src/components/user-page/theme-grid.tsx
'use client'

import React from 'react'
import { cn } from '🎙️/lib/utils'

interface ThemeGridProps {
  displayThemes: string[]
  gradients: string[]
}

export default function ThemeGrid({ displayThemes, gradients }: ThemeGridProps) {
  if (displayThemes.length === 0) {
    return (
      <div className="col-span-2 text-center text-gray-400 py-10">
        いいねしたテーマはありません。
      </div>
    )
  }

  return (
    <>
      {displayThemes.map((themeItem, idx) => (
        <div key={`${idx}-${themeItem}`} className="flex justify-center">
          <button
            className={cn(
              'p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition w-40 h-52 relative',
              gradients[idx % gradients.length]
            )}
          >
            <span className="text-base font-bold text-white">{themeItem}</span>
            <img src="/lama.png" alt="" className="w-12 h-12" />
          </button>
        </div>
      ))}
    </>
  )
}
