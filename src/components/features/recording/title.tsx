import { cn } from '🎙️/lib/utils'
import React from 'react'

export default function Title({ title, isRecording }: { title: string, isRecording: boolean }) {
  return (
    <h1 className="pt-5 flex items-center justify-center gap-2">
      <div className={cn('size-3 mt-1 rounded-full block', isRecording && 'bg-red-500 animate-pulse')} />
      <span className="text-2xl font-bold">
        {title}
      </span>
    </h1>
  )
}
