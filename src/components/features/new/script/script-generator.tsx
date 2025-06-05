'use client'

import { useEffect, useState } from 'react'
import ScriptCard from './script-card'
import ScriptError from './script-error'
import ScriptFooter from './script-footer'
import ScriptHeader from './script-header'
import ScriptLoading from './script-loading'

// 型定義
interface Character {
  name: string
  description: string
  tone: string
}

interface Structure {
  intro: string
  sections: { title: string, description: string }[]
  outro: string
}

interface ScriptSections {
  intro: string
  sections: { title: string, content: string }[]
  outro: string
}

interface Props {
  theme: string
  mainCharacter: Character | null
  guestCharacter: Character | null
  structure: Structure | null
  onGenerate: (script: string) => void
  onNext: () => void
  onBack: () => void
}

export default function ScriptGenerator({
  theme,
  mainCharacter,
  guestCharacter,
  structure,
  onGenerate,
  onNext,
  onBack,
}: Props) {
  // 台本をセクション化した内容を管理
  const [scriptSections, setScriptSections] = useState<ScriptSections>({
    intro: '',
    sections: [],
    outro: '',
  })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)

  // ---------------------
  // 「API から取得した台本（文字列）を ScriptSections に分割する」ヘルパー
  // ---------------------
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

    // 正規表現でタイトルをエスケープする
    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // 1. アウトロを抽出
    const outroKeywords = ['アウトロ', 'おわりに', 'まとめ']
    const outroPattern = new RegExp(
      `(##\\s*)?(${outroKeywords.join('|')})[:：]?([\\s\\S]*)`,
    )
    const outroMatch = scriptContent.match(outroPattern)
    let scriptWithoutOutro = scriptContent
    if (outroMatch && typeof outroMatch.index !== 'undefined') {
      outro = outroMatch[3].trim()
      scriptWithoutOutro = scriptContent.slice(0, outroMatch.index).trim()
    }

    // 2. 各セクションを後ろから抽出
    let remaining = scriptWithoutOutro
    for (let i = currentStructure.sections.length - 1; i >= 0; i--) {
      const sec = currentStructure.sections[i]
      const titlePattern = escapeRegex(sec.title)
      const pattern = new RegExp(
        `(##\\s*)?セクション${i + 1}[:：]?.*?${titlePattern}([\\s\\S]*)`,
        'i',
      )
      const match = remaining.match(pattern)
      if (match && typeof match.index !== 'undefined') {
        sections[i].content = match[2].trim()
        remaining = remaining.slice(0, match.index).trim()
      }
    }

    // 3. 残りをイントロとする
    const introKeywords = ['イントロ', 'はじめに', '導入']
    const introPattern = new RegExp(
      `(##\\s*)?(${introKeywords.join('|')})[:：]?([\\s\\S]*)`,
    )
    const introMatch = remaining.match(introPattern)
    intro = introMatch ? introMatch[3].trim() : remaining

    // 4. フォールバック
    if (
      !intro.trim()
      && !outro.trim()
      && !sections.some(s => s.content.trim())
    ) {
      console.warn('Script parsing likely failed. Displaying full script.')
      intro = scriptContent
      outro = '（アウトロの内容をここに記述）'
      sections.forEach(
        s => (s.content = `（${s.title}のスクリプトをここに記述）`),
      )
    }

    return {
      intro: intro.trim() || '（イントロの内容をここに記述）',
      sections: sections.map((s, idx) => ({
        ...s,
        content:
          s.content.trim()
          || `（${currentStructure.sections[idx].title}の内容）`,
      })),
      outro: outro.trim() || '（アウトロの内容をここに記述）',
    }
  }

  // ---------------------
  // 「ScriptSections から完全な文字列台本を組み立てる」ヘルパー
  // ---------------------
  const generateFullScript = (sections: ScriptSections) => {
    let full = `## イントロ\n${sections.intro}\n\n`
    sections.sections.forEach((sec, idx) => {
      full += `## セクション${idx + 1}: ${sec.title}\n${sec.content}\n\n`
    })
    full += `## アウトロ\n${sections.outro}`
    return full.trim()
  }

  // ---------------------
  // サーバー / AI から台本を取得してパースする
  // ---------------------
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
          guestCharacter,
          structure,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(
          `API error: ${res.status} - ${errJson.error || res.statusText}`,
        )
      }

      const data = await res.json()
      if (data && data.script) {
        const parsed = parseScriptIntoSections(data.script, structure)
        setScriptSections(parsed)
        onGenerate(generateFullScript(parsed))
      }
      else {
        throw new Error('APIからスクリプトが返されませんでした。')
      }
    }
    catch (err) {
      console.error('Error fetching script:', err)
      setError(
        `スクリプト生成中にエラーが発生しました: ${
          err instanceof Error ? err.message : String(err)
        }`,
      )
      // フォールバック
      setScriptSections({
        intro: '（イントロをここに記述）',
        sections: structure.sections.map(s => ({
          title: s.title,
          content: `（${s.title}の内容を記述してください）`,
        })),
        outro: '（アウトロをここに記述）',
      })
    }
    finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  // 初回および依存関係が変わったとき
  useEffect(() => {
    fetchScript()
  }, [theme, mainCharacter, guestCharacter, structure])

  // scriptSections が更新されたら親に渡す
  useEffect(() => {
    if (
      !loading
      && (scriptSections.intro
        || scriptSections.sections.length > 0
        || scriptSections.outro)
    ) {
      onGenerate(generateFullScript(scriptSections))
    }
  }, [scriptSections, onGenerate, loading])

  // イントロ／セクション／アウトロを更新したとき
  const updateScriptSection = (field: 'intro' | 'outro', value: string) => {
    setScriptSections((prev) => {
      const updated = { ...prev, [field]: value }
      onGenerate(generateFullScript(updated))
      return updated
    })
  }

  const updateSection = (index: number, content: string) => {
    setScriptSections((prev) => {
      const newList = [...prev.sections]
      newList[index] = { ...newList[index], content }
      const updated = { ...prev, sections: newList }
      onGenerate(generateFullScript(updated))
      return updated
    })
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0E0B16] overflow-hidden items-center">
      {/* ヘッダー */}
      <ScriptHeader
        theme={theme}
        editMode={editMode}
        setEditMode={setEditMode}
        onBack={onBack}
      />

      {/* エラー表示 */}
      {error && <ScriptError message={error} />}

      {/* ローディング表示 */}
      {(loading || generating) && (
        <ScriptLoading generating={generating} />
      )}

      {/* スクリプトセクションのリスト表示 */}
      {!loading && !generating && scriptSections.intro && (
        <div className="w-full max-w-2xl flex-1 overflow-y-auto px-4">
          <div className="p-6 pb-32 space-y-4">
            {/* イントロ */}
            <ScriptCard
              title="イントロ"
              content={scriptSections.intro}
              editMode={editMode}
              onContentChange={val => updateScriptSection('intro', val)}
              isSection={false}
            />

            {/* 各セクション */}
            {scriptSections.sections.map((sec, idx) => (
              <ScriptCard
                key={idx}
                title={`セクション ${idx + 1}: ${sec.title}`}
                content={sec.content}
                editMode={editMode}
                onContentChange={val => updateSection(idx, val)}
                isSection={true}
              />
            ))}

            {/* アウトロ */}
            <ScriptCard
              title="アウトロ"
              content={scriptSections.outro}
              editMode={editMode}
              onContentChange={val => updateScriptSection('outro', val)}
              isSection={false}
            />
          </div>
        </div>
      )}

      {/* 決定ボタン */}
      {!loading && !generating && (
        <ScriptFooter
          disabled={
            !scriptSections.intro
            || scriptSections.sections.length === 0
            || !scriptSections.outro
          }
          onNext={onNext}
        />
      )}
    </div>
  )
}
