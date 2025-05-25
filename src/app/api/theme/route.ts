/* eslint-disable unused-imports/no-unused-vars */
import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  const { topic, requestType } = await req.json()

  let prompt = ''

  // リクエストタイプに応じてプロンプトを変更
  if (topic) {
    // キーワードが指定されている場合は関連テーマを生成
    prompt = `「${topic}」に関連するポッドキャストのテーマを6つ提案してください。以下のルールに従ってください：
1. シンプルにテーマ名のリストのみを返してください
2. 各テーマは1行に1つずつ記載してください
3. 番号を付ける場合は「1. テーマ名」の形式で
4. 説明や解説は不要です
5. 斬新で興味を引くテーマを考えてください
6. テーマは10～20文字程度が理想的です

例：
1. ${topic}が変える未来の働き方
2. ${topic}と心の関係性
3. 誰も知らない${topic}の秘密
4. ${topic}から学ぶサバイバル術
5. ${topic}と異文化コミュニケーション
6. 次世代の${topic}とその可能性`
  }
  else {
    // キーワードがない場合はランダムな面白いテーマを生成
    prompt = `面白いポッドキャストのテーマを6つ提案してください。以下のルールに従ってください：
1. シンプルにテーマ名のリストのみを返してください
2. 各テーマは1行に1つずつ記載してください
3. 番号を付ける場合は「1. テーマ名」の形式で
4. 説明や解説は不要です
5. 斬新で多様なジャンルのテーマを考えてください
6. SF、哲学、カルチャー、未来予測、異文化、日常の不思議など幅広いテーマが望ましい
7. テーマは10～20文字程度が理想的です

例：
1. 猫がもしも人間社会を支配したら
2. 100年後の人類の驚くべき進化
3. もしも歴史上の偉人たちが現代にタイムスリップしたら
4. 世界の終わりを生き抜くための究極のサバイバル術講座
5. あなたのペットが実は宇宙人だったとしたら
6. AI時代における人間の創造性の未来`
  }

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt,
      temperature: 0.8, // 多様なテーマを生成するために温度を上げる
      maxTokens: 9000,
    })

    // テキストからテーマを抽出
    const extractedThemes = extractThemesFromText(text)

    // 抽出したテーマを返す（最大6つ）
    return Response.json(extractedThemes.slice(0, 6))
  }
  catch (error) {
    console.error('Error generating themes:', error)

    // エラー時のフォールバックテーマ
    const fallbackThemes = [
      '猫がもしも人間社会を支配したら',
      '100年後の人類の驚くべき進化',
      'もしも歴史上の偉人たちが現代にタイムスリップしたら',
      '世界の終わりを生き抜くための究極のサバイバル術講座',
      'あなたのペットが実は宇宙人だったとしたら',
      'AI時代における人間の創造性の未来',
    ]

    return Response.json(
      topic
        ? fallbackThemes.map(theme => theme.replace(/猫|AI|ペット/, topic))
        : fallbackThemes,
    )
  }
}

// テキストからテーマリストを抽出する関数
function extractThemesFromText(text: string): string[] {
  // 改行、カンマ、箇条書きなどで区切られたテーマを抽出
  const lines = text.split(/\n+/)
  const extractedThemes: string[] = []

  for (const line of lines) {
    // 箇条書き記号を削除
    let cleanedLine = line.replace(/^[-•*]\s*/, '').trim()

    // 番号形式（1. テーマ名）を削除
    cleanedLine = cleanedLine.replace(/^\d+[.:]?\s*/, '')

    // 引用符を削除
    cleanedLine = cleanedLine.replace(/[「」『』"]/g, '')

    // 空行やごく短い行は無視
    if (cleanedLine.length > 5) {
      extractedThemes.push(cleanedLine)
    }
  }

  return extractedThemes
}
