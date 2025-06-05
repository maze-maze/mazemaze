/* eslint-disable unused-imports/no-unused-vars */
'use client'
import type { EmblaOptionsType } from 'embla-carousel'
import { Input } from '🎙️/components/ui/input'
import NabigationBarContainer from '🎙️/components/ui/nabigation-bar-container'
import { cn } from '🎙️/lib/utils'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Home,
  Plus,
  Search,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCarousel } from '../carousel/useCarousel'
import Background from '../layout/backgeound'
import Header from '../layout/header'

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
  const [selected, setSelected] = useState<string | null>(themes[1])

  // グラデーション配列
  const gradients = [
    'bg-gradient-to-b from-red-500 to-pink-300',
    'bg-gradient-to-b from-blue-600 to-blue-200',
    'bg-gradient-to-b from-yellow-400 to-yellow-200',
    'bg-gradient-to-b from-green-400 to-green-200',
    'bg-gradient-to-b from-purple-400 to-purple-200',
  ]

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionGradient, setTransitionGradient] = useState<string | null>(null)
  const transitionRef = useRef<HTMLDivElement>(null)

  // 選択されているスライドのインデックス
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // スライドのオプション
  const sliderOption: EmblaOptionsType = {
    loop: true,
    align: 'center',
  }

  // カスタムフックからスライド操作用のオブジェクトを取得
  const slider = useCarousel(setActiveIndex, sliderOption, [
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    }),
  ])

  // Emblaのスライド変更時にインデックスを更新
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

  // カードを押したとき
  const handleSelect = (theme: string, idx?: number) => {
    setSelected(theme)
    // カードごとのグラデーション
    const gradient = gradients[(idx!) % gradients.length]
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

  return (
    <div className="relative bg-[#0E0B16] overflow-hidden min-h-screen flex flex-col items-center w-full h-full">
      {/* フルスクリーン遷移アニメーション */}
      {isTransitioning && transitionGradient && (
        <div
          ref={transitionRef}
          className={`fixed inset-0 z-50 flex items-center justify-center transition-transform duration-500 ${transitionGradient}`}
          style={{
            animation: 'expandCard 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        />
      )}
      {/* 通常UIは遷移中は非表示 */}
      {!isTransitioning && (
        <>
          <Header/>
          <Background />

          <div className="pt-22 pb-14 px-8 w-full">
            <div className="flex relative items-center">
              <Search className="absolute left-4 text-[#9B9FAB]" size={20} />
              <Input
                className="flex-1 py-4 px-2 pl-12 h-12 border-none text-[#9B9FAB] bg-white rounded-[40px]"
                placeholder="AIとテーマを探そう"
              // value={searchQuery}
              // onChange={e => setSearchQuery(e.target.value)}
              // onKeyDown={(e) => {
              // if (e.key === 'Enter' && searchQuery.trim()) {
              // searchRelatedThemes(searchQuery)
              // }
              // }}
              />

            </div>
          </div>

          <p className="mb-6 text-white font-black text-xl text-center">
            テーマを選ぶ
          </p>

          {/* AIテーマ表示エリア */}
          <div className="w-full max-w-xl rounded-xl shadow-md overflow-visible">
            <div className="p-4" ref={slider.sliderRef}>
              <div className="flex">
                {themes.map((theme, idx) => (
                  <div
                    key={idx}
                    className="w-fit px-4"
                  >
                    <button
                      key={idx}
                      className={cn(
                        'p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-3/4 w-40 h-full relative',
                        activeIndex === idx ? 'scale-120 z-10 ' : 'scale-90 opacity-80 ',
                        gradients[(idx) % gradients.length],
                      )}

                      onClick={() => handleSelect(theme, idx)}
                    >
                      <span className="text-base font-bold">{theme}</span>
                      <img src="/lama.png" alt="" />
                    </button>
                  </div>
                ))}

              </div>
            </div>
            {/* ページネーション */}
            <div className="w-full mt-8 flex justify-center">
              <div className="flex justify-center gap-2 w-fit px-3 py-2 rounded-full opacity-40 bg-[#BFBFBF]">
                {themes.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      activeIndex === idx ? 'bg-primary' : 'bg-gray-500',
                    )}
                    onClick={() => slider.handleToRightScroll && slider.handleToRightScroll(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* ナビゲーションバー */}
            {/* <NabigationBarContainer/> */}

          </div>
        </>
      )}
      <style jsx global>
        {`
        @keyframes expandCard {
          0% {
            transform: scale(0.2);
            opacity: 0.7;
            border-radius: 32px;
          }
          80% {
            transform: scale(1.08);
            opacity: 1;
            border-radius: 0px;
          }
          100% {
            transform: scale(1);
            opacity: 1;
            border-radius: 0px;
          }
        }
      `}
      </style>
    </div>
  )
}
