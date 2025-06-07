/* eslint-disable no-alert */
/* eslint-disable no-console */
'use client'

import type { Conversation, Status } from '🎙️/lib/types/recording'
import { createClient } from '🎙️/utils/supabase/client'
import { useEffect, useRef, useState } from 'react'

// ヘルパー関数：イベントハンドラ内で安全に使用できるID生成関数
function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

interface UseWebRTCAudioSessionReturn {
  status: Status
  isSessionActive: boolean
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>
  startSession: () => Promise<void>
  stopSession: () => void
  handleStartStopClick: () => void
  msgs: unknown[]
  currentVolume: number
  conversation: Conversation[]
  recordedBlob: Blob | null
  playRecording: () => void
  recordingDuration: number
  countdown: number | null
  isSaving: boolean
  saveRecording: (episodeId: string, username: string) => Promise<void>
}

export default function useWebRTCAudioSession(
  voice: string,
  prompt: string,
): UseWebRTCAudioSessionReturn {
  const [status, setStatus] = useState<Status>('idle')
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isSessionReady, setIsSessionReady] = useState(false)

  // 録音関連の状態
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)
  const countdownIntervalRef = useRef<number | null>(null)

  // --- 保存処理中の状態を追加 ---
  const [isSaving, setIsSaving] = useState(false)

  // --- Supabaseクライアントをインスタンス化 ---
  const supabase = createClient()

  // 音声ミックス用の参照
  const mixedAudioContextRef = useRef<AudioContext | null>(null)
  const userAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const aiAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)

  // ローカルマイク用のオーディオ参照
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // WebRTC参照
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)

  // すべての生イベント/メッセージを追跡
  const [msgs, setMsgs] = useState<any[]>([])

  // メインの会話状態
  const [conversation, setConversation] = useState<Conversation[]>([])

  // 音量分析（アシスタントのインバウンドオーディオ）
  const [currentVolume, setCurrentVolume] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const volumeIntervalRef = useRef<number | null>(null)

  /**
   * ここでは一時的なユーザーメッセージの**ID**のみを追跡します。
   * ユーザーが話している間、そのIDによって会話項目を更新します。
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null)

  /**
   * データチャネルを開いたときに設定し、サーバーにセッション更新を送信します。
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // セッション更新を送信
    const sessionUpdate = {
      type: 'session.update',
      session: {
        modalities: ['audio', 'text'],
        instructions: prompt, // プロンプトをシステム指示として設定
        input_audio_transcription: {
          model: 'whisper-1',
        },
      },
    }
    dataChannel.send(JSON.stringify(sessionUpdate))

    console.log('セッション更新送信:', sessionUpdate)

    // 言語設定メッセージを送信
    const languageMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: '日本語だけで話し、日本語で答える。日本語で応答し続けることが極めて重要です。もしユーザーが他の言語で話したとしても、日本語で応答する必要があります。',
          },
        ],
      },
    }
    dataChannel.send(JSON.stringify(languageMessage))
  }

  /**
   * 一時的なユーザーIDを返し、必要に応じて会話に新しい一時的なメッセージを作成します。
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current
    if (!ephemeralId) {
      // 堅牢なユニークIDを生成
      ephemeralId = generateUniqueId()
      ephemeralUserMessageIdRef.current = ephemeralId

      const newMessage: Conversation = {
        id: ephemeralId,
        role: 'user',
        text: '',
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: 'speaking',
      }

      // 一時的なアイテムを会話に追加
      setConversation(prev => [...prev, newMessage])
    }
    return ephemeralId
  }

  /**
   * 一時的なユーザーメッセージ（ephemeralUserMessageIdRefにより）を部分的な変更で更新します。
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current
    if (!ephemeralId)
      return // 更新する一時的なユーザーメッセージがない

    setConversation(prev =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial }
        }
        return msg
      }),
    )
  }

  /**
   * 次のユーザー発話が新たに始まるように、一時的なユーザーメッセージIDをクリアします。
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null
  }

  /**
   * メインデータチャネルメッセージハンドラー：サーバーからのイベントを解釈します。
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data)
      console.log('データチャネルの受信メッセージ:', msg)

      switch (msg.type) {
        /**
         * ユーザーの発話開始
         */
        case 'input_audio_buffer.speech_started': {
          setStatus('speaking')
          getOrCreateEphemeralUserId()
          updateEphemeralUserMessage({ status: 'speaking' })

          console.log('ユーザー発話開始 - 現在の会話状態:', conversation)
          break
        }

        /**
         * ユーザーの発話停止
         */
        case 'input_audio_buffer.speech_stopped': {
          // オプション: "stopped"に設定するか、単に"speaking"のままにしておくこともできます
          updateEphemeralUserMessage({ status: 'speaking' })
          break
        }

        /**
         * 音声バッファがコミットされた => "音声を処理中..."
         */
        case 'input_audio_buffer.committed': {
          setStatus('recording')
          updateEphemeralUserMessage({
            text: '音声を処理中...',
            status: 'processing',
          })
          break
        }

        /**
         * ユーザー発話の部分的な文字起こし
         */
        case 'conversation.item.input_audio_transcription': {
          const partialText
            = msg.transcript ?? msg.text ?? 'ユーザーが話しています...'
          updateEphemeralUserMessage({
            text: partialText,
            status: 'speaking',
            isFinal: false,
          })
          console.log('ユーザー発話の部分的な文字起こし - 更新後の会話状態:', conversation)
          break
        }

        /**
         * ユーザー発話の最終文字起こし
         */
        case 'conversation.item.input_audio_transcription.completed': {
          console.log('ユーザー発話の最終文字起こし:', msg.transcript)
          setStatus('recording')
          updateEphemeralUserMessage({
            text: msg.transcript || '',
            isFinal: true,
            status: 'final',
          })
          clearEphemeralUserMessage()
          break
        }

        /**
         * ストリーミングAI文字起こし（アシスタントの部分応答）
         */
        case 'response.audio_transcript.delta': {
          const newMessage: Conversation = {
            id: generateUniqueId(),
            role: 'assistant',
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          }

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.isFinal) {
              // 既存のアシスタント部分応答に追加
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + msg.delta,
              }
              console.log('アシスタント応答を更新:', updated[updated.length - 1].text)
              return updated
            }
            else {
              // 新しいアシスタント部分応答を開始
              console.log('新しいアシスタント応答を開始:', newMessage.text)
              return [...prev, newMessage]
            }
          })
          break
        }

        /**
         * 最後のアシスタントメッセージを最終的なものとしてマーク
         */
        case 'response.audio_transcript.done': {
          setConversation((prev) => {
            if (prev.length === 0)
              return prev
            const updated = [...prev]
            updated[updated.length - 1].isFinal = true
            console.log('アシスタント応答が完了しました')
            return updated
          })
          break
        }

        default: {
          console.warn('処理されていないメッセージタイプ:', msg.type)
          break
        }
      }

      // 常に生のメッセージをログに記録
      setMsgs(prevMsgs => [...prevMsgs, msg])
      return msg
    }
    catch (error) {
      console.error('データチャネルメッセージの処理エラー:', error)
    }
  }

  /**
   * Next.jsエンドポイントから一時的なトークンを取得
   */
  async function getEphemeralToken() {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`一時的トークンの取得に失敗: ${response.status}`)
      }
      const data = await response.json()
      return data.client_secret.value
    }
    catch (err) {
      console.error('getEphemeralTokenエラー:', err)
      throw err
    }
  }

  /**
   * マイク入力のローカル音声可視化をセットアップします（ウェーブCSSの切り替え）。
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyzer = audioContext.createAnalyser()
    analyzer.fftSize = 256
    source.connect(analyzer)

    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateIndicator = () => {
      if (!audioContext)
        return
      analyzer.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / bufferLength

      // 音量がしきい値を超えたら"active"クラスを切り替え
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle('active', average > 30)
      }
      requestAnimationFrame(updateIndicator)
    }
    updateIndicator()

    audioContextRef.current = audioContext
  }

  /**
   * アシスタントからの受信音声からRMS音量を計算
   */
  function getVolume(): number {
    if (!analyserRef.current)
      return 0
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128
      sum += float * float
    }
    return Math.sqrt(sum / dataArray.length)
  }

  /**
   * ユーザーとAIの音声を混合するためのAudioContextを設定
   */
  function setupMixedAudioContext(userStream: MediaStream): AudioContext {
    const mixedContext = new AudioContext()
    const userSource = mixedContext.createMediaStreamSource(userStream)
    const gainNode = mixedContext.createGain()
    const destination = mixedContext.createMediaStreamDestination()

    // ユーザー音声を接続
    userSource.connect(gainNode)
    gainNode.connect(destination)

    mixedAudioContextRef.current = mixedContext
    userAudioSourceRef.current = userSource
    gainNodeRef.current = gainNode
    destinationRef.current = destination

    return mixedContext
  }

  /**
   * AI音声をミックスに追加
   */
  function addAIAudioToMix(aiStream: MediaStream) {
    if (!mixedAudioContextRef.current || !gainNodeRef.current || !destinationRef.current) {
      console.warn('Mixed audio context not initialized')
      return
    }

    const aiSource = mixedAudioContextRef.current.createMediaStreamSource(aiStream)
    const aiGainNode = mixedAudioContextRef.current.createGain()

    // AI音声の音量を調整（必要に応じて）
    aiGainNode.gain.value = 1.0

    aiSource.connect(aiGainNode)
    aiGainNode.connect(destinationRef.current)

    aiAudioSourceRef.current = aiSource

    console.log('AI音声をミックスに追加しました')
  }

  /**
   * カウントダウンとセッション接続の両方が完了したら録音を開始
   */
  function checkAndStartRecording() {
    if (countdown === null && isSessionReady && audioStreamRef.current) {
      console.log('カウントダウンとセッション接続が完了、録音を開始します')
      startRecording(audioStreamRef.current)
    }
  }

  /**
   * カウントダウンを開始して録音を準備する関数
   */
  function startCountdownAndRecord() {
    console.log('録音前カウントダウンを開始します')

    let count = 3
    setCountdown(count)

    countdownIntervalRef.current = window.setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      }
      else {
        // カウントダウン終了
        setCountdown(null)
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }

        console.log('カウントダウン完了')
        // セッション接続も完了していれば録音開始
        checkAndStartRecording()
      }
    }, 1000)
  }

  /**
   * 録音を開始する関数（ユーザー+AI音声）
   */
  // mediaRecorder.onstop 内で setRecordedBlob している部分は重要なので変更なし
  function startRecording(userStream: MediaStream) {
    try {
      if (!mixedAudioContextRef.current) {
        setupMixedAudioContext(userStream)
      }
      let recordingStream = userStream
      if (destinationRef.current) {
        recordingStream = destinationRef.current.stream
      }
      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setRecordedBlob(blob)
        setStatus('finish')
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
        console.log('録音が完了しました。録音時間:', recordingDuration, '秒')
      }
      mediaRecorder.start()
      setStatus('recording')
      recordingStartTimeRef.current = Date.now()
      recordingIntervalRef.current = window.setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
          setRecordingDuration(elapsed)
        }
      }, 1000)
    }
    catch (error) {
      console.error('録音開始エラー:', error)
    }
  }
  /**
   * 録音を停止する関数
   */
  function stopRecording() {
    if (mediaRecorderRef.current && (status === 'recording' || status === 'speaking')) {
      mediaRecorderRef.current.stop()
      console.log('録音を停止しました')
    }
  }

  /**
   * 録音した音声を再生する関数
   */
  function playRecording() {
    if (recordedBlob) {
      const audioUrl = URL.createObjectURL(recordedBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }

      audio.play().catch((error) => {
        console.error('再生エラー:', error)
      })

      console.log('録音された音声を再生中...')
    }
    else {
      console.warn('再生する録音がありません')
    }
  }

  /**
   * 録音されたBlobをSupabaseにアップロードし、API経由でDBに保存する
   * @param episodeId - 保存対象のエピソードID
   * @param username - ファイルパスに使用するユーザー名
   */
  async function saveRecording(episodeId: string, username: string) { // 変更点: username引数を追加
    if (!recordedBlob) {
      alert('保存する録音データがありません。')
      return
    }
    if (isSaving)
      return

    setIsSaving(true)

    try {
    // 変更点: supabase.auth.getUser() を削除

      // --- usernameのチェック ---
      if (!username) {
        throw new Error('ユーザー名が取得できませんでした。ファイルパスを作成できません。')
      }

      // 2. ファイルパスを一意に決定 (例: username/timestamp.webm)
      const filePath = `${username}/${Date.now()}.webm` // 変更点: user.id の代わりに username を使用

      // 3. Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('recordings') // Supabaseで作成したバケット名
        .upload(filePath, recordedBlob, {
          contentType: 'audio/webm',
          upsert: false,
        })

      if (uploadError)
        throw uploadError

      // 4. アップロードしたファイルの公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(filePath)

      // 5. /api/recordings エンドポイントにデータを送信 (ここは変更なし)
      const response = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          audioUrl: publicUrl,
          duration: recordingDuration,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData)
        throw new Error(errorData.error || 'データベースへの保存に失敗しました。')
      }

      const newRecording = await response.json()
      console.log('録音情報の保存成功！:', newRecording)
      // alert('録音の保存が完了しました！') // 呼び出し元で制御するためコメントアウト
    }
    catch (error) {
      console.error('録音の保存エラー:', error)
      // エラーを再スローして、呼び出し元でキャッチできるようにする
      throw error
    }
    finally {
      setIsSaving(false)
    }
  }

  /**
   * 新しいセッションを開始:
   */
  async function startSession() {
    try {
      setStatus('connecting')
      setIsSessionReady(false)

      // セッション開始と同時にカウントダウンを開始
      startCountdownAndRecord()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      setupAudioVisualization(stream)

      // 混合音声コンテキストを事前に設定
      setupMixedAudioContext(stream)

      setStatus('connecting')
      const ephemeralToken = await getEphemeralToken()

      setStatus('connecting')
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // アシスタントのTTS受信用の非表示<audio>要素
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true

      // 受信トラック => アシスタントのTTS
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0]

        // AI音声を録音ミックスに追加
        addAIAudioToMix(event.streams[0])

        console.log('AI音声ストリームを受信しました')

        // オプション: 受信音量を測定
        const audioCtx = new (window.AudioContext || window.AudioContext)()
        const src = audioCtx.createMediaStreamSource(event.streams[0])
        const inboundAnalyzer = audioCtx.createAnalyser()
        inboundAnalyzer.fftSize = 256
        src.connect(inboundAnalyzer)
        analyserRef.current = inboundAnalyzer

        // 音量モニタリングを開始
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume())
        }, 100)
      }

      // 文字起こし用のデータチャネル
      const dataChannel = pc.createDataChannel('response')
      dataChannelRef.current = dataChannel

      dataChannel.onopen = () => {
        console.log('データチャネル開通')
        configureDataChannel(dataChannel)

        // セッション開始時に会話履歴に初期メッセージを追加
        setConversation([{
          id: generateUniqueId(),
          role: 'system',
          text: 'カウントダウン後に録音を開始します。',
          timestamp: new Date().toISOString(),
          isFinal: true,
        }])
      }
      dataChannel.onmessage = handleDataChannelMessage

      // ローカルマイクトラックを追加
      pc.addTrack(stream.getTracks()[0])

      // オファーを作成しローカル記述を設定
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // SDPオファーをOpenAI Realtimeに送信
      const baseUrl = 'https://api.openai.com/v1/realtime'
      const model = 'gpt-4o-realtime-preview-2024-12-17'
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
      })

      // リモート記述を設定
      const answerSdp = await response.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsSessionActive(true)
      setStatus('connected')

      // セッション接続完了をマーク
      setIsSessionReady(true)
      console.log('セッション接続完了')

      // カウントダウンも完了していれば録音開始
      checkAndStartRecording()

      // 録音は AI音声を受信してから開始（pc.ontrackで実行）
    }
    catch (err) {
      console.error('startSessionエラー:', err)
      setStatus('error')
      stopSession()
    }
  }

  /**
   * セッションを停止してクリーンアップ
   */
  function stopSession() {
    // 録音を停止
    stopRecording()

    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    // 混合音声コンテキストをクリーンアップ
    if (mixedAudioContextRef.current) {
      mixedAudioContextRef.current.close()
      mixedAudioContextRef.current = null
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove('active')
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current)
      volumeIntervalRef.current = null
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    // 音声ミックス関連の参照をクリア
    userAudioSourceRef.current = null
    aiAudioSourceRef.current = null
    gainNodeRef.current = null
    destinationRef.current = null

    analyserRef.current = null
    mediaRecorderRef.current = null
    recordingStartTimeRef.current = null

    ephemeralUserMessageIdRef.current = null

    setCurrentVolume(0)
    setIsSessionActive(false)
    setIsSessionReady(false)
    setStatus('disconnected')
    setMsgs([])
    setConversation([])
    setCountdown(null)
  }

  /**
   * 単一のボタンから開始/停止を切り替え
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession()
    }
    else {
      startSession()
    }
  }

  // 会話状態が変更されたときにデバッグログを出力
  useEffect(() => {
    if (conversation.length > 0) {
      console.log('会話状態が更新されました:', conversation)
    }
  }, [conversation])

  // カウントダウンまたはセッション準備状態が変更されたときに録音開始をチェック
  useEffect(() => {
    checkAndStartRecording()
  }, [countdown, isSessionReady])

  // アンマウント時のクリーンアップ
  useEffect(() => {
    return () => stopSession()
  }, [])

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    msgs,
    currentVolume,
    conversation,
    recordedBlob,
    playRecording,
    recordingDuration,
    countdown,
    isSaving,
    saveRecording,
  }
}
