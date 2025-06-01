/* eslint-disable unused-imports/no-unused-imports */

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
import CompletePage from './StepComplete'
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
