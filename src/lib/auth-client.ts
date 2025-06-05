import { createAuthClient } from 'better-auth/client'
import { redirect } from 'next/navigation'

export const authClient = createAuthClient()

export async function signIn(callbackURL: string) {
  const _data = await authClient.signIn.social({
    provider: 'github',
    callbackURL,
  })
}

export async function signOut(callbackURL: string) {
  await authClient.signOut({

    fetchOptions: {
      onSuccess: () => {
        redirect(callbackURL) // redirect to login page
      },
    },
  },
  )
}
