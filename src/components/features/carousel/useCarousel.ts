import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { Dispatch, SetStateAction } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'

// ループで必ず右方向に進めさせるための計算用ユーティリティ関数
const getToIndex = (length: number, from: number, to: number) => {
  const indexes = [...Array(length)].map((_, i) => i)
  const fromToEnd = indexes.slice(from)
  const startToFrom = indexes.slice(0, from)
  return [...fromToEnd, ...startToFrom].indexOf(to)
}

export const useCarousel = (
  setActiveIndex: Dispatch<SetStateAction<number>>,
  sliderOption: EmblaOptionsType,
  plugins?: EmblaPluginType[],
) => {
  const [sliderRef, sliderAPI] = useEmblaCarousel(sliderOption, plugins)

  const handleNextScroll = () => {
    if (!sliderAPI || !sliderAPI.canScrollNext()) return
    sliderAPI.scrollNext()
    setActiveIndex(sliderAPI.selectedScrollSnap())
  }

  const handlePrevScroll = () => {
    if (!sliderAPI || !sliderAPI.canScrollPrev()) return
    sliderAPI.scrollPrev()
    setActiveIndex(sliderAPI.selectedScrollSnap())
  }

  // 指定したインデックスにスクロールする（方向は自動判定）
  const handleToAutoScroll = (toIndex: number) => {
    if (!sliderAPI) return
    sliderAPI.scrollTo(toIndex)
    setActiveIndex(sliderAPI.selectedScrollSnap())
  }

  // 指定したインデックスに向かって必ず右方向へ進ませる
  const handleToRightScroll = (toIndex: number) => {
    if (!sliderAPI) return
    const currentIndex = sliderAPI.selectedScrollSnap()
    if (currentIndex === toIndex) return

    const slideLength = sliderAPI.slideNodes().length

    // 指定したインデックスと現在のインデックスにもとづいてスライドの右方向への移動回数を計算
    const scrollTimes =
      toIndex > currentIndex ? toIndex - currentIndex : slideLength - getToIndex(slideLength, toIndex, currentIndex)
    for (const _ of Array(scrollTimes)) {
      sliderAPI.scrollNext()
    }

    setActiveIndex(sliderAPI.selectedScrollSnap())
  }

  // スワイプ操作でスライダーを切り替えた場合のインデックス更新処理（ポインターアップで終了を判定）
  useEffect(() => {
    if (!sliderAPI) return

    const updateIndex = () => setActiveIndex(sliderAPI.selectedScrollSnap())
    sliderAPI.on('select', updateIndex)

    // cleanup
    return () => {
      sliderAPI.off('select', updateIndex)
    }
  }, [sliderAPI, setActiveIndex])

  return {
    handleNextScroll,
    handlePrevScroll,
    handleToRightScroll,
    handleToAutoScroll,
    sliderRef,
    sliderAPI,
  }
}