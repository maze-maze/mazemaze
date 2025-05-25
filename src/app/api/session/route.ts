/* eslint-disable node/prefer-global/process */
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`OPENAI_API_KEY is not set`)
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        modalities: ['audio', 'text'],
        instructions: '「こんにちは、今日はどのようなご用件でしょうか」と言ってユーザーと会話を始めてください。',
      }),
    })

    if (!response.ok) {
      console.error('API request failed:', response)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  }
  catch (error) {
    console.error('Error fetching session data:', error)
    return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 })
  }
}
