'use client'

import { Button } from '🎙️/components/ui/button'
import {
  ArrowRight,
  FileText,
  MenuSquare,
  Mic,
  Podcast,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import CharacterSelector from './StepCharacter'
import ScriptGenerator from './StepScript'
import StructureSelector from './StepStructure'
import ThemeSelector from './StepTheme'

export default function NewTmp() {
  const [name, setName] = useQueryState('s')
  // nameが空の場合は'theme'扱い
  const step = name || 'theme'

  // 各ステップの値をlocal stateで保持
  const [theme, setTheme] = useState('')
  const [character, setCharacter] = useState<{
    name: string
    description: string
    tone: string
  } | null>(null)
  const [structure, setStructure] = useState<{
    intro: string
    sections: string[]
    outro: string
  } | null>(null)
  const [script, setScript] = useState<string>('')

  // ステップの進行状況を表示するヘッダー
  const StepHeader = () => (
    <div className="w-full max-w-4xl mx-auto mb-4 px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              [
                'theme',
                'character',
                'structure',
                'script',
                'complete',
              ].includes(step)
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Podcast size={18} />
          </div>
          <div
            className={`h-1 w-12 mx-1 ${
              ['character', 'structure', 'script', 'complete'].includes(step)
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              ['character', 'structure', 'script', 'complete'].includes(step)
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Mic size={18} />
          </div>
          <div
            className={`h-1 w-12 mx-1 ${
              ['structure', 'script', 'complete'].includes(step)
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              ['structure', 'script', 'complete'].includes(step)
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <MenuSquare size={18} />
          </div>
          <div
            className={`h-1 w-12 mx-1 ${
              ['script', 'complete'].includes(step)
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              ['script', 'complete'].includes(step)
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <FileText size={18} />
          </div>
          <div
            className={`h-1 w-12 mx-1 ${
              step === 'complete' ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'complete'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Sparkles size={18} />
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {step === 'theme' && 'ステップ 1/5: テーマを選択'}
          {step === 'character' && 'ステップ 2/5: パーソナリティを選択'}
          {step === 'structure' && 'ステップ 3/5: 構成を決定'}
          {step === 'script' && 'ステップ 4/5: スクリプト生成'}
          {step === 'complete' && 'ステップ 5/5: 完了'}
        </div>
      </div>
    </div>
  )

  // 完了画面
  const CompletionScreen = ({ theme, character, structure, script }: {
    theme: string
    character: { name: string, description: string, tone: string } | null
    structure: { intro: string, sections: string[], outro: string } | null
    script: string
  }) => (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full max-w-md mt-10 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">作成完了！</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-800 mb-2">
              ポッドキャスト情報
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">テーマ:</span>
              {' '}
              {theme}
            </p>
            {character && (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">パーソナリティ:</span>
                  {' '}
                  {character.name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">説明:</span>
                  {' '}
                  {character.description}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">トーン:</span>
                  {' '}
                  {character.tone}
                </p>
              </>
            )}
            {structure && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">構成:</span>
                  {' '}
                  {structure.sections.length}
                  セクション
                </p>
              </div>
            )}
            {script && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">スクリプト:</span>
                  {' '}
                  生成済み
                </p>
              </div>
            )}
          </div>
          <p className="text-center text-gray-600 mb-6">
            ポッドキャストの設定が完了しました。これで録音を始められます。
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setName('theme')}
              className="flex items-center"
            >
              最初からやり直す
            </Button>
            <Button className="flex items-center">
              録音を始める
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex h-screen flex-col items-center justify-between py-10 bg-gradient-to-b from-slate-50 to-white">
      <StepHeader />
      {step === 'theme' && (
        <ThemeSelector
          onSelect={(selectedTheme: string) => {
            setTheme(selectedTheme)
            setName('character')
          }}
          onNext={() => setName('character')}
        />
      )}
      {step === 'character' && (
        <CharacterSelector
          theme={theme}
          onSelect={(selectedCharacter: { name: string, description: string, tone: string }) => {
            setCharacter(selectedCharacter)
            setName('structure')
          }}
          onNext={() => setName('structure')}
          onBack={() => setName('theme')}
        />
      )}
      {step === 'structure' && (
        <StructureSelector
          theme={theme}
          character={character}
          onSelect={(selectedStructure: { intro: string, sections: string[], outro: string }) => {
            setStructure(selectedStructure)
            setName('script')
          }}
          onNext={() => setName('script')}
          onBack={() => setName('character')}
        />
      )}
      {step === 'script' && (
        <ScriptGenerator
          theme={theme}
          character={character}
          structure={structure}
          onGenerate={(generatedScript: string) => {
            setScript(generatedScript)
            setName('complete')
          }}
          onNext={() => setName('complete')}
          onBack={() => setName('structure')}
        />
      )}
      {step === 'complete' && (
        <CompletionScreen
          theme={theme}
          character={character}
          structure={structure}
          script={script}
        />
      )}
    </main>
  )
}
