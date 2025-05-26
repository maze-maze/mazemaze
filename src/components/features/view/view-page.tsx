'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '🎙️/components/ui/carousel'
import { cn } from '🎙️/lib/utils'
import Image from 'next/image'
import { Button } from '🎙️/components/ui/button'
import { MessageSquareMoreIcon, Share2Icon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CarouselApi } from '🎙️/components/ui/carousel'

const items = [
  {
    bg: 'bg-gradient-to-b from-purple-500 to-pink-300',
    title: '謎の未確認生物 UMA探訪記',
  },
  {
    bg: 'bg-gradient-to-b from-blue-600 to-blue-200',
    title: '異世界転生グルメ紀行',
  },
  {
    bg: 'bg-gradient-to-b from-yellow-400 to-yellow-200',
    title: '昭和レトロ喫茶の魅力',
  },
  {
    bg: 'bg-gradient-to-b from-green-400 to-green-200',
    title: '宇宙人と語る夜',
  },
]

export default function ViewPage() {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap()
      console.log('現在のアイテムインデックス:', currentIndex)
    }

    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <Carousel
      orientation="vertical"
      className="w-full"
      opts={{
        loop: true,
      }}
      setApi={setApi}
    >
      <CarouselContent className="h-dvh">
        {Array.from({ length: 4 }).map((_, index) => (
          <CarouselItem key={index} className='h-full w-full flex flex-col items-center gap-8 pt-20 relative'>
            <p className='text-2xl'>{items[index].title}</p>
            <div className={cn(items[index].bg, 'w-2/3 aspect-square rounded-3xl mx-auto flex items-center justify-center')}>
              <Image
                src="/lama.png"
                alt=""
                width={200}
                height={2000}
              />
            </div>
              <Image
                src="/character.png"
                alt=""
                width={200}
                height={2000}
            />
            <div className="absolute right-5 bottom-10 z-50 flex flex-col gap-4">
              <Button size='icon' variant='outline' className='rounded-full size-13'>
                <ThumbsUpIcon className='size-7' />
              </Button>
              <Button size='icon' variant='outline' className='rounded-full size-13'>
                <ThumbsDownIcon className='size-7' />
              </Button>
              <Button size='icon' variant='outline' className='rounded-full size-13'>
                <MessageSquareMoreIcon className='size-7' />
              </Button>
              <Button size='icon' variant='outline' className='rounded-full size-13'>
                <Share2Icon className='size-7' />
              </Button>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
