// src/components/complete-page/action-buttons.tsx
'use client'

import { Button } from '🎙️/components/ui/button'
import { Podcast } from 'lucide-react'
import React from 'react'

interface ActionButtonsProps {
  onRestart: () => void
  onProceedToRecording: () => void // 追加
  isSaving: boolean // 追加
}

export default function ActionButtons({ onRestart, onProceedToRecording, isSaving }: ActionButtonsProps) {
  return (
    <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
      <Button
        onClick={onRestart}
        size="lg"
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={isSaving}
      >
        もう一度生成する
      </Button>
      <Button
        size="lg"
        variant="default"
        className="w-full sm:w-auto"
        onClick={onProceedToRecording} // 変更
        disabled={isSaving} // 追加
      >
        {isSaving
          ? '準備中...'
          : (
              <>
                <Podcast size={20} className="mr-2" />
                録音に進む
              </>
            )}
      </Button>
    </div>
  )
}
