'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '🎙️/components/ui/button'
import { Input } from '🎙️/components/ui/input' // Inputは現在使われていませんが、将来のために残すことも可能です
import {
  ArrowLeft,
  CheckIcon,
  ChevronRight,
  Loader2,
  MenuSquare,
  PenIcon,
  RefreshCw,
  FileText, // イントロ/アウトロ用アイコン
} from 'lucide-react'

// 型定義
interface Character {
  name: string
  description: string
  tone: string
}

interface Structure {
  intro: string
  sections: { title: string; description: string }[]
  outro: string
}

interface ScriptSections {
  intro: string
  sections: { title: string; content: string }[]
  outro: string
}

export default function ScriptGenerator({
  theme,
  mainCharacter,
  guestCharacter,
  structure,
  onGenerate,
  onNext,
  onBack,
}: {
  theme: string
  mainCharacter: Character | null
  guestCharacter: Character | null
  structure: Structure | null
  onGenerate: (script: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [scriptSections, setScriptSections] = useState<ScriptSections>({
    intro: '',
    sections: [],
    outro: '',
  })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)

  // スクリプトセクションから完全なスクリプトを生成
  const generateFullScript = (sections: ScriptSections) => {
    let fullScript = `## イントロ\n${sections.intro}\n\n`
    sections.sections.forEach((section, index) => {
      fullScript += `## セクション${index + 1}: ${section.title}\n${section.content}\n\n`
    })
    fullScript += `## アウトロ\n${sections.outro}`
    return fullScript.trim()
  }

  // スクリプトをセクションに分割する関数 (ベストエフォート)
  const parseScriptIntoSections = (
    scriptContent: string,
    currentStructure: Structure,
  ): ScriptSections => {
    const sections = currentStructure.sections.map(s => ({
      title: s.title,
      content: '',
    }))
    let intro = ''
    let outro = ''

    // 正規表現でタイトルをエスケープするヘルパー
    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // 1. アウトロを探す
    const outroKeywords = ['アウトロ', 'おわりに', 'まとめ']
    const outroPattern
      = new RegExp(`(##\\s*)?(${outroKeywords.join('|')})[:：]?([\\s\\S]*)`, 'i')
    const outroMatch = scriptContent.match(outroPattern)
    let scriptWithoutOutro = scriptContent
    if (outroMatch && typeof outroMatch.index !== 'undefined') {
      outro = outroMatch[3].trim()
      scriptWithoutOutro = scriptContent.substring(0, outroMatch.index).trim()
    }

    // 2. セクションを探す (後ろから検索して、セクション間の内容を抽出)
    let remainingScript = scriptWithoutOutro
    for (let i = currentStructure.sections.length - 1; i >= 0; i--) {
      const sec = currentStructure.sections[i]
      const titlePattern = escapeRegex(sec.title)
      const pattern = new RegExp(
        `(##\\s*)?セクション${
          i + 1
        }[:：]?.*?${titlePattern}([\\s\\S]*)`,
        'i',
      )
      const match = remainingScript.match(pattern)
      if (match && typeof match.index !== 'undefined') {
        sections[i].content = match[2].trim()
        remainingScript = remainingScript.substring(0, match.index).trim()
      }
    }

    // 3. 残りをイントロとする
    const introKeywords = ['イントロ', 'はじめに', '導入']
    const introPattern
      = new RegExp(`(##\\s*)?(${introKeywords.join('|')})[:：]?([\\s\\S]*)`, 'i')
    const introMatch = remainingScript.match(introPattern)
    intro = introMatch ? introMatch[3].trim() : remainingScript

    // 4. パースが不完全な場合のフォールバック
    if (
      !intro.trim()
      && !outro.trim()
      && !sections.some(s => s.content.trim())
    ) {
      console.warn('Script parsing likely failed. Displaying full script.')
      intro = scriptContent // 全体をイントロに
      outro = '（アウトロの内容をここに記述）'
      sections.forEach(
        s => (s.content = `（${s.title}のスクリプトをここに記述）`),
      )
    }

    return {
      intro: intro.trim() || '（イントロの内容をここに記述）',
      sections: sections.map((s, i) => ({
        ...s,
        content: s.content.trim() || `（${currentStructure.sections[i].title}の内容）`,
      })),
      outro: outro.trim() || '（アウトロの内容をここに記述）',
    }
  }

  // スクリプトをフェッチする関数
  const fetchScript = async () => {
    if (!theme || !mainCharacter || !structure) {
      setError('テーマ、キャラクター、構成の情報が不足しています。')
      setLoading(false)
      return
    }

    setLoading(true)
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          mainCharacter,
          guestCharacter, // guestCharacter を渡す
          structure,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          `API error: ${res.status} - ${errorData.error || res.statusText}`,
        )
      }

      const data = await res.json()

      if (data && data.script) {
        const parsed = parseScriptIntoSections(data.script, structure)
        setScriptSections(parsed)
        onGenerate(generateFullScript(parsed)) // 完全なスクリプトを親に渡す
      }
      else {
        throw new Error('APIからスクリプトが返されませんでした。')
      }
    }
    catch (err) {
      console.error('Error fetching/generating script:', err)
      setError(
        `スクリプトの生成または取得中にエラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      )
      // エラー時もデフォルト構造を表示する
      setScriptSections({
          intro: '（エラーが発生しました。イントロを記述してください）',
          sections: structure.sections.map(s => ({ title: s.title, content: `（${s.title}の内容を記述してください）`})),
          outro: '（エラーが発生しました。アウトロを記述してください）'
      })
    }
    finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  // 初回ロード時にスクリプトをフェッチ
  useEffect(() => {
    fetchScript()
  }, [theme, mainCharacter, guestCharacter, structure])

  // スクリプトセクションを更新
  const updateScriptSection = (field: 'intro' | 'outro', value: string) => {
    setScriptSections((prev) => {
      const newSections = { ...prev, [field]: value }
      onGenerate(generateFullScript(newSections))
      return newSections
    })
  }

  // セクションを更新
  const updateSection = (index: number, content: string) => {
    setScriptSections((prev) => {
      const newSectionsList = [...prev.sections]
      if (newSectionsList[index]) {
        newSectionsList[index] = { ...newSectionsList[index], content }
      }
      const newScriptSections = { ...prev, sections: newSectionsList }
      onGenerate(generateFullScript(newScriptSections))
      return newScriptSections
    })
  }

  // 再生成ボタンのハンドラー
  const handleRegenerateScript = () => {
    fetchScript()
  }

  // サブホスト名を取得
  const coHostName = guestCharacter ? guestCharacter.name : 'ユウキ'

  return (
    <div className={`flex flex-col overflow-hidden items-center w-full h-screen bg-[#0E0B16]`}>
    {/* テーマ名表示（上部） */}
    <div className="w-full py-5 flex items-center justify-center">
      {/* アイコン例: テーマ名に応じて画像を出し分けたい場合はここで */}
      <div className="mb-2 flex items-center justify-center">
        <img src="/lama.png" alt="テーマアイコン" className="w-8 h-8 inline-block align-middle mr-2" />
        <span className="text-gray-100 text-base font-bold">{theme}</span>
      </div>
    </div>

    <div className="flex items-center mb-2 px-8 justify-between w-full gap-3">
      
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={26} />
        </button>
        <p className="text-white font-black text-xl text-center">
          原稿を考える
        </p>
     
      <div className="flex items-center">
        <Button
          variant="outline"
          className='rounded-full w-8 h-8'
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? <CheckIcon/> : <PenIcon/>}
        </Button>
      </div>
    </div>

      {/* エラー表示 */}
      {error && (
        <div className="text-red-500 bg-red-900/30 border border-red-500/50 p-3 rounded-md mb-4 w-full max-w-2xl">
          {error}
        </div>
      )}

      {/* スクリプト表示・編集 */}
      {!(loading || generating) && scriptSections.intro && (
        <div className="w-full max-w-2xl overflow-y-auto flex-1 px-4">
          <div className="p-6 pb-32">
            <div className="space-y-4">
              <ScriptCard
                title="イントロ"
                content={scriptSections.intro}
                editMode={editMode}
                onContentChange={value => updateScriptSection('intro', value)}
              />
              {scriptSections.sections.map((section, index) => (
                <ScriptCard
                  key={index}
                  title={`セクション ${index + 1}: ${section.title}`}
                  content={section.content}
                  editMode={editMode}
                  onContentChange={value => updateSection(index, value)}
                  isSection={true}
                />
              ))}
              <ScriptCard
                title="アウトロ"
                content={scriptSections.outro}
                editMode={editMode}
                onContentChange={value => updateScriptSection('outro', value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {(loading || generating) && (
        <div className="flex-1 flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin mr-3 text-white" />
          <span className="text-gray-400 text-lg">
            {generating ? '台本を生成中...' : 'データを読み込み中...'}
          </span>
        </div>
      )}

      {/* 決定ボタン */}
      {!loading && !generating && (
        <div
          className="fixed bottom-8 left-1/2 border-white border-1 border-double -translate-x-1/2 w-[280px] h-[60px] flex items-center justify-center px-8 rounded-full z-20"
          style={{
            background: 'rgba(255,255,255,0.65)',
            boxShadow:
              '0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.25) inset',
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
            className="font-bold text-lg px-8 py-2 rounded-full transition text-gray-900 hover:text-black"
            onClick={onNext}
            disabled={
              !scriptSections.intro
              || scriptSections.sections.length === 0
              || !scriptSections.outro
            }
          >
            決定
          </button>
        </div>
      )}
    </div>
  )
}

// 各スクリプト要素を表示するカードコンポーネント
interface ScriptCardProps {
  title: string
  content: string
  editMode: boolean
  onContentChange: (value: string) => void
  isSection?: boolean
}

const ScriptCard: React.FC<ScriptCardProps> = ({
  title,
  content,
  editMode,
  onContentChange,
  isSection = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isSection) // セクション以外はデフォルトで展開
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (editMode && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [content, editMode, isExpanded]) // isExpanded も依存関係に追加

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-white/20 text-white">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 flex items-center justify-center text-gray-300">
            {isSection ? <MenuSquare size={20} /> : <FileText size={20} />}
          </div>
          <h4 className="font-semibold text-gray-100 text-lg">{title}</h4>
        </div>
        <button
          className="text-gray-300 hover:text-white ml-2 p-1 rounded-full"
          aria-label={isExpanded ? '折りたたむ' : '展開する'}
        >
          <ChevronRight
            size={22}
            className={`${
              isExpanded ? 'transform rotate-90' : ''
            } transition-transform duration-200`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pl-9">
          {editMode ? (
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={e => onContentChange(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md text-sm bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-hidden"
              placeholder={`${title}の台本内容...`}
            />
          ) : (
            <div className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap bg-gray-800/30 p-4 rounded-md">
              {content || (
                <span className="text-gray-500">内容がありません...</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}