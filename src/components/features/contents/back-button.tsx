import { ChevronLeftIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function BackButton({ userId }: { userId: string }) {
  return (
    <Link href={`/${userId}`} className="text-white">
      <ChevronLeftIcon className="size-12" />
    </Link>
  )
}
