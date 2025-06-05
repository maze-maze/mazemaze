// app/me/page.tsx

import { env } from '🎙️/env.mjs'
import { auth } from '🎙️/lib/auth'
import { client } from '🎙️/lib/hono'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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

  if (!username) {
    redirect(`/enter/callback/welcome`)
  }
  else {
    redirect(`/${username}`)
  }
}
