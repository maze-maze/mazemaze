import React from 'react'

export default function Countdown({ seconds }: { seconds: number }) {
  return (
    <div className="fixed bottom-40 right-1/2 translate-x-1/2 z-30 border-2 border-white p-3 rounded-full size-20 flex items-center justify-center bg-black/50 backdrop-blur">
      <span className="text-white text-2xl font-bold">
        {seconds}
      </span>
    </div>
  )
}
