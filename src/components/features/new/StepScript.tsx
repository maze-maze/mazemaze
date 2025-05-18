'use client'
import { useChat } from 'ai/react'
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
  User,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export default function ScriptGenerator({
  theme,
  character,
  structure,
  onGenerate,
  onNext,
  onBack,
}: {
  theme: string
  character: {
    name: string
    description: string
    tone: string
  } | null
  structure: {
    intro: string
    sections: string[]
    outro: string
  } | null
  onGenerate: (script: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [script, setScript] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [dialogueMode, setDialogueMode] = useState(true) // デフォルトで対話形式
  const [coHostName, setCoHostName] = useState('ユウキ') // デフォルトの第二ホスト名

  const chatEndRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLDivElement>(null)

  // useChat hook from AI SDK
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: '/api/script-chat',
    body: {
      theme,
      character: character ? JSON.stringify(character) : null,
      structure: structure ? JSON.stringify(structure) : null,
      dialogueMode,
      coHostName,
    },
    onFinish: (message) => {
      // Scroll to bottom when message is complete
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

      // Check if this is an AI response providing a script
      if (message.role === 'assistant' && messages.length <= 2) {
        // AI response contains the script
        // only update if we don't already have a script
        if (!script) {
          const scriptContent = message.content
          setScript(scriptContent)
          onGenerate(scriptContent)
        }
        setLoading(false)
        setGenerating(false)
      }
    },
  })

  // 初回ロード時に自動的にスクリプト生成
  useEffect(() => {
    // APIからスクリプトを取得
    const fetchScript = async () => {
      if (!theme || !character || !structure) {
        setError('必要な情報が不足しています')
        setLoading(false)
        return
      }

      // 渡すデータをログに出力
      console.log('Fetching script with data:', {
        theme,
        character:
          typeof character === 'string' ? character : JSON.stringify(character),
        structure:
          typeof structure === 'string' ? structure : JSON.stringify(structure),
        dialogueMode,
        coHostName,
      })

      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme,
            character,
            structure,
            dialogueMode,
            coHostName,
          }),
        })

        if (!res.ok) {
          console.error(`API error: ${res.status} ${res.statusText}`)
          throw new Error(
            `Failed to fetch script: ${res.status} ${res.statusText}`,
          )
        }

        const data = await res.json()
        console.log('API response:', data)

        if (data && data.script) {
          console.log('Script received, length:', data.script.length)
          setScript(data.script)
          onGenerate(data.script)
          setLoading(false)
        }
        else if (data && data.error) {
          console.error('API returned error:', data.error)
          // APIからエラーが返された場合は、AIに生成を依頼
          if (autoGenerate) {
            generateScript()
          }
          else {
            setError(`エラー: ${data.error}`)
            setLoading(false)
          }
        }
        else {
          // APIから適切なスクリプトが取得できなかった場合は、AIに生成を依頼
          console.warn('API returned no script or error')
          if (autoGenerate) {
            generateScript()
          }
          else {
            setError('スクリプトの取得に失敗しました')
            setLoading(false)
          }
        }
      }
      catch (err) {
        console.error('Error fetching script:', err)
        // エラー時もAIに生成を依頼
        if (autoGenerate) {
          generateScript()
        }
        else {
          setError(
            `エラー: ${err instanceof Error ? err.message : String(err)}`,
          )
          setLoading(false)
        }
      }
    }

    fetchScript()
  }, [theme, character, structure, dialogueMode, coHostName])

  // スクリプトを生成する関数
  const generateScript = () => {
    if (!theme || !character || !structure) {
      setError('必要な情報が不足しています')
      return
    }

    setGenerating(true)
    setError('')

    // 構造情報をフォーマットする
    const sectionsList = structure.sections
      .map((section, index) => `${index + 1}. ${section}`)
      .join('\n')

    let promptTemplate

    if (dialogueMode) {
      // 対話形式のプロンプト
      promptTemplate = `
テーマ: ${theme}
メインホスト: ${character.name}
メインホストの説明: ${character.description}
メインホストのトーン: ${character.tone}
サブホスト: ${coHostName}
サブホストの特徴: メインホストと異なる視点や意見を持ち、質問や補足をしながら会話を進める役割

構成:
イントロ: ${structure.intro}
セクション:
${sectionsList}
アウトロ: ${structure.outro}

この情報をもとに、メインホストとサブホストの対話形式で進行する、実際のポッドキャストスクリプトを作成してください。
二人の会話が自然で、リスナーにとって分かりやすく魅力的な内容になるようにしてください。
`
    }
    else {
      // 単独ホスト形式のプロンプト
      promptTemplate = `
テーマ: ${theme}
パーソナリティ: ${character.name}
説明: ${character.description}
トーン: ${character.tone}

構成:
イントロ: ${structure.intro}
セクション:
${sectionsList}
アウトロ: ${structure.outro}

この情報をもとに、パーソナリティの特徴を反映した実際のポッドキャストスクリプトを作成してください。
スクリプトは読み上げることを前提とした台本形式で、実際に話すトーンを反映させてください。
`
    }

    // AIにスクリプト生成を依頼
    handleSubmit(new Event('submit') as any, {
      data: {
        prompt: promptTemplate,
      },
    })
  }

  // スクリプトをクリップボードにコピーする関数
  const copyToClipboard = () => {
    if (!script)
      return

    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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

  // エラーがあるかどうか
  const hasError = error !== ''

  // 対話形式を切り替える
  const toggleDialogueMode = () => {
    setDialogueMode(!dialogueMode)
    // 切り替え後に再生成
    if (script) {
      setTimeout(() => {
        generateScript()
      }, 100)
    }
  }

  // サブホスト名を変更する
  const handleCoHostNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoHostName(e.target.value)
  }

  // サブホスト名変更を適用する
  const applyCoHostNameChange = () => {
    if (script) {
      generateScript()
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full flex justify-between items-center px-4 md:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-1" size={16} />
          構成選択に戻る
        </button>

        {script && (
          <Button onClick={onNext} className="flex items-center" size="sm">
            次へ進む
            <ChevronRight className="ml-1" size={16} />
          </Button>
        )}
      </div>

      <h1 className="text-3xl font-serif text-center mt-6 mb-2">
        ポッドキャストスクリプト
      </h1>
      <p className="mb-6 text-gray-500 text-center max-w-md px-4">
        テーマ「
        {theme}
        」のポッドキャスト用スクリプトを生成しました。
        {character && `「${character.name}」の個性を反映しています。`}
      </p>

      {/* スクリプト形式選択 */}
      <div className="w-full max-w-md mb-4 flex flex-col md:flex-row justify-center items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={dialogueMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (!dialogueMode)
                toggleDialogueMode()
            }}
            className="flex items-center"
          >
            <Users size={16} className="mr-2" />
            対話形式
          </Button>
          <Button
            variant={!dialogueMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (dialogueMode)
                toggleDialogueMode()
            }}
            className="flex items-center"
          >
            <User size={16} className="mr-2" />
            単独ホスト
          </Button>
        </div>

        {dialogueMode && (
          <div className="flex items-center space-x-2">
            <Input
              value={coHostName}
              onChange={handleCoHostNameChange}
              placeholder="サブホスト名"
              className="w-32"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={applyCoHostNameChange}
              disabled={generating || !coHostName.trim()}
            >
              適用
            </Button>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {hasError && (
        <div className="w-full max-w-3xl mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={generateScript}
              disabled={generating}
              className="text-red-600 hover:text-red-800 border-red-300"
            >
              AI生成を試す
            </Button>
          </div>
        </div>
      )}

      {/* スクリプト表示 */}
      {script && !loading && !generating && (
        <div className="w-full max-w-3xl mb-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="text-primary h-6 w-6 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">スクリプト</h3>
                  <p className="text-sm text-gray-500">
                    {dialogueMode
                      ? `${character?.name}と${coHostName}の対話形式台本`
                      : '単独ホスト形式台本'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center"
                >
                  <Copy size={16} className="mr-1" />
                  {copied ? 'コピーしました' : 'コピー'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateScript}
                  className="flex items-center"
                  disabled={generating}
                >
                  <RefreshCw
                    size={16}
                    className={`mr-1 ${generating ? 'animate-spin' : ''}`}
                  />
                  再生成
                </Button>
              </div>
            </div>

            {/* スクリプト内容 */}
            <div
              ref={scriptRef}
              className="border border-gray-200 rounded-lg p-4 max-h-[60vh] overflow-y-auto whitespace-pre-line prose prose-sm max-w-none"
            >
              <ReactMarkdown>{script}</ReactMarkdown>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end mt-6">
              <Button onClick={onNext}>このスクリプトで次へ進む</Button>
            </div>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {(loading || generating) && (
        <div className="flex flex-col justify-center items-center h-64 w-full max-w-2xl">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-gray-500 mb-2">
            {generating ? 'スクリプトを生成中...' : 'データを読み込み中...'}
          </p>
          <p className="text-xs text-gray-400 max-w-sm text-center">
            良質なスクリプトを生成するには少し時間がかかります。
            {dialogueMode
              ? '二人の自然な対話形式で作成しています...'
              : 'パーソナリティのトーンと構成を考慮しながら作成しています...'}
          </p>
        </div>
      )}

      {/* チャットUI */}
      {showChat && !generating && (
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
      {showChat && !generating && (
        <div className="w-full max-w-md fixed bottom-8 left-1/2 -translate-x-1/2">
          <form
            onSubmit={submitChatMessage}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow"
          >
            <Input
              className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
              placeholder="スクリプトについて質問・相談できます"
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
        </div>
      )}

      {/* チャット切り替えボタン */}
      {!generating && script && (
        <Button
          variant={showChat ? 'outline' : 'default'}
          className="mt-4"
          onClick={() => {
            if (!showChat) {
              // AIにスクリプトについて相談
              handleSubmit(new Event('submit') as any, {
                data: {
                  prompt: `生成されたスクリプトについて質問や改善の相談をしたいです。現在のスクリプトの特徴を教えてください。`,
                },
              })
            }
          }}
        >
          {showChat ? 'スクリプトを表示' : 'AIとスクリプトについて相談する'}
        </Button>
      )}
    </div>
  )
}
