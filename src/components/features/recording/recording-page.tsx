'use client'

import { Button } from '🎙️/components/ui/button'
import { StorageKeys } from '🎙️/lib/storage-keys'
import { useState } from 'react'
import Background from './background'
import Character from './character'
import Controller from './controller'
import Countdown from './countdown'
import useWebRTCAudioSession from './hooks/use-recording'
import { useRecordingScripts } from './hooks/use-recording-scripts'
import Scripts from './scripts'
import Title from './title'

export default function RecordingPage() {
  if (typeof window === 'undefined')
    return null

  const { title, character, script } = useRecordingScripts()
  const [voice] = useState('ash')
  const [prompt] = useState(`
    ## 概要
    これから${JSON.parse(window.sessionStorage.getItem(StorageKeys.THEME)!).theme}というタイトルのポッドキャストを収録します。

    ## ルール
    これから説明する、「役割」と「収録内容」に沿うことが重要です。絶対にこのルールに従ってください。

    ## 役割
    あなたはポッドキャストのゲスト（${JSON.parse(window.sessionStorage.getItem(StorageKeys.GUEST)!).name}）です。
    メインパーソナリティの${JSON.parse(window.sessionStorage.getItem(StorageKeys.MAIN)!).name}と共にポッドキャストを収録します。

    あなたの名前と詳細は以下の通りです。この人物像になりきって話を進めてください。
    名前：${JSON.parse(window.sessionStorage.getItem(StorageKeys.GUEST)!).name}
    詳細：${JSON.parse(window.sessionStorage.getItem(StorageKeys.GUEST)!).description}

    ## 収録内容
    そして、以下の台本に沿って収録を行います。絶対にこの台本に沿って話を進めてください。
    タイトル: ${JSON.parse(window.sessionStorage.getItem(StorageKeys.THEME)!).theme}
    台本: ${JSON.parse(window.sessionStorage.getItem(StorageKeys.SCRIPT)!)}
    `)

  const {
    status,
    handleStartStopClick,
    conversation,
    recordedBlob,
    playRecording,
    recordingDuration,
    countdown,
  } = useWebRTCAudioSession(voice, prompt)
  const isRecording = status !== 'idle' && status !== 'connecting' && !countdown
  const isFinished = status === 'finish' || status === 'disconnected'

  if (isFinished && recordedBlob) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={playRecording}
            className="flex items-center gap-2"
          >
            録音を再生
          </Button>
          {/* <Button
              onClick={() => {
                const url = URL.createObjectURL(recordedBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
              variant="secondary"
              className="flex items-center gap-2"
            >
              💾 ダウンロード
            </Button> */}
        </div>
        <div className="text-sm text-gray-600 bg-white p-2 rounded border">
          📊 録音情報:
          {' '}
          {Math.round(recordedBlob.size / 1024)}
          KB |
          録音時間:
          {' '}
          {Math.floor(recordingDuration / 60)}
          :
          {(recordingDuration % 60).toString().padStart(2, '0')}
          {' '}
          | 形式: WebM
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-flow-row auto-rows-max h-dvh relative">
      <Title title={title} isRecording={isRecording} />
      <Character character={character} isRecording={isRecording} />
      <Background status={status} isRecording={isRecording} />
      {isRecording && <Scripts script={script} conversation={conversation} />}
      {countdown && <Countdown seconds={countdown} />}
      <Controller
        time={`${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`}
        status={status}
        onStart={handleStartStopClick}
        onPause={handleStartStopClick}
      />
    </div>
  )
}
