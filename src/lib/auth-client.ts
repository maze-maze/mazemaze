import { createAuthClient } from "better-auth/client"
export const authClient =  createAuthClient()
 
export const signIn = async (callbackURL: string) => {
    const data = await authClient.signIn.social({
        provider: "github",
        callbackURL
    })
}

export const signOut = async () => {
  await authClient.signOut()
}
