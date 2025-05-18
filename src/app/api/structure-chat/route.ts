import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { theme, character, messages } = await req.json()

  // messagesの形式をバリデーション
  if (!Array.isArray(messages) || !messages.every(m => m.role && m.content)) {
    return new Response('Invalid messages format', { status: 400 })
  }

  // キャラクター情報を含めるかどうか
  const characterInfo = character
    ? typeof character === 'string'
      ? JSON.parse(character)
      : character
    : null

  // キャラクター情報のプロンプト
  const characterPrompt = characterInfo
    ? `また、このポッドキャストのパーソナリティは「${characterInfo.name}」です。
       説明: ${characterInfo.description}
       トーン: ${characterInfo.tone}
       
       このパーソナリティの個性に合った構成を提案してください。`
    : ''

  // システムプロンプトを作成
  const systemPrompt = {
    role: 'system',
    content: `あなたはポッドキャストの構成を設計するエキスパートです。
ユーザーが選んだテーマ「${
  theme || '一般的なトピック'
}」について話すポッドキャストの構成を提案してください。
${characterPrompt}

ユーザーと対話しながら、最適な構成を一緒に作り上げてください。

提案する構成は以下の要素を含めるようにしてください：
1. イントロ：ポッドキャストの導入部分
2. セクション：ポッドキャストの本体部分（3〜5個程度のセクション）
3. アウトロ：ポッドキャストの締めくくり

提案する際は、以下のフォーマットを使用してください：
## ポッドキャスト構成案

**イントロ**: [ポッドキャストの導入部分の内容]

**セクション1**: [最初のセクションのタイトル]
**セクション2**: [2番目のセクションのタイトル]
**セクション3**: [3番目のセクションのタイトル]

**アウトロ**: [ポッドキャストの締めくくりの内容]

テーマに合わせて、興味深く論理的な流れになるよう構成してください。
ユーザーが構成について質問したり、変更を依頼したりした場合は、柔軟に対応してください。`,
  }

  // 既存のシステムメッセージを置き換え、または先頭に追加
  const filteredMessages = messages.filter(m => m.role !== 'system')
  const fullMessages = [systemPrompt, ...filteredMessages]

  try {
    // ストリーミングレスポンスを生成
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: fullMessages,
    })

    // 公式ドキュメント通りにストリーミングレスポンスを返す
    return result.toDataStreamResponse()
  }
  catch (error) {
    console.error('Error in structure chat API:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate structure suggestions',
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
