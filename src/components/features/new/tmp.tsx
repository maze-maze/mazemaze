'use client'

import { Button } from '🎙️/components/ui/button'
import {
  ArrowLeft, // 戻るボタン用
  CheckCircle2, // 完了アイコン用
  FileText,
  MenuSquare,
  Mic,
  Podcast,
  ShieldCheck,
  Sparkles,
  User, // キャラクターアイコン用
  Users, // キャラクターアイコン用
  BookText, // 構成アイコン用
  ClipboardList, // 台本アイコン用
  Palette, // テーマアイコン用
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import GuestCharacterSelector from './StepGuestCharacter'
import MainCharacterSelector from './StepMainCharacter'
import ScriptGenerator from './StepScript'
import StructureSelector from './StepStructure'
import ThemeSelector from './StepTheme'
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
  sections: { title: string; description: string }[] // 型を修正
  outro: string
}

interface ThemeObject {
  theme: string
  gradient: string
}

// 情報表示用のカードコンポーネント
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
  );
}

// 完了ページコンポーネント
function CompletePage({
    themeObj,
    character,
    guestCharacter,
    structure,
    script,
    onBack,
    onRestart,
}: {
    themeObj: ThemeObject | null;
    character: Character | null;
    guestCharacter: Character | null;
    structure: Structure | null;
    script: string;
    onBack: () => void;
    onRestart: () => void;
}) {
    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-[#0E0B16] text-white p-8">
            {/* ヘッダー */}
            <div className="w-full py-5 flex gap-2 items-center justify-center relative px-4 border-b border-white/10 mb-6">
                <button
                    onClick={onBack}
                    className=" text-white hover:text-primary transition-colors"
                >
                    <ArrowLeft size={26} />
                </button>
                    <h1 className="text-white font-black text-2xl text-center">
                        ポットキャスト生成完了！
                    </h1>
            </div>

            <p className="mb-8 text-gray-400 text-base text-center">
                以下の内容でポッドキャストの準備が整いました。
            </p>

            <div className="w-full max-w-3xl overflow-y-auto flex-1 pb-24">
                {/* テーマ */}
                <InfoCard title="テーマ" icon={Palette}>
                    <p className="text-lg font-medium">{themeObj?.theme}</p>
                </InfoCard>

                {/* メインキャラクター */}
                <InfoCard title="メインキャラクター" icon={User}>
                    <p><strong>名前:</strong> {character?.name}</p>
                    <p><strong>説明:</strong> {character?.description}</p>
                    <p><strong>トーン:</strong> {character?.tone}</p>
                </InfoCard>

                {/* ゲストキャラクター */}
                <InfoCard title="ゲストキャラクター" icon={Users}>
                    <p><strong>名前:</strong> {guestCharacter?.name}</p>
                    <p><strong>説明:</strong> {guestCharacter?.description}</p>
                    <p><strong>トーン:</strong> {guestCharacter?.tone}</p>
                </InfoCard>

                {/* 構成 */}
                <InfoCard title="構成" icon={BookText}>
                    <div>
                        <h4 className="font-semibold mb-1">イントロ:</h4>
                        <p className="pl-4 border-l-2 border-primary/50">{structure?.intro}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1 mt-3">セクション:</h4>
                        <ul className="pl-4 space-y-2">
                            {structure?.sections.map((sec, index) => (
                                <li key={index} className="pl-4 border-l-2 border-primary/50">
                                    <p><strong>{sec.title}</strong></p>
                                    <p className="text-gray-400">{sec.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1 mt-3">アウトロ:</h4>
                        <p className="pl-4 border-l-2 border-primary/50">{structure?.outro}</p>
                    </div>
                </InfoCard>

                {/* 台本 */}
                <InfoCard title="台本" icon={ClipboardList}>
                   <div className="bg-gray-900/50 p-4 rounded-md max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm leading-6">
                            {script || '台本が生成されていません。'}
                        </pre>
                   </div>
                </InfoCard>

                {/* 最初からボタン */}
                 <div className="mt-12 flex justify-center">
                    <Button
                        onClick={onRestart}
                        size="lg"
                        variant="default" // 目立つように
                    >
                        <Podcast className="mr-2" />
                        もう一度ポッドキャストを生成する
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function NewTmp() {
  const [name, setName] = useQueryState('s')
  const step = name || 'theme'

  const [themeObj, setThemeObj] = useState<ThemeObject | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [guestCharacter, setGuestCharacter] = useState<Character | null>(null)
  const [structure, setStructure] = useState<Structure | null>(null) // 型を修正
  const [script, setScript] = useState<string>('')

  // 最初にリセットする関数
  const handleRestart = () => {
      setThemeObj(null);
      setCharacter(null);
      setGuestCharacter(null);
      setStructure(null);
      setScript('');
      setName('theme'); // 最初のステップに戻る
  }

  return (
    <main className="">
      {step === 'theme' && (
        <ThemeSelector
          onSelect={({ theme, gradient }: { theme: string, gradient: string }) => {
            setThemeObj({ theme, gradient })
            setName('main-character') // main-character に遷移
          }}
          onNext={() => setName('main-character')} // onNext も main-character に
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
          onSelect={(selectedGuestCharacter) => { // 型を明示
            setGuestCharacter(selectedGuestCharacter)
            setName('structure') // onSelect で遷移
          }}
          onNext={() => setName('structure')} // onNext も structure に
          onBack={() => setName('main-character')}
          mainSelfSelected={!!character?.self}
        />
      )}
      {step === 'structure' && themeObj && character && guestCharacter && (
        <StructureSelector
          theme={themeObj?.theme || ''}
          mainCharacter={character}
          guestCharacter={guestCharacter}
          gradient={themeObj?.gradient || ''} // gradient を渡す
          onSelect={setStructure} // ここで setStructure を渡す
          onNext={() => setName('script')}
          onBack={() => setName('guest-character')} // 戻り先を修正
        />
      )}
      {step === 'script' && themeObj && character && structure && ( // themeObj と structure もチェック
        <ScriptGenerator
          theme={themeObj?.theme || ''}
          mainCharacter={character} // mainCharacter を渡す
          guestCharacter={guestCharacter} // guestCharacter を渡す
          structure={structure} // structure を渡す
          onGenerate={setScript} // ここで setScript を渡す
          onNext={() => setName('complete')}
          onBack={() => setName('structure')}
        />
      )}
      {/* 完了ステップ */}
      {step === 'complete' && (
          <CompletePage
              themeObj={themeObj}
              character={character}
              guestCharacter={guestCharacter}
              structure={structure}
              script={script}
              onBack={() => setName('script')} // 台本画面に戻る
              onRestart={handleRestart} // 最初からやり直す
          />
      )}

    </main>
  )
}