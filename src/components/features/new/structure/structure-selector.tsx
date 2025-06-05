/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { Button } from '🎙️/components/ui/button'
import {
  ArrowLeft,
  CheckIcon,
  Loader2,
  PenIcon,
} from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'

import AddSectionButton from './add-section-button'
import StructureCard from './structure-card'

// 型定義
interface Character {
  name: string
  description: string
  tone: string
  self?: boolean
}

export interface Structure {
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
  const chatEndRef = useRef<HTMLDivElement>(null)

  // サーバーまたはAIから構成を取得する関数
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
      // エラー時はデフォルト構造を設定
      const defaultStructure: Structure = {
        intro: `テーマ「${theme}」についての紹介`,
        sections: [
          {
            title: 'テーマの背景と重要性',
            description:
              'このセクションでは、テーマの背景にある歴史や、なぜ今このテーマが重要なのかについて話します。',
          },
          {
            title: '主要な論点とディスカッション',
            description:
              'テーマに関するいくつかの主要なポイントを取り上げ、それぞれの視点から深く掘り下げて議論します。',
          },
          {
            title: 'まとめと今後の展望',
            description:
              'これまでの議論をまとめ、このテーマが今後どのように展開していく可能性があるかについて考察します。',
          },
        ],
        outro:
          '今回のポッドキャストのまとめと、リスナーへのメッセージ、次回の予告など。',
      }
      setStructure(defaultStructure)
    }
    finally {
      setLoading(false)
    }
  }

  // 初回ロード時と mainCharacter, guestCharacter が変わったときに fetchStructure を呼ぶ
  useEffect(() => {
    fetchStructure()
  }, [theme, mainCharacter, guestCharacter])

  // structure が更新されるたびに親に伝える
  useEffect(() => {
    if (
      !loading
      && (structure.intro || structure.sections.length > 0 || structure.outro)
    ) {
      onSelect(structure)
    }
  }, [structure, onSelect, loading])

  // 構成を更新する関数
  const updateStructure = (field: 'intro' | 'outro', value: string) => {
    setStructure(prev => ({ ...prev, [field]: value }))
  }

  // セクションを更新する関数
  const updateSection = (
    index: number,
    updatedFields: { title?: string, description?: string },
  ) => {
    setStructure((prev) => {
      const newSections = [...prev.sections]
      if (newSections[index]) {
        newSections[index] = { ...newSections[index], ...updatedFields }
      }
      return { ...prev, sections: newSections }
    })
  }

  // セクションを追加する関数
  const addSection = (index: number) => {
    setStructure((prev) => {
      const newSections = [...prev.sections]
      newSections.splice(index, 0, {
        title: '新しいセクション',
        description: 'このセクションで話す内容...',
      })
      return { ...prev, sections: newSections }
    })
  }

  // セクションを削除する関数
  const removeSection = (index: number) => {
    setStructure((prev) => {
      if (prev.sections.length <= 1)
        return prev
      const newSections = prev.sections.filter((_, i) => i !== index)
      return { ...prev, sections: newSections }
    })
  }

  // セクションを上に移動
  const moveSectionUp = (index: number) => {
    if (index === 0)
      return
    setStructure((prev) => {
      const newSections = [...prev.sections]
      ;[newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ]
      return { ...prev, sections: newSections }
    })
  }

  // セクションを下に移動
  const moveSectionDown = (index: number) => {
    if (index === structure.sections.length - 1)
      return
    setStructure((prev) => {
      const newSections = [...prev.sections]
      ;[newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ]
      return { ...prev, sections: newSections }
    })
  }

  // 再生成ボタンのハンドラー
  const handleRegenerateStructure = () => {
    fetchStructure()
  }

  return (
    <div className="flex flex-col overflow-hidden items-center w-full h-screen bg-[#0E0B16]">
      {/* ヘッダー */}
      <div className="w-full py-5 flex items-center justify-center">
        <div className="mb-2 flex items-center justify-center">
          <img
            src="/lama.png"
            alt="テーマアイコン"
            className="w-8 h-8 inline-block align-middle mr-2"
          />
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
        <p className="text-white font-black text-xl text-center">構成を考える</p>
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
            {/* イントロ */}
            <StructureCard
              title="イントロ"
              content={structure.intro}
              editMode={editMode}
              onContentChange={value => updateStructure('intro', value)}
              isSection={false}
            />

            {/* イントロと最初のセクションの間にボタン */}
            <AddSectionButton onClick={() => addSection(0)} editMode={editMode} />

            {/* セクション群 */}
            {structure.sections.map((section, index) => (
              <Fragment key={index}>
                <StructureCard
                  title={section.title}
                  content={section.title}
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
              </Fragment>
            ))}

            {/* アウトロ */}
            <StructureCard
              title="アウトロ"
              content={structure.outro}
              editMode={editMode}
              onContentChange={value => updateStructure('outro', value)}
              isSection={false}
            />
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

      <div ref={chatEndRef} />
    </div>
  )
}
