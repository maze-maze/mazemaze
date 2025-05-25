/* eslint-disable unused-imports/no-unused-vars */
'use client'

import { useLocationState } from '@location-state/core'
import { StorageKeys } from '🎙️/lib/storage-keys'

import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'

export default function NewTmp() {
  const [name, setName] = useQueryState('s')
  // nameが空の場合は'theme'扱い
  const step = name || 'theme'

  const [title, setTitle] = useLocationState<string>({
    name: StorageKeys.TITLE,
    storeName: 'session',
    defaultValue: '',
  })
  const [character, setCharacter] = useLocationState<string>({
    name: StorageKeys.CHARACTER,
    storeName: 'session',
    defaultValue: '',
  })
  const [script, setScript] = useLocationState<string>({
    name: StorageKeys.SCRIPT,
    storeName: 'session',
    defaultValue: '',
  })

  const router = useRouter()

  return (
    <main>
      <div>
        <p>Current values:</p>
        <p>
          Title:
          {title}
        </p>
        <p>
          Character:
          {character}
        </p>
        <p>
          Script:
          {script}
        </p>
      </div>

      <button
        onClick={async () => {
          setTitle('test title')
          setCharacter('test character')
          setScript('test script')

          // 状態の更新を待つためにより長い遅延を設ける
          await new Promise(resolve => setTimeout(resolve, 500))

          router.push('/new/recording')
        }}
      >
        OK
      </button>
    </main>
  )
}
