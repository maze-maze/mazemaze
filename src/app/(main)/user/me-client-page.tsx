// app/me/me-client-page.tsx
'use client' // ★ クライアントコンポーネントであることを明示

import Background from '🎙️/components/features/layout/backgeound'
import Header from '🎙️/components/features/layout/header'
import { StorageKeys } from '🎙️/lib/storage-keys'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  username: string
}

export default function MePageClient({ username }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (username) {
      // sessionStorageに値を保存
      sessionStorage.setItem(StorageKeys.USERNAME, username)

      // 保存後にユーザーページへリダイレクト
      router.replace(`/${username}`)
    }
  }, [username, router])

  // リダイレクトが実行されるまでの間、ローディング表示などをすることも可能
  return (
    <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full">
      <Header />
      <Background />
      <div className="w-full flex flex-1 items-center justify-center mb-20">
        <Loader2 className="animate-spin size-15" />
      </div>
    </div>
  )
}
