import type { Status } from '🎙️/lib/types/recording'
import { Button } from '🎙️/components/ui/button'
import { cn } from '🎙️/lib/utils'
import { LoaderIcon, MicIcon, PauseIcon } from 'lucide-react'
import Image from 'next/image'
import WaveformImage from './assets/waveform.png'

export default function Controller({
  status,
  time,
  onStart,
  onPause,
}: {
  status: Status
  time: string
  onStart: () => void
  onPause: () => void
}) {
  switch (status) {
    case 'idle':
      return (
        <div className="h-12 w-60 border border-white bg-white/50 backdrop-blur fixed bottom-10 right-1/2 translate-x-1/2 flex items-center justify-center gap-4 rounded-full">
          <Button className="bg-transparent hover:bg-transparent rounded-full !px-6" aria-label="Start recording" onClick={onStart}>
            <MicIcon className="text-white" />
            <span className="text-white">収録を開始する</span>
          </Button>
        </div>
      )
    case 'connecting':
    case 'connected':
      return (
        <div className="h-12 w-60 border border-white bg-white/50 backdrop-blur fixed bottom-10 right-1/2 translate-x-1/2 flex items-center justify-center rounded-full">
          <LoaderIcon className="animate-spin size-4.5" />
          <p className="text-xs ml-1">まもなく収録が始まります</p>
        </div>
      )
    case 'recording':
    case 'speaking':
      return (
        <div className={cn('h-12 w-60 border backdrop-blur fixed bottom-10 right-1/2 translate-x-1/2 flex items-center justify-between gap-4 px-1 rounded-full transition-all duration-200', status === 'speaking' ? 'border-red-500/70 bg-red-500/20' : 'border-white bg-white/50')}>
          <p className="text-xs ml-2">{time}</p>
          <Image src={WaveformImage} alt="Waveform" width={100} height={50} />
          <Button className=" bg-gray-300 border border-red-500 rounded-full !px-5" aria-label="Pause recording" onClick={onPause}>
            <PauseIcon className="text-red-500 size-5" fill="currentColor" />
          </Button>
        </div>
      )
    default:
      return <p>{status}</p>
  }
}
