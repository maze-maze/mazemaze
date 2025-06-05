
import { auth } from '🎙️/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserPage } from '🎙️/components/features/user'

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <UserPage name={session.user.name} />
  )
}
