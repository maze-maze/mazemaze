/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { Button, buttonVariants } from '🎙️/components/ui/button' // Assuming buttonVariants is also exported
import {
  ArrowLeft,
  BookText,
  ClipboardList,
  Palette,
  Podcast,
  User,
  Users,
} from 'lucide-react'
import React from 'react' // Import React

// 型定義 (StructureSelectorから流用または共通化されていると仮定)
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
  // 他のテーマ関連プロパティがあればここに追加
}

// StorageKeysのダミー定義 (実際のプロジェクトに合わせてください)
const StorageKeys = {
  THEME: 'themeKey',
  MAIN: 'mainCharacterKey',
  GUEST: 'guestCharacterKey',
  STRUCTURE: 'structureKey',
  SCRIPT: 'scriptKey',
}

// --- 新しいInfoCardコンポーネント定義 ---
// StructureCardのスタイルを模倣したInfoCard
interface InfoCardProps {
  title: string
  icon: React.ElementType // lucide-reactのアイコンコンポーネントを想定
  children: React.ReactNode
}

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

export default function CompletePage({
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
  // セッションストレージの内容を確認する関数 (変更なし)
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
    <div className="flex flex-col overflow-hidden items-center w-full h-screen bg-[#0E0B16]">
      {/* テーマ名表示（上部） - StructureSelectorと類似のスタイル */}
      <div className="w-full py-5 flex items-center justify-center">
        {/* アイコン例: テーマ名に応じて画像を出し分けたい場合はここで */}
        <div className="mb-2 flex items-center justify-center">
          <img src="/lama.png" alt="テーマアイコン" className="w-8 h-8 inline-block align-middle mr-2" />
          <span className="text-gray-100 text-base font-bold">{themeObj?.theme}</span>
        </div>
      </div>

      {/* ヘッダー - StructureSelectorと類似のスタイル */}
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
        {/* 右側の要素がない場合、スペースを確保するために透明な要素を置くか、justify-betweenが機能するように空のdivを配置 */}
        <div className="h-8 w-[26px]" />
        {' '}
        {/* ArrowLeftと同じ幅でバランスを取る */}
      </div>

      <div className="w-full max-w-3xl overflow-y-auto flex-1 pb-24 px-4">
        {' '}
        {/* px-4を追加して左右のパディング */}
        <div className="p-6 pb-32">
          {themeObj && (
            <InfoCard title="テーマ" icon={Palette}>
              <p className="text-gray-200 text-base">{themeObj.theme}</p>
              {' '}
              {/* 少しスタイル調整 */}
            </InfoCard>
          )}
          {character && (
            <InfoCard title="メインキャラクター" icon={User}>
              <p className="text-gray-300">
                <strong>名前:</strong>
                {' '}
                {character.name}
              </p>
              <p className="text-gray-300 mt-1">
                <strong>説明:</strong>
                {' '}
                {character.description}
              </p>
              <p className="text-gray-300 mt-1">
                <strong>トーン:</strong>
                {' '}
                {character.tone}
              </p>
            </InfoCard>
          )}
          {guestCharacter && (
            <InfoCard title="ゲストキャラクター" icon={Users}>
              <p className="text-gray-300">
                <strong>名前:</strong>
                {' '}
                {guestCharacter.name}
              </p>
              <p className="text-gray-300 mt-1">
                <strong>説明:</strong>
                {' '}
                {guestCharacter.description}
              </p>
              <p className="text-gray-300 mt-1">
                <strong>トーン:</strong>
                {' '}
                {guestCharacter.tone}
              </p>
            </InfoCard>
          )}
          {structure && (
            <InfoCard title="構成" icon={BookText}>
              <div className="space-y-3">
                {' '}
                {/* space-yで各要素の間隔を調整 */}
                <div>
                  <h4 className="font-medium text-gray-200 mb-1">イントロ:</h4>
                  <p className="pl-4 border-l-2 border-primary/60 text-gray-300 text-sm">{structure.intro}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-200 mb-1">セクション:</h4>
                  <ul className="pl-4 space-y-2">
                    {structure.sections.map((sec, index) => (
                      <li key={index} className="pl-4 border-l-2 border-primary/60 py-1">
                        <p className="font-medium text-gray-200">{sec.title}</p>
                        <p className="text-gray-400 text-sm">{sec.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-200 mb-1">アウトロ:</h4>
                  <p className="pl-4 border-l-2 border-primary/60 text-gray-300 text-sm">{structure.outro}</p>
                </div>
              </div>
            </InfoCard>
          )}
          <InfoCard title="台本" icon={ClipboardList}>
            <div className="bg-gray-900/60 p-3 sm:p-4 rounded-md max-h-[50vh] sm:max-h-96 overflow-y-auto shadow-inner">
              {' '}
              {/* スタイル微調整 */}
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                {script || '台本が生成されていません。'}
              </pre>
            </div>
          </InfoCard>

          {/* アクションボタン */}
          <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button onClick={onRestart} size="lg" variant="secondary" className="w-full sm:w-auto">
              もう一度生成する
            </Button>
            <a
              href="/new/recording" // TODO: このパスはプロジェクトに合わせて確認・変更してください
              className={buttonVariants({ size: 'lg', variant: 'default', className: 'w-full sm:w-auto' })}
            >
              <Podcast size={20} className="mr-2" />
              録音に進む
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
