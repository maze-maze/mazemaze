/* eslint-disable no-alert */
'use client'

import { StorageKeys } from '🎙️/lib/storage-keys'
import { PlayIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react' // useEffectを追加
import MicImage from './assets/mingcute_mic-ai-fill.svg'
import { useRouter, useSearchParams } from 'next/navigation' 
import Background from './background'
import Character from './character'
import Controller from './controller'
import Countdown from './countdown'
import useWebRTCAudioSession from './hooks/use-recording'
import { useRecordingScripts } from './hooks/use-recording-scripts'
import Scripts from './scripts'
import Title from './title'

export default function RecordingPage() {
  const router = useRouter()
  // 1. sessionStorageから読み込むデータをstateとして定義
  const [prompt, setPrompt] = useState('')
  const [isReady, setIsReady] = useState(false) // データ読み込み完了フラグ

  const { title, character, script, username } = useRecordingScripts()
  const [voice] = useState('ash')

  const searchParams = useSearchParams()
  const episodeId = searchParams.get('episodeId')

  // 2. useEffectを使って、クライアントサイドでのみデータを読み込む
  useEffect(() => {
    // sessionStorageから安全にデータを取得
    const themeItem = sessionStorage.getItem(StorageKeys.THEME)
    const guestItem = sessionStorage.getItem(StorageKeys.GUEST)
    const mainItem = sessionStorage.getItem(StorageKeys.MAIN)
    const scriptItem = sessionStorage.getItem(StorageKeys.SCRIPT)

    // 必要なデータが揃っているか確認
    if (!themeItem || !guestItem || !mainItem || !scriptItem) {
      alert('セッションデータが不完全です。前のページに戻ってください。')
      // window.history.back(); // 必要に応じて前のページに戻す
      return
    }

    // JSON.parseはtry...catchで囲むとより安全
    try {
      const themeObj = JSON.parse(themeItem)
      const guestObj = JSON.parse(guestItem)
      const mainObj = JSON.parse(mainItem)
      const scriptText = JSON.parse(scriptItem)
      
      // promptを構築
      const newPrompt = `
## 概要
これから${themeObj.theme}というタイトルのポッドキャストを収録します。

## ルール
これから説明する、「役割」と「収録内容」に沿うことが重要です。絶対にこのルールに従ってください。

## 役割
あなたはポッドキャストのゲスト（${guestObj.name}）です。
メインパーソナリティの${mainObj.name}と共にポッドキャストを収録します。

あなたの名前と詳細は以下の通りです。この人物像になりきって話を進めてください。
名前：${guestObj.name}
詳細：${guestObj.description}

## 収録内容
そして、以下の台本に沿って収録を行います。絶対にこの台本に沿って話を進めてください。
タイトル: ${themeObj.theme}
台本: ${scriptText}
`
      // stateを更新
      setPrompt(newPrompt)
      setIsReady(true) // 準備完了フラグを立てる

    } catch (e) {
        console.error("セッションデータの解析に失敗しました:", e);
        alert('セッションデータの形式が正しくありません。');
    }

  }, []) // 空の依存配列[]で、マウント時に一度だけ実行

  const {
    status,
    handleStartStopClick,
    conversation,
    recordedBlob,
    playRecording,
    recordingDuration,
    countdown,
    isSaving,
    saveRecording,
  } = useWebRTCAudioSession(voice, prompt)

  const isRecording = status !== 'idle' && status !== 'connecting' && !countdown
  const isFinished = status === 'finish' || status === 'disconnected'

  // 3. データの準備が整うまで何も表示しないか、ローディング画面を表示する
  if (!isReady) {
    // サーバーとクライアントで最初の描画が一致するように、ローディング表示などを返す
    return <div>セッションデータを読み込み中...</div>
  }

// ★★★ 3. 保存処理のハンドラを正しく定義
const handleSaveRecording = async () => {
  if (!episodeId) {
    alert('エピソードIDが見つかりません。保存できません。')
    return
  }
  // 変更点: usernameもチェック
  if (!username) {
    alert('ユーザー名が取得できません。保存できません。')
    return
  }

  try {
    // 変更点: saveRecordingにusernameを渡す
    await saveRecording(episodeId, username)
    
    // alert('保存が完了しました！')
    router.push(`/episode/${episodeId}`)

  } catch (error) {
    // フックからスローされたエラーをキャッチ
    alert((error as Error).message)
  }
}

if (!isReady) {
  return <div>セッションデータを読み込み中...</div>
}

  // 準備が整ったら、メインのコンポーネントを表示
  return (
    <div className="grid grid-flow-row auto-rows-max h-dvh relative">
      <Title title={title} isRecording={isRecording} isFinished={isFinished} />
      <Character character={character} isRecording={isRecording} />
      <Background status={status} isRecording={isRecording} />
      {isRecording && <Scripts script={script} conversation={conversation} />}
      {countdown && <Countdown seconds={countdown} />}
      {isFinished && recordedBlob && (
        <div className="fixed bottom-0 right-1/2 translate-x-1/2 bg-white min-h-1/2 py-3 rounded-t-4xl w-full max-w-md flex flex-col items-center justify-center gap-4">
          <Image
            src={MicImage}
            alt="マイク"
            width={120}
            height={120}
            className=""
          />
          <button className="flex items-center flex-col justify-center gap-1" onClick={playRecording}>
            <div className="bg-black size-12 rounded-full grid place-items-center">
              <PlayIcon className="text-white" fill="#fff" />
            </div>
            <p className="text-black">再生する</p>
            <p className="text-black/60 text-sm">
              {Math.floor(recordingDuration / 60)}
              :
              {(recordingDuration % 60).toString().padStart(2, '0')}
              s |
              {' '}
              {Math.round(recordedBlob.size / 1024)}
              KB
            </p>
          </button>
          <p className="text-center text-black/60 font-bold text-2xl">
            収録が完了しました！
            <br />
            お疲れさまでした！
          </p>
          <div className="flex items-center gap-6 mt-2">
            <button className="py-4 px-8 bg-gray-200 text-black font-bold rounded-full" onClick={() => { alert('まだ開発してないよ😢') }}>収録に戻る</button>
            <button 
              className="py-4 px-10 bg-black text-white font-bold rounded-full disabled:opacity-50"
              onClick={handleSaveRecording}
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      )}
      <Controller
        time={`${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`}
        status={status}
        onStart={handleStartStopClick}
        onPause={handleStartStopClick}
      />
    </div>
  )
}