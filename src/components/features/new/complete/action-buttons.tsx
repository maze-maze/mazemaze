// src/components/complete-page/action-buttons.tsx
'use client'

import { Button, buttonVariants } from '🎙️/components/ui/button'
import { Podcast } from 'lucide-react'
import React from 'react'

interface ActionButtonsProps {
  onRestart: () => void
}

export default function ActionButtons({ onRestart }: ActionButtonsProps) {
  return (
    <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
      <Button
        onClick={onRestart}
        size="lg"
        variant="secondary"
        className="w-full sm:w-auto"
      >
        もう一度生成する
      </Button>
      <a
        href="/new/recording"
        className={buttonVariants({
          size: 'lg',
          variant: 'default',
          className: 'w-full sm:w-auto',
        })}
      >
        <Podcast size={20} className="mr-2" />
        録音に進む
      </a>
    </div>
  )
}
