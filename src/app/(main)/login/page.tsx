import SignInPage from '🎙️/components/features/auth/SignInPage'
import { env } from '🎙️/env.mjs'
import { auth } from '🎙️/lib/auth'
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

  // ② セッションがある場合、username を取得
  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/me/username`, {
    method: 'GET',
    headers: new Headers(await headers()), // cookieを引き継ぐ
    cache: 'no-store',
  })

  const { username } = await res.json()

  // ③ username の有無で分岐
  if (!username) {
    redirect('/enter/callback/welcome')
  }
  else {
    redirect(`/${username}`)
  }
}
