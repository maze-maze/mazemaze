import { useEffect, useState } from 'react'

export function useRecordingScripts() {
  const [data, setData] = useState<{
    title: string
    character: string
    script: string
  }>({
    title: '',
    character: '',
    script: '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // セッションストレージから__location_state_*キーを検索
      const locationStateKey = Object.keys(sessionStorage).find(key =>
        key.startsWith('__location_state_'),
      )

      if (locationStateKey) {
        try {
          const sessionData = JSON.parse(sessionStorage.getItem(locationStateKey) || '{}')
          setData({
            title: sessionData.title || '',
            character: sessionData.character || '',
            script: sessionData.script || '',
          })
        }
        catch (error) {
          console.error('Failed to parse session data:', error)
        }
      }
    }
  }, [])

  return {
    title: data.title,
    character: 'character',
    script: data.script,
  }
}
