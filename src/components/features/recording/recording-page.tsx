'use client'

import { Button } from '🎙️/components/ui/button'
import { useState } from 'react'
import Background from './background'
import Character from './character'
import Controller from './controller'
import Countdown from './countdown'
import { useRecordingScripts } from './hooks/use-recoding-scripts'
import useWebRTCAudioSession from './hooks/use-recording'
import Scripts from './scripts'
import Title from './title'

export default function RecordingPage() {
  const { title, character, script } = useRecordingScripts()
  const [voice] = useState('ash')

  const {
    status,
    handleStartStopClick,
    conversation,
    recordedBlob,
    playRecording,
    recordingDuration,
    countdown,
  } = useWebRTCAudioSession(voice)
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
