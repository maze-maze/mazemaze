/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable no-alert */
/* eslint-disable no-console */
'use client'

import { Button, buttonVariants } from '🎙️/components/ui/button'
// import { useLocationState, jsonSerializer } from "@location-state/core"; // 不要になるので削除
import { StorageKeys } from '🎙️/lib/storage-keys'
import {
  ArrowLeft,
  BookText,
  ClipboardList,
  Palette,
  Podcast,
  Save,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useQueryState } from 'nuqs'
import React, { useEffect, useState } from 'react' // useState, useEffect をインポート
import GuestCharacterSelector from './StepGuestCharacter'
import MainCharacterSelector from './StepMainCharacter'
import ScriptGenerator from './StepScript'
import StructureSelector from './StepStructure'
import ThemeSelector from './StepTheme'

// 型定義 (変更なし)
interface Character { name: string, description: string, tone: string, self?: boolean }
interface Structure { intro: string, sections: { title: string, description: string }[], outro: string }
interface ThemeObject { theme: string, gradient: string }

// --- セッションストレージ用のカスタムフック ---
function useSessionStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // クライアントサイドでのみ sessionStorage を読む
    if (typeof window === 'undefined') {
      return defaultValue
    }
    try {
      const storedValue = window.sessionStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : defaultValue
    }
    catch (error) {
      console.error(`Error reading sessionStorage key “${key}”:`, error)
      return defaultValue
    }
  })

  useEffect(() => {
    // state が変更されたら sessionStorage に書き込む
    try {
      if (state === null || state === undefined) {
        window.sessionStorage.removeItem(key)
      }
      else {
        window.sessionStorage.setItem(key, JSON.stringify(state))
      }
    }
    catch (error) {
      console.error(`Error writing sessionStorage key “${key}”:`, error)
    }
  }, [key, state]) // key と state が変更されたら実行

  return [state, setState]
}
// ---------------------------------------------

// InfoCard コンポーネント (変更なし)
function InfoCard({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 text-white mb-4 w-full">
      <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center border-b border-white/10 pb-3">
        <Icon size={20} className="mr-3 text-primary" />
        {title}
      </h3>
      <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

// 完了ページコンポーネント (変更なし)
function CompletePage({
  themeObj,
  character,
  guestCharacter,
  structure,
  script,
  onBack,
  onRestart,
}: {
  themeObj: ThemeObject | null
  character: Character | null
  guestCharacter: Character | null
  structure: Structure | null
  script: string | null
  onBack: () => void
  onRestart: () => void
}) {
  // セッションストレージの内容を確認する関数
  const handleCheckSessionStorage = () => {
    console.log('--- Current State (in React) ---')
    console.log('Theme:', themeObj)
    console.log('Main Character:', character)
    console.log('Guest Character:', guestCharacter)
    console.log('Structure:', structure)
    console.log('Script:', script)
    console.log('--- Session Storage Content ---')
    try {
      console.log(`${StorageKeys.THEME}:`, sessionStorage.getItem(StorageKeys.THEME))
      console.log(`${StorageKeys.MAIN}:`, sessionStorage.getItem(StorageKeys.MAIN))
      console.log(`${StorageKeys.GUEST}:`, sessionStorage.getItem(StorageKeys.GUEST))
      console.log(`${StorageKeys.STRUCTURE}:`, sessionStorage.getItem(StorageKeys.STRUCTURE))
      console.log(`${StorageKeys.SCRIPT}:`, sessionStorage.getItem(StorageKeys.SCRIPT))
      alert('現在の状態とセッションストレージの内容をコンソールに出力しました。')
    }
    catch (e) {
      console.error('Failed to access session storage:', e)
      alert('セッションストレージへのアクセスに失敗しました。')
    }
  }
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0E0B16] text-white p-8">
      <div className="w-full py-5 flex items-center justify-center relative px-8 border-b border-white/10 mb-6">
        <button
          onClick={onBack}
          className="absolute left-8 flex items-center text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={26} />
        </button>
        <div className="flex items-center justify-center">
          <h1 className="text-white font-black text-2xl text-center">
            ポッドキャスト生成完了！
          </h1>
        </div>
      </div>
      <p className="mb-8 text-gray-400 text-base text-center">
        以下の内容でポッドキャストの準備が整いました。
      </p>
      <div className="w-full max-w-3xl overflow-y-auto flex-1 pb-24">
        {themeObj && (
          <InfoCard title="テーマ" icon={Palette}>
            <p className="text-lg font-medium">{themeObj.theme}</p>
          </InfoCard>
        )}
        {character && (
          <InfoCard title="メインキャラクター" icon={User}>
            <p>
              <strong>名前:</strong>
              {' '}
              {character.name}
            </p>
            <p>
              <strong>説明:</strong>
              {' '}
              {character.description}
            </p>
            <p>
              <strong>トーン:</strong>
              {' '}
              {character.tone}
            </p>
          </InfoCard>
        )}
        {guestCharacter && (
          <InfoCard title="ゲストキャラクター" icon={Users}>
            <p>
              <strong>名前:</strong>
              {' '}
              {guestCharacter.name}
            </p>
            <p>
              <strong>説明:</strong>
              {' '}
              {guestCharacter.description}
            </p>
            <p>
              <strong>トーン:</strong>
              {' '}
              {guestCharacter.tone}
            </p>
          </InfoCard>
        )}
        {structure && (
          <InfoCard title="構成" icon={BookText}>
            <div>
              <h4 className="font-semibold mb-1">イントロ:</h4>
              <p className="pl-4 border-l-2 border-primary/50">{structure.intro}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 mt-3">セクション:</h4>
              <ul className="pl-4 space-y-2">
                {structure.sections.map((sec, index) => (
                  <li key={index} className="pl-4 border-l-2 border-primary/50">
                    <p><strong>{sec.title}</strong></p>
                    <p className="text-gray-400">{sec.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1 mt-3">アウトロ:</h4>
              <p className="pl-4 border-l-2 border-primary/50">{structure.outro}</p>
            </div>
          </InfoCard>
        )}
        <InfoCard title="台本" icon={ClipboardList}>
          <div className="bg-gray-900/50 p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-6">
              {script || '台本が生成されていません。'}
            </pre>
          </div>
        </InfoCard>
        <div className="mt-12 flex justify-center gap-4">
          <Button onClick={onRestart} size="lg" variant="secondary">
            もう一度生成する
          </Button>
          <a
            href="/new/recording"
            className={buttonVariants({ size: 'lg', variant: 'default' })}
          >
            <Podcast className="mr-2" />
            録音する
          </a>
        </div>
      </div>
    </div>
  )
}

export default function NewTmp() {
  const [name, setName] = useQueryState('s', { defaultValue: 'theme' })
  const step = name

  // --- useSessionStorageState を使用 ---
  const [themeObj, setThemeObj] = useSessionStorageState<ThemeObject | null>(StorageKeys.THEME, null)
  const [character, setCharacter] = useSessionStorageState<Character | null>(StorageKeys.MAIN, null)
  const [guestCharacter, setGuestCharacter] = useSessionStorageState<Character | null>(StorageKeys.GUEST, null)
  const [structure, setStructure] = useSessionStorageState<Structure | null>(StorageKeys.STRUCTURE, null)
  const [script, setScript] = useSessionStorageState<string | null>(StorageKeys.SCRIPT, null)
  // ------------------------------------

  const handleRestart = () => {
    setThemeObj(null)
    setCharacter(null)
    setGuestCharacter(null)
    setStructure(null)
    setScript(null)
    setName('theme')
  }

  return (
    <main className="">
      {step === 'theme' && (
        <ThemeSelector
          onSelect={({ theme, gradient }) => {
            setThemeObj({ theme, gradient })
            setName('main-character')
          }}
          onNext={() => setName('main-character')}
        />
      )}
      {step === 'main-character' && themeObj && (
        <MainCharacterSelector
          theme={themeObj.theme}
          gradient={themeObj.gradient}
          onSelect={setCharacter}
          onNext={() => setName('guest-character')}
          onBack={() => setName('theme')}
        />
      )}
      {step === 'guest-character' && themeObj && character && (
        <GuestCharacterSelector
          theme={themeObj.theme}
          gradient={themeObj.gradient}
          onSelect={(selectedGuest) => {
            setGuestCharacter(selectedGuest)
            setName('structure')
          }}
          onNext={() => setName('structure')}
          onBack={() => setName('main-character')}
          mainSelfSelected={!!character?.self}
        />
      )}
      {step === 'structure' && themeObj && character && (
        <StructureSelector
          theme={themeObj.theme}
          mainCharacter={character}
          guestCharacter={guestCharacter}
          gradient={themeObj.gradient}
          onSelect={setStructure}
          onNext={() => setName('script')}
          onBack={() => setName('guest-character')}
        />
      )}
      {step === 'script' && themeObj && character && structure && (
        <ScriptGenerator
          theme={themeObj.theme}
          mainCharacter={character}
          guestCharacter={guestCharacter}
          structure={structure}
          onGenerate={setScript}
          onNext={() => setName('complete')}
          onBack={() => setName('structure')}
        />
      )}
      {step === 'complete' && (
        <CompletePage
          themeObj={themeObj}
          character={character}
          guestCharacter={guestCharacter}
          structure={structure}
          script={script}
          onBack={() => setName('script')}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}
