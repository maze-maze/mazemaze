'use client'
import { Button } from '🎙️/components/ui/button'
import { signOut } from '🎙️/lib/auth-client'

export function SignOutButton() {
  return (
    <Button
      onClick={() => signOut('/user')}
      type="submit"
      size="lg"
      variant="outline"

      className="cursor-pointer"
    >
      Sign Out
    </Button>
  )
}
