import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 45 // Increase time limit for script generation

export async function POST(req: Request) {
  const { theme, character, structure, messages } = await req.json()

  // messagesの形式をバリデーション
  if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) {
    return new Response('Invalid messages format', { status: 400 })
  }

  // 必須パラメータのバリデーション - これらは実際にはチャットには必須ではない
  // しかし、これらがある場合はシステムプロンプトに追加する

  // キャラクター情報を含めるかどうか
  let characterInfo = null
  if (character) {
    try {
      characterInfo
        = typeof character === 'string' ? JSON.parse(character) : character
    }
    catch (e) {
      console.error('Error parsing character in chat:', e)
    }
  }

  // 構造情報を含めるかどうか
  let structureInfo = null
  if (structure) {
    try {
      structureInfo
        = typeof structure === 'string' ? JSON.parse(structure) : structure
    }
    catch (e) {
      console.error('Error parsing structure in chat:', e)
    }
  }

  // キャラクター情報のプロンプト
  let characterPrompt = ''
  if (characterInfo) {
    characterPrompt = `
パーソナリティ: ${characterInfo.name}
説明: ${characterInfo.description}
トーン: ${characterInfo.tone}`
  }

  // 構造情報のプロンプト
  let structurePrompt = ''
  if (structureInfo) {
    const sectionsList = Array.isArray(structureInfo.sections)
      ? structureInfo.sections
          .map((section: any, index: number) => `セクション${index + 1}: ${section}`)
          .join('\n')
      : ''

    structurePrompt = `
構成:
イントロ: ${structureInfo.intro}
${sectionsList}
アウトロ: ${structureInfo.outro}`
  }

  // システムプロンプトを作成
  const systemPrompt = {
    role: 'system',
    content: `あなたはポッドキャストのスクリプト作成を支援するAIアシスタントです。
テーマ「${
  theme || '一般的なトピック'
}」についてのポッドキャストスクリプト作成をサポートします。
${characterPrompt}
${structurePrompt}

ユーザーがスクリプトについて質問したり、改善を依頼した場合は、詳細なアドバイスを提供してください。
ポッドキャストスクリプトには以下の要素が含まれると良いでしょう：
1. 自己紹介、ポッドキャストの目的、エピソードの概要などを含むイントロ
2. 各セクションでテーマの異なる側面を掘り下げる本体部分
3. 要点のまとめ、次回予告、リスナーへの呼びかけなどを含むアウトロ

ユーザーが新しいスクリプトの生成を依頼した場合は、指定されたテーマ、パーソナリティ、構成に沿って、
5〜10分程度で読み上げられる長さの完全なスクリプトを提供してください。`,
  }

  // 既存のシステムメッセージを置き換え、または先頭に追加
  const filteredMessages = messages.filter(m => m.role !== 'system')
  const fullMessages = [systemPrompt, ...filteredMessages]

  try {
    // ストリーミングレスポンスを生成
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: fullMessages,
      temperature: 0.7,
      maxTokens: 4096, // 長めのスクリプトを生成できるように
    })

    // 公式ドキュメント通りにストリーミングレスポンスを返す
    return result.toDataStreamResponse()
  }
  catch (error) {
    console.error('Error in script chat API:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate script suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
