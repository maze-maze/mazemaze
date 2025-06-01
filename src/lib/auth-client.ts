import { createAuthClient } from "better-auth/client"
import { redirect } from "next/navigation"

export const authClient =  createAuthClient()
 
export const signIn = async (callbackURL: string) => {
    const data = await authClient.signIn.social({
        provider: "github",
        callbackURL
    })
}

export const signOut = async (callbackURL: string) => {
  await authClient.signOut({

    fetchOptions: {
      onSuccess: () => {
        redirect(callbackURL); // redirect to login page
      },
    },
  }
  )
}
