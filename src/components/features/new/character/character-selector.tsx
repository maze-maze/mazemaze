'use client'
import type { EmblaOptionsType } from 'embla-carousel'
import type { Personality } from './types'
import { useChat } from 'ai/react'
import AutoPlay from 'embla-carousel-autoplay'

import { useEffect, useRef, useState } from 'react'
import CharacterCarousel from './character-carousel'
import Header from './header'
import Loader from './loader'
import SuggestionModal from './suggestion-modal'

interface Props {
  theme: string
  gradient?: string
  label: string
  onSelect: (p: Personality) => void
  onNext: () => void
  onBack: () => void
  disableSelf?: boolean // ← 追加
}

export default function CharacterSelector({
  theme,
  gradient,
  label,
  onSelect,
  onNext,
  onBack,
  disableSelf = false, // ← デフォルトを false に設定
}: Props) {
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [loading, setLoading] = useState(true)
  const [, setSelected] = useState<Personality | null>(null)
  const [, setEditMode] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Personality[]>([])
  const [, setShowList] = useState(true)
  const [, setShowChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // EmblaCarousel の設定
  const sliderOption: EmblaOptionsType = { loop: true, align: 'center' }
  const emblaPlugins = [AutoPlay({ delay: 3000, stopOnInteraction: true })]

  // AI チャットフック
  const { messages, handleSubmit, isLoading: isChatLoading } = useChat({
    api: '/api/character-chat',
    body: { theme },
    onFinish: (message) => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (message.role === 'assistant' && messages.length <= 2) {
        const regex
          = /\*\*候補\d+: ([^*]+)\*\* - 説明: ([^-]+) - トーン: ([^\n]+)(?=\n\n|\n\*\*|$)/g
        let m: RegExpExecArray | null
        const extracted: Personality[] = []
        // eslint-disable-next-line no-cond-assign
        while ((m = regex.exec(message.content)) !== null) {
          extracted.push({
            name: m[1].trim(),
            description: m[2].trim(),
            tone: m[3].trim(),
          })
        }
        if (extracted.length) {
          setPersonalities(extracted.map(p => ({ ...p, custom: false })))
          setLoading(false)
          setAiSuggestions(extracted)
          setShowSuggestionModal(true)
        }
      }
    },
  })

  // 初回ロード時に API or AI 提案を取得
  useEffect(() => {
    const fetchChars = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme }),
        })
        if (!res.ok)
          throw new Error('Failed to fetch characters')
        const data = await res.json()
        if (Array.isArray(data) && data.length) {
          setPersonalities(data)
          setLoading(false)
          return
        }
      }
      catch {
        // API が空 or エラー → AI に依頼
      }
      handleSubmit(new Event('submit') as any, {
        data: {
          prompt: `テーマ「${theme}」に合うポッドキャストのパーソナリティを3つ提案してください`,
        },
      })
    }
    fetchChars()
  }, [theme])

  // チャットメッセージが 2 件以上ある場合はチャット表示に切り替え
  useEffect(() => {
    if (messages.length > 1) {
      setShowChat(true)
    }
  }, [messages])

  const disableAll = loading || isChatLoading

  // self 用カード（SomaTakata）
  const selfCard: Personality = {
    name: 'Ryu',
    description: 'とある大学生',
    tone: '自由',
    self: true,
  }

  // — 変更ポイント：disableSelf が true の場合は selfCard を配列に含めない —
  const allSlides = disableSelf
    ? [...personalities]
    : [selfCard, ...personalities]

  const handleSelect = (p: Personality) => {
    setSelected(p)
    onSelect(p)
    setShowList(false)
    setShowChat(false)
  }

  return (
    <div
      className={`flex flex-col items-center overflow-hidden w-full min-h-screen h-full ${
        gradient || ''
      }`}
    >
      {/* ヘッダー部 */}
      <Header theme={theme} loading={loading} label={label} onBack={onBack} />

      {/* カルーセル or ローディング */}
      {!loading && !isChatLoading && (
        <CharacterCarousel
          slides={allSlides} // selfCard が除外された配列を渡す
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          emblaOptions={sliderOption}
          emblaPlugins={emblaPlugins}
          onSlideClick={(p) => {
            if (p.custom) {
              setEditMode(true)
            }
            else {
              handleSelect(p)
            }
          }}
          onInfoClick={() => setShowSuggestionModal(true)}
          onDecisionClick={() => {
            const p = allSlides[activeIndex]
            if (p) {
              handleSelect(p)
              onNext()
            }
          }}
          disableAll={disableAll}
        />
      )}

      {(loading || isChatLoading) && <Loader />}

      {/* AI 提案モーダル */}
      {showSuggestionModal && aiSuggestions.length > 0 && (
        <SuggestionModal
          suggestions={aiSuggestions}
          onClose={() => setShowSuggestionModal(false)}
          onChoose={(p) => {
            setPersonalities(prev => [{ ...p, custom: false }, ...prev])
            setShowSuggestionModal(false)
            setShowList(true)
          }}
        />
      )}

      <div ref={chatEndRef} />
    </div>
  )
}
