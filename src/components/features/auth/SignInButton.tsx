'use client'
import { Button } from '🎙️/components/ui/button'
import { signIn } from '🎙️/lib/auth-client'

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn('/enter/callback/welcome')}
      type="submit"
      size="lg"
      variant="outline"
      className="cursor-pointer bg-white/10 w-full backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
    >
      Sign In With Github
    </Button>
  )
}
