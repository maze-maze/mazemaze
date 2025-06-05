import { cn } from '🎙️/lib/utils'
import Image from 'next/image'
import Object1 from './assets/ob-1.svg'
import Object2 from './assets/ob-2.svg'
import Object3 from './assets/ob-3.svg'
import Object4 from './assets/ob-4.svg'
import Object5 from './assets/ob-5.svg'

export default function Background() {
  return (
    <>
      {/* SVG1: width="103" height="173" */}
      <Image
        src={Object1}
        alt=""
        width={34}
        height={50}
        className={cn('absolute top-64 left-8')}
      />

      {/* SVG2: width="34" height="50" */}
      <Image
        src={Object2}
        alt=""
        width={85}
        height={105}
        className={cn('absolute bottom-28 left-0')}
      />

      {/* SVG3: width="46" height="54" */}
      <Image
        src={Object3}
        alt=""
        width={46}
        height={54}
        className={cn('absolute top-16 left-12')}
      />

      {/* SVG4: width="85" height="105" */}
      <Image
        src={Object4}
        alt=""
        width={103}
        height={173}
        className={cn('absolute top-10 right-0')}
      />

      {/* SVG5: width="82" height="84" */}
      <Image
        src={Object5}
        alt=""
        width={82}
        height={84}
        className={cn('absolute bottom-42 right-2')}
      />
    </>
  )
}
