import { auth } from '🎙️/lib/auth'
import { client } from '🎙️/lib/hono'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import NabigationBar from './nabigation-bar'

export default async function NabigationBarContainer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user?.id) {
    redirect('/login')
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
  const username = data?.username || null

  return (
    <NabigationBar isSession={!session} username={username} />
  )
}
