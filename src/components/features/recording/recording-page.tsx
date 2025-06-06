/* eslint-disable no-alert */
'use client'

import { Button } from '🎙️/components/ui/button'
import { StorageKeys } from '🎙️/lib/storage-keys'
import { ArrowLeftIcon, CheckIcon, MicIcon, PlayIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import MicImage from './assets/mingcute_mic-ai-fill.svg'
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

  return (
    <div className="grid grid-flow-row auto-rows-max h-dvh relative">
      <Title title={title} isRecording={isRecording} isFinished={isFinished} />
      <Character character={character} isRecording={isRecording} />
      <Background status={status} isRecording={isRecording} />
      {isRecording && <Scripts script={script} conversation={conversation} />}
      {countdown && <Countdown seconds={countdown} />}
      {isFinished && recordedBlob && (

        <div className="fixed bottom-0 right-1/2 translate-x-1/2 bg-white h-1/2 rounded-t-4xl w-full max-w-md flex flex-col items-center justify-center gap-4">
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
          </button>
          <p className="text-center text-black/60 font-bold text-2xl">
            収録が完了しました！
            <br />
            お疲れさまでした！
          </p>
          <div className="flex items-center gap-6 mt-2">
            <button className="py-4 px-8 bg-gray-200 text-black font-bold rounded-full" onClick={() => { alert('まだ開発してないよ😢') }}>収録に戻る</button>
            <button className="py-4 px-10 bg-black text-white font-bold rounded-full">保存する</button>
          </div>
        </div>
        // <div className="w-60 border border-white bg-white/50 backdrop-blur fixed bottom-10 right-1/2 translate-x-1/2 flex flex-col items-center py-3 px-2 justify-center rounded-2xl">
        //   <Button className="text-white/90 bg-transparent hover:bg-transparent rounded-full mb-2 mr-2 w-full" aria-label="Finish recording">
        //     <ArrowLeftIcon />
        //     <span>収録を再開する</span>
        //   </Button>
        //   <div className="bg-white/20 rounded-xl py-3 px-1.5 flex items-center justify-center flex-col gap-2 w-full">
        //     <MicIcon className="size-8 text-white" />
        //     <p className="text-center">
        //       収録が完了しました
        //       <br />
        //       お疲れ様でした！
        //     </p>
        //     <p className="text-sm text-white/90">
        //       {Math.round(recordedBlob.size / 1024)}
        //       KB |
        //       {' '}
        //       {Math.floor(recordingDuration / 60)}
        //       :
        //       {(recordingDuration % 60).toString().padStart(2, '0')}
        //       s
        //     </p>
        //   </div>
        //   <div className="flex items-center gap-2 mt-2">
        //     <Button className="text-blue-200 bg-transparent hover:bg-transparent rounded-full" aria-label="Finish recording">
        //       <CheckIcon />
        //       <span>保存する</span>
        //     </Button>
        //     <div className="h-3 w-[1px] bg-white/50" />
        //     <Button
        //       className="text-blue-200 bg-transparent hover:bg-transparent rounded-full"
        //       aria-label="Play recording"
        //       onClick={playRecording}
        //     >
        //       <PlayIcon />
        //       <span>再生する</span>
        //     </Button>
        //   </div>
        // </div>
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
