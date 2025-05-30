type Status = 'idle' | 'connecting' | 'connected' | 'speaking' | 'recording' | 'finish' | 'error' | 'disconnected'

interface Conversation {
  id: string // Unique ID for react rendering and logging purposes
  role: string // "user" or "assistant"
  text: string // User or assistant message
  timestamp: string // ISO string for message time
  isFinal: boolean // Whether the transcription is final
  status?: 'speaking' | 'processing' | 'final' // Status for real-time conversation states
}

export type { Conversation, Status }
