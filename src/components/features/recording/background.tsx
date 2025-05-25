import type { Status } from '🎙️/lib/types/recording'
import { cn } from '🎙️/lib/utils'
import Image from 'next/image'
import Object1Color from './assets/ob-1-c.svg'
import Object1 from './assets/ob-1.svg'
import Object2Color from './assets/ob-2-c.svg'
import Object2 from './assets/ob-2.svg'
import Object3Color from './assets/ob-3-c.svg'
import Object3 from './assets/ob-3.svg'
import Object4Color from './assets/ob-4-c.svg'
import Object4 from './assets/ob-4.svg'
import Object5Color from './assets/ob-5-c.svg'
import Object5 from './assets/ob-5.svg'

export default function Background({ status, isRecording }: { status: Status, isRecording: boolean }) {
  const isColor = status !== 'idle'

  const objectClasses = cn(
    'transition-all duration-400 absolute -z-10',
    isRecording ? 'opacity-0' : isColor ? 'opacity-0' : 'opacity-100',
  )
  const colorObjectClasses = cn(
    'transition-all duration-400 absolute -z-10',
    isRecording ? 'opacity-0' : isColor ? 'opacity-100' : 'opacity-0',
  )

  return (
    <>
      <Image src={Object1} alt="" width={50} height={50} className={cn(objectClasses, 'top-50 left-15')} />
      <Image src={Object2} alt="" width={80} height={80} className={cn(objectClasses, 'bottom-20 left-0')} />
      <Image src={Object3} alt="" width={40} height={40} className={cn(objectClasses, 'top-25 right-2/5')} />
      <Image src={Object4} alt="" width={100} height={100} className={cn(objectClasses, 'top-40 right-0')} />
      <Image src={Object5} alt="" width={80} height={80} className={cn(objectClasses, 'bottom-40 right-10')} />

      <Image src={Object1Color} alt="" width={50} height={50} className={cn(colorObjectClasses, 'top-50 left-15')} />
      <Image src={Object2Color} alt="" width={80} height={80} className={cn(colorObjectClasses, 'bottom-20 left-0')} />
      <Image src={Object3Color} alt="" width={40} height={40} className={cn(colorObjectClasses, 'top-25 right-2/5')} />
      <Image src={Object4Color} alt="" width={100} height={100} className={cn(colorObjectClasses, 'top-40 right-0')} />
      <Image src={Object5Color} alt="" width={80} height={80} className={cn(colorObjectClasses, 'bottom-40 right-10')} />
    </>
  )
}
