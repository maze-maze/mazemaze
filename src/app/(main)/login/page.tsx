import SignInPage from '🎙️/components/features/auth/SignInPage'
import { auth } from '🎙️/lib/auth'
import { client } from '🎙️/lib/hono'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // ① セッションがない場合はログインページ表示
  if (!session || !session.user?.id) {
    return <SignInPage />
  }

  // ② username を API 経由で取得
  const res = await client.api.me.username.$get(
    {},
    {
      init: {
        headers: await headers(),
      },
    },
  )

  const data = await res.json()

  // ③ username の有無で分岐
  if (!data || !data.username) {
    redirect('/enter/callback/welcome')
  }
  else {
    redirect(`/${data.username}`)
  }
}
