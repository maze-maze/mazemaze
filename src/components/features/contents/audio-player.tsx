'use client'

import { Button } from '🎙️/components/ui/button'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useRef, useState } from 'react'

export default function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = () => {
    audioRef.current?.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }

  return (
    <div>
      <audio ref={audioRef} src={audioUrl} />
      {isPlaying
        ? (
            <Button onClick={handlePause} className="size-24 rounded-full">
              <PauseIcon className="size-12" fill="#000" />
            </Button>
          )
        : (
            <Button onClick={handlePlay} className="size-24 rounded-full">
              <PlayIcon className="size-12" fill="#000" />
            </Button>
          )}
    </div>
  )
}
