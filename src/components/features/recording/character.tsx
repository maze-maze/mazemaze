import { cn } from '🎙️/lib/utils'
import Image from 'next/image'
import React from 'react'

export default function Character({ character, isRecording }: { character: string, isRecording: boolean }) {
  return (
    <Image src={`/characters/${character}.png`} alt={character} width={200} height={200} className={cn(isRecording ? 'top-10 right-1/2 translate-x-1/2' : 'scale-170 top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2', 'absolute transition-all duration-400 -z-20')} />
  )
}
