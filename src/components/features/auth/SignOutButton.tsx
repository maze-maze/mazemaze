"use client"
import { Button } from "🎙️/components/ui/button"
import {  signOut } from "🎙️/lib/auth-client"

export const SignOutButton = () => {
  return (
    <Button
    onClick={() => signOut()}
          type="submit"
          size="lg"
          variant="outline"
         
          className="cursor-pointer"
        >
          Sign Out
        </Button>
  )
}
