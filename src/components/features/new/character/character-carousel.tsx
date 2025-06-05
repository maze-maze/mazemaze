'use client'
import type { EmblaOptionsType } from 'embla-carousel'
import type { Personality } from './types'
import { cn } from '🎙️/lib/utils'
import { Info, PlayIcon, User } from 'lucide-react'
import { useCarousel } from '../../carousel/useCarousel'

interface Props {
  slides: Personality[]
  activeIndex: number
  setActiveIndex: (idx: number) => void
  emblaOptions: EmblaOptionsType
  emblaPlugins: any[]
  onSlideClick: (p: Personality) => void
  onInfoClick: () => void
  onDecisionClick: () => void
  disableAll: boolean
}

export default function CharacterCarousel({
  slides,
  activeIndex,
  setActiveIndex,
  emblaOptions,
  emblaPlugins,
  onSlideClick,
  onInfoClick,
  onDecisionClick,
  disableAll,
}: Props) {
  const slider = useCarousel((value) => {
    if (typeof value === 'function') {
      setActiveIndex(value(activeIndex))
    }
    else {
      setActiveIndex(value)
    }
  }, emblaOptions, emblaPlugins)

  return (
    <div className="w-full max-w-xl mt-8 overflow-visible flex-1 rounded-xl relative">
      {/* スライド群 */}
      <div className="p-4" ref={slider.sliderRef}>
        <div className="flex">
          {slides.map((personality, idx) => (
            <div key={idx} className="px-2 w-fit">
              <div
                className={cn(
                  'p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-3/5.5 w-60 h-full relative',
                  activeIndex === idx
                    ? 'scale-110 z-10 bg-[#0E0B16]'
                    : 'scale-90 opacity-80 bg-[#0E0B16]',
                  personality.custom ? 'border-2 border-dashed border-gray-400 text-gray-500 hover:text-primary' : '',
                  personality.self ? 'border-2 border-primary text-primary' : '',
                )}
                style={{
                  boxShadow: activeIndex === idx ? '0 4px 24px rgba(0,0,0,0.10)' : undefined,
                }}
                onClick={() => {
                  if (!disableAll)
                    onSlideClick(personality)
                }}
              >
                {personality.self
                  ? (
                      <>
                        <div className="flex items-center justify-center w-10 h-10 mb-2 bg-primary/10 rounded-full border-2 border-primary">
                          <User className="text-white" size={28} />
                        </div>
                        <span className="font-bold mb-1 text-white">{personality.name}</span>
                        <p className="text-xs text-gray-200 line-clamp-2 mb-1">{personality.description}</p>
                      </>
                    )
                  : (
                      <>
                        <div className="absolute top-4 right-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!disableAll)
                                onInfoClick()
                            }}
                          >
                            <Info className="text-white" size={22} />
                          </button>
                        </div>
                        <img src="/character.png" alt="キャラクター" className="mb-2" />
                        <h3 className="font-bold text-white mb-1">{personality.name}</h3>
                        <p className="text-xs text-gray-200 line-clamp-2 mb-1">{personality.description}</p>
                        <p className="text-xs text-gray-200 line-clamp-2">
                          トーン:
                          {personality.tone}
                        </p>
                        <button
                          type="button"
                          className="mt-3 mb-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!disableAll)
                              onInfoClick()
                          }}
                        >
                          <PlayIcon className="text-white" size={22} />
                        </button>
                      </>
                    )}
              </div>
            </div>
          ))}
        </div>

        {/* ページネーション */}
        <div className="flex justify-center w-full mt-8">
          <div className="flex gap-2 px-3 py-2 bg-[#BFBFBF] rounded-full opacity-40">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  activeIndex === idx ? 'bg-primary' : 'bg-gray-500',
                )}
                onClick={() => {
                  if (!disableAll)
                    slider.handleToRightScroll?.(idx)
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 決定ボタン */}
      <div
        className="absolute bottom-8 left-1/2 flex items-center justify-center w-[280px] h-[60px] px-8 -translate-x-1/2 rounded-full z-20"
        style={{
          background: 'rgba(255,255,255,0.65)',
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.25) inset',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.45)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '2px solid #fff',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          className="px-8 py-2 text-lg font-bold text-black rounded-full"
          disabled={disableAll}
          onClick={() => {
            if (!disableAll)
              onDecisionClick()
          }}
        >
          決定
        </button>
      </div>
    </div>
  )
}
