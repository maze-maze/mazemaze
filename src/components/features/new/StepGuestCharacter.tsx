/* eslint-disable style/max-statements-per-line */
/* eslint-disable no-cond-assign */
/* eslint-disable unused-imports/no-unused-vars */
'use client'
import { Button } from '🎙️/components/ui/button'
import { useChat } from 'ai/react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  ArrowLeft,
  ArrowLeftCircle,
  Info,
  Loader2,
  PlayIcon,
  User,
  UserCircle2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// personalities型を拡張
interface Personality {
  name: string
  description: string
  tone: string
  custom?: boolean
  self?: boolean
}

export default function GuestCharacterSelector({
  theme,
  gradient,
  onSelect,
  onNext,
  onBack,
  mainSelfSelected = false,
}: {
  theme: string
  gradient?: string
  onSelect: (personality: Personality) => void
  onNext: () => void
  onBack: () => void
  mainSelfSelected?: boolean
}) {
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [loading, setLoading] = useState(true)
  const [customPersonality, setCustomPersonality] = useState({
    name: '',
    description: '',
    tone: '',
  })
  const [selected, setSelected] = useState<Personality | null>(null)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null,
  )
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{ name: string, description: string, tone: string }>
  >([])

  // 一覧表示状態を管理する状態変数を追加
  const [showList, setShowList] = useState(true)
  // チャット表示状態を明示的に管理
  const [showChat, setShowChat] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // useChat hook from AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: '/api/character-chat',
    body: {
      theme,
    },
    onFinish: (message) => {
      // Scroll to bottom when message is complete
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

      // Check if this is an AI response providing personality suggestions
      if (message.role === 'assistant' && messages.length <= 2) {
        // Extract personality suggestions using regex
        const personalityRegex
          = /\*\*候補\d+: ([^*]+)\*\* - 説明: ([^-]+) - トーン: ([^\n]+)(?=\n\n|\n\*\*|$)/g
        let match
        const extractedSuggestions: Array<{
          name: string
          description: string
          tone: string
        }> = []

        const content = message.content
        while ((match = personalityRegex.exec(content)) !== null) {
          if (match.length >= 4) {
            extractedSuggestions.push({
              name: match[1].trim(),
              description: match[2].trim(),
              tone: match[3].trim(),
            })
          }
        }

        // If we found suggestions, show them and update state
        if (extractedSuggestions.length > 0) {
          setPersonalities(extractedSuggestions.map(personality => ({
            ...personality,
            custom: false,
          })))
          setLoading(false)
          setAiSuggestions(extractedSuggestions)
          setShowSuggestionModal(true)
        }
      }
    },
  })

  // 初回ロード時に自動的にAIにパーソナリティの提案を依頼
  useEffect(() => {
    // APIからパーソナリティの候補を取得
    const fetchCharacters = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme }),
        })

        if (!res.ok) {
          throw new Error('Failed to fetch characters')
        }

        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setPersonalities(data)
          setLoading(false)
        }
        else {
          // APIから取得できなかった場合は、AIに提案を依頼
          handleSubmit(new Event('submit') as any, {
            data: {
              prompt: `テーマ「${theme}」に合うポッドキャストのパーソナリティを3つ提案してください`,
            },
          })
        }
      }
      catch (err) {
        console.error('Error fetching characters:', err)
        // エラー時もAIに提案を依頼
        handleSubmit(new Event('submit') as any, {
          data: {
            prompt: `テーマ「${theme}」に合うポッドキャストのパーソナリティを3つ提案してください`,
          },
        })
      }
    }

    fetchCharacters()
  }, [theme])

  // メッセージが存在する場合にチャット表示状態を同期する
  useEffect(() => {
    if (messages.length > 1) {
      setShowChat(true)
    }
  }, [messages])

  // パーソナリティカードを選択したとき
  const handleSelect = (personality: Personality) => {
    setSelected(personality)
    setCustomPersonality(personality)
    onSelect(personality)
    // 選択時に詳細表示に切り替え
    setShowList(false)
    // チャット表示を閉じる
    setShowChat(false)
  }

  // カスタム入力モードで保存ボタンを押したとき
  const handleSaveCustom = () => {
    if (!customPersonality.name.trim())
      return

    const newPersonality = {
      name: customPersonality.name,
      description: customPersonality.description || '特に指定なし',
      tone: customPersonality.tone || '自然な会話調',
      custom: true,
    }

    setSelected(newPersonality)
    onSelect(newPersonality)
    setEditMode(false)
    // 保存したら詳細表示に切り替え
    setShowList(false)
    // チャット表示を閉じる
    setShowChat(false)
  }

  // チャットで質問を送信
  const submitChatMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim())
      return

    // Look for specific keywords that indicate user wants to proceed
    const userInput = input.toLowerCase()
    const proceedKeywords = [
      'このキャラクターで',
      'これで',
      '決定',
      '次へ',
      '進む',
      '確定',
      'ok',
      'good',
      'いいね',
      '続ける',
      '採用',
      '使う',
      '決める',
      'いいと思う',
      '選ぶ',
      'セレクト',
      'オッケー',
    ]

    const wantsToChoose = proceedKeywords.some(keyword =>
      userInput.includes(keyword),
    )

    // If the user seems to be confirming a character choice and we have a selected character
    if (selected && messages.length > 0 && wantsToChoose) {
      // Add a small delay before proceeding to make the flow feel natural
      setTimeout(() => {
        handleSubmit(e)
        setTimeout(() => onNext(), 800)
      }, 400)
    }
    else {
      // Regular submission
      handleSubmit(e)
    }
  }

  // チャットモードと一覧表示モードを切り替える
  const toggleChatMode = () => {
    if (showChat) {
      // チャットからカード表示に戻る
      setShowChat(false)
      if (personalities.length === 0) {
        // パーソナリティが一つもない場合は提案を求める
        setMessages([messages[0]])
        handleSubmit(new Event('submit') as any, {
          data: {
            prompt: `テーマ「${theme}」に合うポッドキャストのパーソナリティを3つ提案してください`,
          },
        })
      }
    }
    else {
      // カード表示からチャットに切り替え
      setShowChat(true)
      setShowList(true) // 一覧表示に戻す
      if (messages.length <= 1) {
        handleSubmit(new Event('submit') as any, {
          data: {
            prompt: `テーマ「${theme}」に合うポッドキャストのパーソナリティについて相談したいです。どんな特徴を持つパーソナリティが良いでしょうか？`,
          },
        })
      }
    }
  }

  // Embla Carousel用
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center'})
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [infoModal, setInfoModal] = useState<{ open: boolean, personality: Personality | null }>({ open: false, personality: null })

  // 初期表示をAI提案1件目にする（mainSelfSelectedによってインデックスが変わる）
  useEffect(() => {
    if (emblaApi) {
      const initialIndex = mainSelfSelected ? 0 : 1 // 自分カードがない場合は0、ある場合は1
      if (personalities.length > 0) {
        emblaApi.scrollTo(initialIndex)
        setSelectedIndex(initialIndex)
      }
    }
  }, [emblaApi, personalities.length, mainSelfSelected]) // mainSelfSelected を依存に追加

  // Emblaのスライド変更時にインデックスを更新
  useEffect(() => {
    if (!emblaApi)
      return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  // オートプレイ用タイマー
  useEffect(() => {
    if (!emblaApi || personalities.length === 0)
      return // personalitiesがないとAI提案がないためオートプレイしない
    let stopped = false
    let timer: NodeJS.Timeout | null = null
    const autoplay = () => {
      if (stopped)
        return
      timer = setTimeout(() => {
        if (!emblaApi)
          return
        const slideCount = personalities.length + (!mainSelfSelected ? 1 : 0)
        const nextIndex = (emblaApi.selectedScrollSnap() + 1) % slideCount
        emblaApi.scrollTo(nextIndex)
      }, 3000)
    }
    autoplay()
    emblaApi.on('select', () => {
      stopped = true
      if (timer)
        clearTimeout(timer)
    })
    return () => {
      stopped = true
      if (timer)
        clearTimeout(timer)
    }
  }, [emblaApi, personalities.length, mainSelfSelected])

  // personalities配列の前に「自分」カードを追加
  const selfCard = { name: '自分', description: 'あなた自身がパーソナリティとして参加します', tone: '自由', self: true } as Personality

  return (
    <div className={`flex flex-col overflow-hidden  items-center w-full min-h-screen h-full ${gradient || ''}`}>
      {/* テーマ名表示（上部） */}

      <div className="w-full py-5 flex items-center justify-center">

        {/* アイコン例: テーマ名に応じて画像を出し分けたい場合はここで */}
        <div className="mb-2 flex items-center justify-center">
          <img src="/lama.png" alt="テーマアイコン" className="w-8 h-8 inline-block align-middle mr-2" />
          <span className="text-gray-100 text-base font-bold">{theme}</span>
        </div>
      </div>

      <div className="flex items-center justify-center w-full gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={26} />

        </button>
        <p className="text-white font-black text-xl text-center">
        {loading ? "ゲストパーソナリティーを生成中...":"ゲストパーソナリティーを選ぶ"} 
        </p>
      </div>

      {/* パーソナリティ提案モーダル */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-medium mb-4">
              AIからのパーソナリティ提案
            </h3>
            <p className="text-gray-600 mb-4">
              以下のパーソナリティが提案されました。選択するか、後でチャットでさらに相談できます。
            </p>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {aiSuggestions.map((personality, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedSuggestion(index)
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedSuggestion === index
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary/40'
                  }`}
                >
                  <h4 className="font-medium">{personality.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {personality.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                後で選ぶ
              </button>
              <button
                onClick={() => {
                  if (selectedSuggestion !== null) {
                    handleSelect(aiSuggestions[selectedSuggestion])
                    setShowSuggestionModal(false)
                  }
                }}
                disabled={selectedSuggestion === null}
                className={`px-4 py-2 rounded-lg ${
                  selectedSuggestion !== null
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                このパーソナリティを選択
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AIテーマ表示エリア */}
      {/* テーマ選択用のスワイプUI部分は削除 */}

      {/* 選択済みパーソナリティ表示 */}
      {selected && !editMode && !showList && !showChat && !loading &&  (
        <div className="w-full max-w-md mb-8 bg-white rounded-xl  overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <UserCircle2 className="text-primary h-12 w-12 mr-4" />
              <div>
                <h3 className="text-xl font-bold">{selected.name}</h3>
                <p className="text-sm text-gray-500">選択中のパーソナリティ</p>
              </div>
            </div>
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">説明:</h4>
              <p className="text-sm text-gray-600">{selected.description}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                トーン:
              </h4>
              <p className="text-sm text-gray-600">{selected.tone}</p>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditMode(true)
                  setCustomPersonality(selected)
                }}
              >
                編集
              </Button>

              {/* 一覧に戻るボタンを追加 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowList(true)}
                className="flex items-center"
              >
                <ArrowLeftCircle size={16} className="mr-1" />
                一覧に戻る
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* パーソナリティカード一覧（スワイプ） */}
      {(!selected || showList) && !editMode && !showChat && !loading && (
        <div className="w-full max-w-xl rounded-xl mt-8 overflow-visible">
          <div className="p-4">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex gap-4">
                {[...(!mainSelfSelected ? [selfCard] : []), ...personalities,
                ].map((personality, idx) => (
                  <div
                    key={idx}
                    className={`embla__slide flex-shrink-0 p-4 gap-3 rounded-lg flex flex-col items-center justify-center text-center transition aspect-3/5.5 w-60 relative mx-2 
                      ${selectedIndex === idx ? 'scale-110 z-10 bg-[#0E0B16]' : 'scale-95 opacity-80 bg-[#0E0B16]'}
                      ${personality.custom ? 'border-2 border-dashed border-gray-400 text-gray-500 hover:text-primary' : ''}
                      ${personality.self ? 'border-2 border-primary text-primary' : ''}
                    `}
                    style={{ boxShadow: selectedIndex === idx ? '0 4px 24px rgba(0,0,0,0.10)' : undefined }}
                    onClick={() => {
                      if (personality.custom) {
                        setEditMode(true)
                        setCustomPersonality({ name: '', description: '', tone: '' })
                      }
                      else {
                        setSelected(personality)
                      }
                    }}
                  >
                    {personality.self
                      ? (
                          <>
                            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center mb-2 bg-primary/10">
                              <User className=" text-white" size={28} />
                            </div>
                            <span className=" font-bold mb-1 text-white">{personality.name}</span>
                            <p className="text-xs  line-clamp-2 mb-1 text-gray-200">{personality.description}</p>

                          </>
                        )
                      : (
                          <>
                            <div className="absolute top-2 right-2">
                              <button
                                type="button"
                                className=""
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setInfoModal({ open: true, personality })
                                }}
                              >
                                <Info className="text-white" size={22} />
                              </button>
                            </div>
                            <img src="/character.png" />
                            <h3 className="font-bold text-white mb-1">{personality.name}</h3>
                            <p className="text-xs text-gray-200 line-clamp-2 mb-1">{personality.description}</p>
                            <p className="text-xs text-gray-200 line-clamp-2">
                              トーン:
                              {personality.tone}
                            </p>
                            <button
                              type="button"
                              className="mt-4"
                              onClick={(e) => {
                                e.stopPropagation()
                                setInfoModal({ open: true, personality })
                              }}
                            >
                              <PlayIcon className="text-white" size={22} />
                            </button>
                          </>
                        )}
                  </div>
                ))}
              </div>
            </div>
            {/* ページネーション */}
            <div className="w-full mt-8 flex justify-center">
              <div className="flex justify-center gap-2 w-fit px-3 py-2 rounded-full opacity-40 bg-[#BFBFBF]">
                {[...(!mainSelfSelected ? [selfCard] : []), ...personalities,
                ].map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${selectedIndex === idx ? 'bg-primary' : 'bg-gray-500'}`}
                    onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            {/* 決定ボタン */}
            <div
              className="absolute bottom-8 left-1/2 border-white border-1 border-double -translate-x-1/2 w-[280px] h-[60px] flex items-center justify-center px-8 rounded-full z-20"
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
                className="font-bold text-lg px-8 py-2 rounded-full  transition"
                disabled={mainSelfSelected ? !personalities[selectedIndex] : selectedIndex === 0}
                onClick={() => {
                  if (!mainSelfSelected && selectedIndex === 0) {
                    // 自分カードを選択
                    handleSelect(selfCard)
                    onNext()
                  }
                  else {
                    // AI提案カードを選択
                    // personalitiesのindexは mainSelfSelectedならselectedIndex、そうでなければ selectedIndex - 1
                    const selectedPersonality = mainSelfSelected ? personalities[selectedIndex] : personalities[selectedIndex - 1]
                    if (selectedPersonality) {
                      handleSelect(selectedPersonality)
                      onNext()
                    }
                  }
                }}
              >
                決定
              </button>
            </div>
          </div>

        </div>
      )}
        {/* ローディング表示 */}
        {loading && (
        <div className="flex-1 flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin mr-3 text-white" />
        </div>
      )}
      {/* 詳細情報モーダル */}
      {infoModal.open && infoModal.personality && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInfoModal({ open: false, personality: null })} />
          <div className="relative w-full max-w-md bg-[#0E0B16] rounded-t-2xl shadow-2xl p-6 animate-slideup">
            <button className="absolute top-3 right-4 text-white  text-2xl" onClick={() => setInfoModal({ open: false, personality: null })}>
              ×
            </button>
            <h3 className="text-xl font-bold text-white mb-2">{infoModal.personality.name}</h3>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-100">説明:</span>
              <p className="text-sm text-gray-200 mt-1">{infoModal.personality.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-100">トーン:</span>
              <p className="text-sm text-gray-200 mt-1">{infoModal.personality.tone}</p>
            </div>
          </div>

        </div>
      )}
      <style jsx>
        {`
            .animate-slideup {
              animation: slideup-modal 0.32s cubic-bezier(.4,1.4,.6,1) both;
            }
            @keyframes slideup-modal {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}
      </style>
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
