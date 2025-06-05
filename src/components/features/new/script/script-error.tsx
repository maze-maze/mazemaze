/* eslint-disable unused-imports/no-unused-vars */
'use client'

import React from 'react'

interface Props {
  message: string
}

export default function ScriptError({ message }: Props) {
  return (
    <div className="text-red-500 bg-red-900/30 border border-red-500/50 p-3 rounded-md mb-4 w-full max-w-2xl">
      {message}
    </div>
  )
}
