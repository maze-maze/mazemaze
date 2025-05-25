/* eslint-disable no-cond-assign */
/* eslint-disable regexp/no-super-linear-backtracking */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
'use client'
import { Button } from '🎙️/components/ui/button'
import { Input } from '🎙️/components/ui/input'
import { useChat } from 'ai/react'
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  MenuSquare,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function StructureSelector({
  theme,
  character,
  onSelect,
  onNext,
  onBack,
}: {
  theme: string
  character: {
    name: string
    description: string
    tone: string
  } | null
  onSelect: (structure: {
    intro: string
    sections: string[]
    outro: string
  }) => void
  onNext: () => void
  onBack: () => void
}) {
  const [structure, setStructure] = useState<{
    intro: string
    sections: string[]
    outro: string
  }>({
    intro: '',
    sections: [],
    outro: '',
  })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [autoGenerate, setAutoGenerate] = useState(true)

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
    api: '/api/structure-chat',
    body: {
      theme,
      character: character ? JSON.stringify(character) : null,
    },
    onFinish: (message) => {
      // Scroll to bottom when message is complete
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

      // Check if this is an AI response providing structure suggestions
      if (message.role === 'assistant' && messages.length <= 2) {
        // Try to extract structure suggestions
        try {
          extractStructureFromMessage(message.content)
        }
        catch (err) {
          console.error('Failed to extract structure', err)
        }
      }
    },
  })

  // 初回ロード時に自動的にAIに構成の提案を依頼
  useEffect(() => {
    // APIから構成の候補を取得
    const fetchStructure = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme,
            character,
          }),
        })

        // Check if the API request was successful
        if (!res.ok) {
          console.error(`API error: ${res.status} ${res.statusText}`)
          // Instead of throwing an error, we'll fall back to AI generation
          // Trigger AI to generate structure suggestions
          if (autoGenerate) {
            handleSubmit(new Event('submit') as any, {
              data: {
                prompt: `テーマ「${theme}」のポッドキャストの構成を提案してください。イントロ、${3}～${5}個のセクション、アウトロを含めてください。`,
              },
            })
          }
          setLoading(false)
          return // Exit early instead of throwing
        }

        const data = await res.json()

        if (data && data.intro && Array.isArray(data.sections) && data.outro) {
          setStructure(data)
          onSelect(data)
          setLoading(false)
        }
        else {
          // APIから適切な構造が取得できなかった場合は、AIに提案を依頼
          if (autoGenerate) {
            handleSubmit(new Event('submit') as any, {
              data: {
                prompt: `テーマ「${theme}」のポッドキャストの構成を提案してください。イントロ、${3}～${5}個のセクション、アウトロを含めてください。`,
              },
            })
          }
          setLoading(false)
        }
      }
      catch (err) {
        console.error('Error fetching structure:', err)
        // エラー時もAIに提案を依頼
        if (autoGenerate) {
          handleSubmit(new Event('submit') as any, {
            data: {
              prompt: `テーマ「${theme}」のポッドキャストの構成を提案してください。イントロ、${3}～${5}個のセクション、アウトロを含めてください。`,
            },
          })
        }
        setLoading(false)
      }
    }

    fetchStructure()
  }, [theme, character, autoGenerate])

  // メッセージの内容から構成を抽出する関数
  const extractStructureFromMessage = (content: string) => {
    // イントロを抽出
    const introMatch = content.match(
      /イントロ[:：]\s*([\s\S]*?)(?=\n\n|\n##|\n\*\*セクション|$)/,
    )
    const intro = introMatch ? introMatch[1].trim() : ''

    // セクションを抽出 (複数の抽出パターンを試す)
    let sections: string[] = []

    // パターン1: **セクション1: タイトル** 形式
    const sectionPattern1 = /\*\*セクション\d+[:：]?\s*(.*?)\*\*/g
    let sectionMatch1
    const sectionsFromPattern1: string[] = []
    while ((sectionMatch1 = sectionPattern1.exec(content)) !== null) {
      if (sectionMatch1[1]) {
        sectionsFromPattern1.push(sectionMatch1[1].trim())
      }
    }

    // パターン2: ## セクション1: タイトル 形式
    const sectionPattern2 = /##\s*セクション\d+[:：]?\s*(.*)(?=\n|$)/g
    let sectionMatch2
    const sectionsFromPattern2: string[] = []
    while ((sectionMatch2 = sectionPattern2.exec(content)) !== null) {
      if (sectionMatch2[1]) {
        sectionsFromPattern2.push(sectionMatch2[1].trim())
      }
    }

    // パターン3: 1. タイトル 形式
    const sectionPattern3
      = /\d+\.\s*(.*)(?=\n\d+\.|\n\n|\n##|\n\*\*アウトロ|$)/g
    let sectionMatch3
    const sectionsFromPattern3: string[] = []
    while ((sectionMatch3 = sectionPattern3.exec(content)) !== null) {
      if (sectionMatch3[1]) {
        sectionsFromPattern3.push(sectionMatch3[1].trim())
      }
    }

    // 最も多くのセクションを抽出できたパターンを採用
    if (
      sectionsFromPattern1.length >= sectionsFromPattern2.length
      && sectionsFromPattern1.length >= sectionsFromPattern3.length
    ) {
      sections = sectionsFromPattern1
    }
    else if (sectionsFromPattern2.length >= sectionsFromPattern3.length) {
      sections = sectionsFromPattern2
    }
    else {
      sections = sectionsFromPattern3
    }

    // アウトロを抽出
    const outroMatch = content.match(/アウトロ[:：]\s*([\s\S]*?)(?=\n\n|$)/)
    const outro = outroMatch ? outroMatch[1].trim() : ''

    // セクションが空の場合は、最低3つのダミーセクションを作成
    if (sections.length === 0) {
      sections = [
        'テーマの背景と重要性',
        '主要な論点とディスカッション',
        'まとめと今後の展望',
      ]
    }

    // 構造を設定
    const newStructure = {
      intro: intro || `テーマ「${theme}」についての紹介`,
      sections,
      outro: outro || 'まとめと次回の予告',
    }

    setStructure(newStructure)
    onSelect(newStructure)
    setLoading(false)
  }

  // 構造を更新する関数
  const updateStructure = (field: 'intro' | 'outro', value: string) => {
    const newStructure = { ...structure, [field]: value }
    setStructure(newStructure)
    onSelect(newStructure)
  }

  // セクションを更新する関数
  const updateSection = (index: number, value: string) => {
    const newSections = [...structure.sections]
    newSections[index] = value
    const newStructure = { ...structure, sections: newSections }
    setStructure(newStructure)
    onSelect(newStructure)
  }

  // セクションを追加する関数
  const addSection = () => {
    const newSections = [...structure.sections, '新しいセクション']
    const newStructure = { ...structure, sections: newSections }
    setStructure(newStructure)
    onSelect(newStructure)
  }

  // セクションを削除する関数
  const removeSection = (index: number) => {
    const newSections = structure.sections.filter((_, i) => i !== index)
    const newStructure = { ...structure, sections: newSections }
    setStructure(newStructure)
    onSelect(newStructure)
  }

  // チャットで質問を送信
  const submitChatMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim())
      return
    handleSubmit(e)
  }

  // チャットが表示されているかどうか
  const showChat = messages.length > 1

  // 再生成ボタンのクリックハンドラー
  const handleRegenerateStructure = () => {
    setLoading(true)
    handleSubmit(new Event('submit') as any, {
      data: {
        prompt: `テーマ「${theme}」のポッドキャストの構成を提案してください。イントロ、${3}～${5}個のセクション、アウトロを含めてください。${
          character
            ? `キャラクター「${character.name}」の個性に合わせた内容にしてください。`
            : ''
        }`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full flex justify-between items-center px-4 md:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-1" size={16} />
          パーソナリティ選択に戻る
        </button>

        {structure
          && structure.intro
          && structure.sections.length > 0
          && structure.outro && (
          <Button onClick={onNext} className="flex items-center" size="sm">
            次へ進む
            <ChevronRight className="ml-1" size={16} />
          </Button>
        )}
      </div>

      <h1 className="text-3xl font-serif text-center mt-6 mb-2">
        ポッドキャストの構成
      </h1>
      <p className="mb-6 text-gray-500 text-center max-w-md px-4">
        テーマ「
        {theme}
        」のポッドキャストの構成を決めましょう。
        {character && `「${character.name}」の個性を活かした構成にします。`}
      </p>

      {/* 構成表示・編集 */}
      {!loading && structure && (
        <div className="w-full max-w-2xl mb-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <MenuSquare className="text-primary h-6 w-6 mr-3" />
              <div>
                <h3 className="text-xl font-bold">ポッドキャスト構成</h3>
                <p className="text-sm text-gray-500">
                  セクションの順序はドラッグで変更できます
                </p>
              </div>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? '表示モード' : '編集モード'}
                </Button>
              </div>
            </div>

            {/* 構成内容 */}
            <div className="space-y-4">
              {/* イントロ */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-2">イントロ</h4>
                {editMode
                  ? (
                      <textarea
                        value={structure.intro}
                        onChange={e => updateStructure('intro', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    )
                  : (
                      <p className="text-gray-700">{structure.intro}</p>
                    )}
              </div>

              {/* セクション */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-primary">セクション</h4>
                  {editMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addSection}
                      className="flex items-center text-gray-600 hover:text-primary"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      セクション追加
                    </Button>
                  )}
                </div>

                {structure.sections.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center border border-gray-200 rounded-lg p-3"
                  >
                    <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      {editMode
                        ? (
                            <Input
                              value={section}
                              onChange={e => updateSection(index, e.target.value)}
                              className="w-full"
                            />
                          )
                        : (
                            <p className="text-gray-700">{section}</p>
                          )}
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                        disabled={structure.sections.length <= 1}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* アウトロ */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-2">アウトロ</h4>
                {editMode
                  ? (
                      <textarea
                        value={structure.outro}
                        onChange={e => updateStructure('outro', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    )
                  : (
                      <p className="text-gray-700">{structure.outro}</p>
                    )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleRegenerateStructure}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                構成を再生成
              </Button>

              <Button
                onClick={onNext}
                disabled={
                  !structure.intro
                  || structure.sections.length === 0
                  || !structure.outro
                }
              >
                この構成で次へ進む
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin mr-2" />
          <span className="text-gray-500">構成を生成中...</span>
        </div>
      )}

      {/* チャットUI */}
      {showChat && !editMode && (
        <div className="w-full max-w-md flex flex-col gap-2 mb-8 rounded-xl p-4">
          {messages.slice(1).map(message => (
            <div
              key={message.id}
              className={`whitespace-pre-wrap ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-primary/10 text-primary'
                } max-w-[85%]`}
              >
                {message.role === 'assistant'
                  ? (
                      <div className="markdown prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )
                  : (
                      message.content
                    )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left text-primary">
              <span className="inline-block px-3 py-2 rounded-2xl bg-primary/10 text-primary">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* 入力欄 - チャット時のみ表示 */}
      {showChat && !editMode && (
        <div className="w-full max-w-md fixed bottom-8 left-1/2 -translate-x-1/2">
          <form
            onSubmit={submitChatMessage}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow"
          >
            <Input
              className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
              placeholder="構成について質問・相談できます"
              value={input}
              onChange={handleInputChange}
              style={{
                boxShadow: 'none',
                border: 'none',
              }}
            />
            <button
              type="submit"
              className="ml-2 text-gray-400 hover:text-primary transition-colors"
              aria-label="send chat"
              disabled={isLoading || !input.trim()}
            >
              💬
            </button>
          </form>

          {messages.length > 2 && !structure.intro && (
            <div className="mt-2 flex justify-center">
              <button
                onClick={() => {
                  // Try to extract structure from the conversation
                  const lastAiMessage = [...messages]
                    .reverse()
                    .find(m => m.role === 'assistant')
                  if (lastAiMessage) {
                    extractStructureFromMessage(lastAiMessage.content)
                  }
                }}
                className="text-sm text-primary hover:underline flex items-center"
              >
                AIの提案から構成を作成
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* チャット切り替えボタン */}
      <Button
        variant={showChat ? 'outline' : 'default'}
        className="mt-4"
        onClick={() => {
          if (!showChat) {
            // AIに構成について相談
            handleSubmit(new Event('submit') as any, {
              data: {
                prompt: `テーマ「${theme}」のポッドキャストの構成について相談したいです。どのような構成がおすすめですか？`,
              },
            })
          }
        }}
      >
        {showChat ? '構成エディタを表示' : 'AIと構成について相談する'}
      </Button>
    </div>
  )
}
