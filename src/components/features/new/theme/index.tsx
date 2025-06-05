/* eslint-disable unused-imports/no-unused-vars */
'use client'
import type { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCarousel } from '../../carousel/useCarousel'
import Background from '../../layout/backgeound'
import Header from '../../layout/header'
import NavigationBar from '../../layout/navigation-bar'
import SearchBar from './search-bar'
import { ThemeCarouselWithPagination } from './theme-carousel-with-pagenation'

export default function ThemeSelector({
  onSelect,
  onNext,
}: {
  onSelect: (theme: { theme: string, gradient: string }) => void
  onNext: () => void
}) {
  // Embla Carousel用
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  // モックデータ
  const [themes] = useState<string[]>([
    '謎の未確認生物 UMA探訪記',
    '異世界転生グルメ紀行',
    '昭和レトロ喫茶の魅力',
    '宇宙人と語る夜',
    'AIが選ぶ名作映画',
  ])

  // グラデーション配列
  const gradients = [
    'bg-gradient-to-b from-red-500 to-pink-300',
    'bg-gradient-to-b from-blue-600 to-blue-200',
    'bg-gradient-to-b from-yellow-400 to-yellow-200',
    'bg-gradient-to-b from-green-400 to-green-200',
    'bg-gradient-to-b from-purple-400 to-purple-200',
  ]

  // 遷移アニメーション制御
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionGradient, setTransitionGradient] = useState<string | null>(null)
  const transitionRef = useRef<HTMLDivElement>(null)

  // 選択されているスライドのインデックス
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Emblaオプション
  const sliderOption: EmblaOptionsType = {
    loop: true,
    align: 'center',
  }

  // カスタムフックから取得するスライダー操作オブジェクト
  const slider = useCarousel(setActiveIndex, sliderOption, [
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  ])

  // Embla API でスライド変更時の処理
  const onSelectCallback = useCallback(() => {
    if (!emblaApi)
      return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi)
      return
    emblaApi.on('select', onSelectCallback)
    onSelectCallback()
    emblaApi.scrollTo(1)
    return () => {
      emblaApi.off('select', onSelectCallback)
    }
  }, [emblaApi, onSelectCallback])

  // カード選択時処理
  const handleSelect = (theme: string, idx: number) => {
    const gradient = gradients[idx % gradients.length]
    setTransitionGradient(gradient)
    setIsTransitioning(true)
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      setIsTransitioning(false)
      setTransitionGradient(null)
      document.body.style.overflow = ''
      onSelect({ theme, gradient })
      onNext()
    }, 600)
  }

  // ドットクリックでジャンプ
  const handleDotClick = (idx: number) => {
    slider.handleToRightScroll && slider.handleToRightScroll(idx)
  }

  return (
    <div className="relative bg-[#0E0B16] overflow-hidden min-h-screen flex flex-col items-center w-full h-full">

      <Header />
      <Background />
      <SearchBar />

      <p className="mb-6 text-white font-black text-xl text-center">
        テーマを選ぶ
      </p>

      {/* AIテーマ表示＆ページネーション */}
      <ThemeCarouselWithPagination
        themes={themes}
        gradients={gradients}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        sliderRef={slider.sliderRef as unknown as React.RefObject<HTMLDivElement>}
        onDotClick={handleDotClick}
      />

      <NavigationBar />
    </div>
  )
}
