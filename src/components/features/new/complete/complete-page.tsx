// src/components/complete-page/complete-page.tsx
/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { ArrowLeft } from 'lucide-react'
import React from 'react'
import ActionButtons from './action-buttons'
import CharacterInfo from './character-info'
import ScriptInfo from './script-info'
import StructureInfo from './structure-info'
import ThemeInfo from './theme-info'

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

interface ThemeObject {
  theme: string
}

const StorageKeys = {
  THEME: 'themeKey',
  MAIN: 'mainCharacterKey',
  GUEST: 'guestCharacterKey',
  STRUCTURE: 'structureKey',
  SCRIPT: 'scriptKey',
}

interface CompletePageProps {
  themeObj: ThemeObject | null
  character: Character | null
  guestCharacter: Character | null
  structure: Structure | null
  script: string | null
  onBack: () => void
  onRestart: () => void
}

export default function CompletePage({
  themeObj,
  character,
  guestCharacter,
  structure,
  script,
  onBack,
  onRestart,
}: CompletePageProps) {
  const handleCheckSessionStorage = () => {
    console.log('--- Current State (in React) ---')
    console.log('Theme:', themeObj)
    console.log('Main Character:', character)
    console.log('Guest Character:', guestCharacter)
    console.log('Structure:', structure)
    console.log('Script:', script)
    console.log('--- Session Storage Content ---')
    try {
      console.log(
        `${StorageKeys.THEME}:`,
        sessionStorage.getItem(StorageKeys.THEME),
      )
      console.log(
        `${StorageKeys.MAIN}:`,
        sessionStorage.getItem(StorageKeys.MAIN),
      )
      console.log(
        `${StorageKeys.GUEST}:`,
        sessionStorage.getItem(StorageKeys.GUEST),
      )
      console.log(
        `${StorageKeys.STRUCTURE}:`,
        sessionStorage.getItem(StorageKeys.STRUCTURE),
      )
      console.log(
        `${StorageKeys.SCRIPT}:`,
        sessionStorage.getItem(StorageKeys.SCRIPT),
      )
      alert('現在の状態とセッションストレージの内容をコンソールに出力しました。')
    }
    catch (e) {
      console.error('Failed to access session storage:', e)
      alert('セッションストレージへのアクセスに失敗しました。')
    }
  }

  return (
    <div className="flex flex-col overflow-hidden items-center w-full h-screen bg-[#0E0B16]">
      {/* テーマ名 */}
      <div className="w-full py-5 flex items-center justify-center">
        <div className="mb-2 flex items-center justify-center">
          <img
            src="/lama.png"
            alt="テーマアイコン"
            className="w-8 h-8 inline-block align-middle mr-2"
          />
          <span className="text-gray-100 text-base font-bold">
            {themeObj?.theme}
          </span>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center mb-2 px-8 justify-between w-full gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-primary transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft size={26} />
        </button>
        <p className="text-white font-black text-xl text-center">
          ポッドキャスト生成完了
        </p>
        <div className="h-8 w-[26px]" />
      </div>

      <div className="w-full max-w-3xl overflow-y-auto flex-1 pb-24 px-4">
        <div className="p-6 pb-32">
          {themeObj && <ThemeInfo theme={themeObj.theme} />}
          <CharacterInfo
            mainCharacter={character}
            guestCharacter={guestCharacter}
          />
          <StructureInfo structure={structure} />
          <ScriptInfo script={script} />
          <ActionButtons onRestart={onRestart} />
        </div>
      </div>
    </div>
  )
}
