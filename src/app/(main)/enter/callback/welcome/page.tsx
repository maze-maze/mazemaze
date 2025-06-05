import PostUserName from '🎙️/components/features/auth/PostUserName'
import Background from '🎙️/components/features/layout/backgeound'
import Header from '🎙️/components/features/layout/header'
import { auth } from '🎙️/lib/auth'
import { client } from '🎙️/lib/hono'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // ① セッションなし → /login にリダイレクト
  if (!session || !session.user?.id) {
    redirect('/login')
  }

  // ② username を API 経由で取得
  const res = await client.api.me.username.$get({}, {
    headers: {
      ...Object.fromEntries((await headers()).entries()),
      'Cache-Control': 'no-store',
    },
  })

  const username = await res.json()

  // ③ username がすでにあるなら直接そのページへ
  if (username) {
    redirect(`/${username}`)
  }

  return (
    <>
      <div className="relative bg-[#0E0B16] min-h-screen flex flex-col items-center w-full h-full">
        <Header />
        <Background />
        <PostUserName />
      </div>
    </>
  )
}
