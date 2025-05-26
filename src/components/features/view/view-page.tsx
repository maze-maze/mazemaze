/* eslint-disable no-console */
'use client'

import type { CarouselApi } from '🎙️/components/ui/carousel'
import { Button } from '🎙️/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '🎙️/components/ui/carousel'
import { cn } from '🎙️/lib/utils'
import { HomeIcon, MessageSquareMoreIcon, PlusIcon, Share2Icon, ThumbsDownIcon, ThumbsUpIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
    <>
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
            <CarouselItem key={index} className="h-full w-full bg-[#0E0B16] flex flex-col items-center gap-8 pt-20 relative">
              <p className="text-2xl">{items[index].title}</p>
              <div className={cn(items[index].bg, 'size-60 rounded-3xl mx-auto flex items-center justify-center')}>
                <Image
                  src="/lama.png"
                  alt=""
                  width={200}
                  height={200}
                />
              </div>
              <Image
                src="/character.png"
                alt=""
                width={200}
                height={200}
              />
              <div className="absolute right-5 bottom-35 z-50 flex flex-col gap-4">
                <Button size="icon" variant="outline" className="rounded-full size-13">
                  <ThumbsUpIcon className="size-7" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full size-13">
                  <ThumbsDownIcon className="size-7" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full size-13">
                  <MessageSquareMoreIcon className="size-7" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full size-13">
                  <Share2Icon className="size-7" />
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[64px] flex items-center justify-between px-8 bg-gradient-to-br from-[#5B5B5B] to-[#23232A] rounded-full shadow-2xl z-20" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}>
        <Link href="/">
          <HomeIcon className="text-white opacity-80" size={28} />
        </Link>
        <Link href="/new">
          <div className="flex-1 flex justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-b from-[#BFBFBF] to-[#888888] shadow-lg">
              <PlusIcon className="text-white" size={38} />
            </div>
          </div>
        </Link>
        <UserIcon className="text-white opacity-80" size={28} />
      </div>
    </>
  )
}
