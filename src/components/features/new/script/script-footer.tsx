'use client'

import React from 'react'

interface Props {
  disabled: boolean
  onNext: () => void
}

export default function ScriptFooter({ disabled, onNext }: Props) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[60px] flex items-center justify-center px-8 rounded-full z-20"
      style={{
        background: 'rgba(255,255,255,0.65)',
        boxShadow:
          '0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.25) inset',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.45)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          border: '2px solid #fff',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />
      <button
        className="font-bold text-lg px-8 py-2 rounded-full transition text-gray-900 hover:text-black"
        onClick={onNext}
        disabled={disabled}
      >
        決定
      </button>
    </div>
  )
}
