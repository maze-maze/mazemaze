// src/components/complete-page/info-card.tsx
'use client'

import React from 'react'

interface InfoCardProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}

export default function InfoCard({
  title,
  icon: Icon,
  children,
}: InfoCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 text-white mb-4 w-full">
      <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center border-b border-white/10 pb-3">
        <Icon size={20} className="mr-3 text-primary" />
        {title}
      </h3>
      <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
