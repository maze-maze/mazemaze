'use client'

import { Button } from '🎙️/components/ui/button'
import { Input } from '🎙️/components/ui/input' // 編集モードで使用
import { Textarea } from '🎙️/components/ui/textarea' // Textarea をインポート
import {
  ArrowLeft,
  CheckIcon,
  ChevronRight,
  Loader2, // セクションアイコンとして使用
  MoveDown,
  MoveUp,
  PenIcon,
  PlusCircle, // 再生成アイコンを追加
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react' // useEffect をインポート
import React from 'react'

// 型定義
interface Character {
  name: string
  description: string
  tone: string
  self?: boolean
}

interface Structure {
  intro: string
  sections: { title: string, description: string }[]
  outro: string
}

export default function StructureSelector({
  theme,
  mainCharacter,
  guestCharacter,
  gradient,
  onSelect,
  onNext,
  onBack,
}: {
  theme: string
  mainCharacter: Character | null
  guestCharacter: Character | null
  gradient: string
  onSelect: (structure: Structure) => void
  onNext: () => void
  onBack: () => void
}) {
  const [structure, setStructure] = useState<Structure>({
    intro: '',
    sections: [],
    outro: '',
  })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState('')

  // 構成をフェッチする関数
  const fetchStructure = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          mainCharacter,
          guestCharacter,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          `API error: ${res.status} - ${errorData.error || res.statusText}`,
        )
      }

      const data = await res.json()

      if (data && data.intro && Array.isArray(data.sections) && data.outro) {
        setStructure(data)
        // onSelect(data) // <- 削除
      }
      else {
        throw new Error('APIから有効な構成が返されませんでした。')
      }
    }
    catch (err) {
      console.error('Error fetching/generating structure:', err)
      setError(
        `構成の取得または生成中にエラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      )
      // エラー時もデフォルト構造を表示
      const defaultStructure = {
        intro: `テーマ「${theme}」についての紹介`,
        sections: [
          { title: 'テーマの背景と重要性', description: 'このセクションでは、テーマの背景にある歴史や、なぜ今このテーマが重要なのかについて話します。' },
          { title: '主要な論点とディスカッション', description: 'テーマに関するいくつかの主要なポイントを取り上げ、それぞれの視点から深く掘り下げて議論します。' },
          { title: 'まとめと今後の展望', description: 'これまでの議論をまとめ、このテーマが今後どのように展開していく可能性があるかについて考察します。' },
        ],
        outro: '今回のポッドキャストのまとめと、リスナーへのメッセージ、次回の予告など。',
      }
      setStructure(defaultStructure)
      // onSelect(defaultStructure) // <- 削除
    }
    finally {
      setLoading(false)
    }
  }

  // 初回ロード時に構成をフェッチ
  useEffect(() => {
    fetchStructure()
  }, [theme, mainCharacter, guestCharacter]) // 依存関係を明記

  // *** 追加: structure が変更されたときに onSelect を呼び出す副作用フック ***
  useEffect(() => {
    // ローディング中や初期状態（空）では呼び出さない
    if (!loading && (structure.intro || structure.sections.length > 0 || structure.outro)) {
      onSelect(structure)
    }
  }, [structure, onSelect, loading]) // structure, onSelect, loading を依存配列に追加

  // 構成を更新する関数
  const updateStructure = (field: 'intro' | 'outro', value: string) => {
    setStructure(prev => ({ ...prev, [field]: value }))
    // onSelect(newStructure) // <- 削除
  }

  // セクションを更新する関数
  const updateSection = (
    index: number,
    updatedFields: { title?: string, description?: string },
  ) => {
    setStructure((prevStructure) => {
      const newSections = [...prevStructure.sections]
      if (newSections[index]) {
        newSections[index] = { ...newSections[index], ...updatedFields }
      }
      // onSelect({ ...prevStructure, sections: newSections }) // <- 削除
      return { ...prevStructure, sections: newSections }
    })
  }

  // セクションを追加する関数
  const addSection = (index: number) => {
    setStructure((prevStructure) => {
      const newSections = [...prevStructure.sections]
      newSections.splice(index, 0, {
        title: '新しいセクション',
        description: 'このセクションで話す内容...',
      })
      // onSelect({ ...prevStructure, sections: newSections }) // <- 削除
      return { ...prevStructure, sections: newSections }
    })
  }

  // セクションを削除する関数
  const removeSection = (index: number) => {
    setStructure((prevStructure) => {
      if (prevStructure.sections.length <= 1)
        return prevStructure
      const newSections = prevStructure.sections.filter((_, i) => i !== index)
      // onSelect({ ...prevStructure, sections: newSections }) // <- 削除
      return { ...prevStructure, sections: newSections }
    })
  }

  // セクションを上に移動
  const moveSectionUp = (index: number) => {
    if (index === 0)
      return
    setStructure((prevStructure) => {
      const newSections = [...prevStructure.sections]
      ;[newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ] // Swap
      // onSelect({ ...prevStructure, sections: newSections }) // <- 削除
      return { ...prevStructure, sections: newSections }
    })
  }

  // セクションを下に移動
  const moveSectionDown = (index: number) => {
    if (index === structure.sections.length - 1)
      return
    setStructure((prevStructure) => {
      const newSections = [...prevStructure.sections]
      ;[newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ] // Swap
      // onSelect({ ...prevStructure, sections: newSections }) // <- 削除
      return { ...prevStructure, sections: newSections }
    })
  }

  // 再生成ボタンのハンドラー
  const handleRegenerateStructure = () => {
    fetchStructure()
  }

  return (
    <div className="flex flex-col overflow-hidden items-center w-full h-screen bg-[#0E0B16]">
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
          構成を考える
        </p>

        <div className="flex items-center">
          <Button
            variant="outline"
            className="rounded-full w-8 h-8"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <CheckIcon /> : <PenIcon />}
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="text-red-500 bg-red-900/30 border border-red-500/50 p-3 rounded-md mb-4 w-full max-w-2xl">
          {error}
        </div>
      )}

      {/* 構成表示・編集 */}
      {!loading && structure && (
        <div className="w-full max-w-2xl overflow-y-auto flex-1 px-4">
          <div className="p-6 pb-32">
            <div className="space-y-1">
              <StructureCard
                title="イントロ"
                content={structure.intro} // イントロは content を使う
                editMode={editMode}
                onContentChange={value => updateStructure('intro', value)}
                isSection={false}
              />
              <AddSectionButton
                onClick={() => addSection(0)}
                editMode={editMode}
              />
              {structure.sections.map((section, index) => (
                <React.Fragment key={index}>
                  <StructureCard
                    title={section.title}
                    content={section.title} // セクションは title を content として渡す
                    description={section.description}
                    editMode={editMode}
                    onContentChange={value =>
                      updateSection(index, { title: value })}
                    onDescriptionChange={value =>
                      updateSection(index, { description: value })}
                    isSection={true}
                    onRemove={() => removeSection(index)}
                    canRemove={structure.sections.length > 1}
                    onMoveUp={() => moveSectionUp(index)}
                    onMoveDown={() => moveSectionDown(index)}
                    canMoveUp={index > 0}
                    canMoveDown={index < structure.sections.length - 1}
                  />
                  <AddSectionButton
                    onClick={() => addSection(index + 1)}
                    editMode={editMode}
                  />
                </React.Fragment>
              ))}
              <StructureCard
                title="アウトロ"
                content={structure.outro} // アウトロは content を使う
                editMode={editMode}
                onContentChange={value => updateStructure('outro', value)}
                isSection={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* 決定ボタン */}
      {!loading && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[60px] flex items-center justify-center px-8 rounded-full z-20"
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
              !structure.intro
              || structure.sections.length === 0
              || !structure.outro
            }
          >
            決定
          </button>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="flex-1 flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin mr-3 text-white" />
          <span className="text-gray-400 text-lg">構成を生成中...</span>
        </div>
      )}
    </div>
  )
}

// 各構成要素を表示するカードコンポーネント
interface StructureCardProps {
  title: string
  content: string
  description?: string
  editMode: boolean
  onContentChange: (value: string) => void
  onDescriptionChange?: (value: string) => void
  isSection?: boolean
  onRemove?: () => void
  canRemove?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

const StructureCard: React.FC<StructureCardProps> = ({
  title,
  content,
  description,
  editMode,
  onContentChange,
  onDescriptionChange,
  isSection = false,
  onRemove,
  canRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [isExpanded, setIsExpanded] = useState(isSection)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (editMode && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [description, content, editMode, isExpanded])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-white/20 text-white mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {' '}
          {/* flex-1 と min-w-0 で幅を確保 */}
          {isSection && (
            <div className="flex flex-col mr-3">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp || !editMode}
                className={`text-gray-400 hover:text-white ${
                  !canMoveUp || !editMode ? 'cursor-not-allowed opacity-30' : ''
                }`}
                aria-label="Move section up"
              >
                <MoveUp size={16} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown || !editMode}
                className={`text-gray-400 hover:text-white ${
                  !canMoveDown || !editMode ? 'cursor-not-allowed opacity-30' : ''
                }`}
                aria-label="Move section down"
              >
                <MoveDown size={16} />
              </button>
            </div>
          )}
          {!isSection && (
            <div className="w-6 h-6 mr-3" />
          )}

          {editMode
            ? (
                <Input
                  type="text"
                  value={content}
                  onChange={e => onContentChange(e.target.value)}
                  className="font-semibold text-gray-100 text-lg w-full bg-transparent border-b border-gray-600 focus:outline-none focus:ring-0 focus:border-white p-1 truncate"
                  placeholder={isSection ? 'セクションタイトル' : title}
                />
              )
            : (
                <h4 className="font-semibold text-gray-100 text-lg truncate">{title}</h4>
              )}
        </div>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {' '}
          {/* flex-shrink-0 を追加 */}
          {editMode && isSection && onRemove && (
            <button
              onClick={onRemove}
              disabled={!canRemove}
              className={`text-gray-400 hover:text-red-400 ${
                !canRemove ? 'cursor-not-allowed opacity-30' : ''
              }`}
              aria-label="Remove section"
            >
              <Trash2 size={16} />
            </button>
          )}
          {isSection && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-300 hover:text-white p-1 rounded-full"
              aria-label={isExpanded ? '折りたたむ' : '展開する'}
            >
              <ChevronRight
                size={22}
                className={`${
                  isExpanded ? 'transform rotate-90' : ''
                } transition-transform duration-200`}
              />
            </button>
          )}
        </div>
      </div>

      {(isExpanded || !isSection) && (
        <div className="mt-3 pl-9">
          {editMode ? (
            <Textarea
              ref={textAreaRef}
              value={isSection ? description : content}
              onChange={e =>
                isSection && onDescriptionChange
                  ? onDescriptionChange(e.target.value)
                  : onContentChange(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md text-sm bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none overflow-hidden"
              placeholder={
                isSection
                  ? 'セクションの具体的な内容や説明'
                  : `${title}の内容説明`
              }
              rows={isSection ? 3 : 2} // 行数を調整
            />
          ) : (
            <p className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-800/20 p-3 rounded-md">
              {isSection ? description : content}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// セクション追加ボタンコンポーネント
const AddSectionButton: React.FC<{ onClick: () => void, editMode: boolean }> = ({
  onClick,
  editMode,
}) => {
  return (
    <>
      {editMode && (
        <div className="flex justify-center my-2 h-6 items-center">
          <div className="h-px bg-white/20 w-1/3"></div>
          <button
            onClick={onClick}
            className="text-gray-400 hover:text-white transition-colors flex items-center mx-4"
            aria-label="Add section"
          >
            <PlusCircle size={20} />
          </button>
          <div className="h-px bg-white/20 w-1/3"></div>
        </div>
      )}
    </>
  )
}
