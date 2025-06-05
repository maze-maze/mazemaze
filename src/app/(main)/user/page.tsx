// app/me/page.tsx

import { env } from '🎙️/env.mjs'
import { auth } from '🎙️/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user?.id) {
    redirect('/login')
  }

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/me/username`, {
    method: 'GET',
    headers: new Headers(await headers()),
    cache: 'no-store',
  })

  const { username } = await res.json()

  if (!username) {
    redirect(`/enter/callback/welcome`)
  }
  else {
    redirect(`/${username}`)
  }
}
