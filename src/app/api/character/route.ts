/* eslint-disable no-cond-assign */
/* eslint-disable no-console */
import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json()

    // テーマが指定されていない場合はエラー
    if (!theme) {
      return Response.json({ error: 'Theme is required' }, { status: 400 })
    }

    const prompt = `
あなたは、ポッドキャストの面白い人格（パーソナリティ）を考えるプロフェッショナルです。
テーマ「${theme}」のポッドキャストに最適な話し手の人格を3つ考えてください。

各人格について、以下の項目を必ず含めてください：
1. 名前：人格の名前（架空の名前で結構です）
2. 説明：個性、背景、専門性などの詳細
3. トーン：話し方の特徴や使用する言葉遣いなど

以下の形式で回答してください:
[
  {
    "name": "人格1の名前",
    "description": "人格1の説明",
    "tone": "人格1のトーン"
  },
  {
    "name": "人格2の名前",
    "description": "人格2の説明",
    "tone": "人格2のトーン"  
  },
  {
    "name": "人格3の名前",
    "description": "人格3の説明",
    "tone": "人格3のトーン"
  }
]
`

    console.log('Generating personalities for theme:', theme)

    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        temperature: 0.7,
        maxTokens: 9000,
      })

      console.log(
        'Response from generateText:',
        `${text?.substring(0, 100)}...`,
      )

      // テキストからJSONを抽出する（前後の余分なテキストを削除）
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      try {
        // JSONとしてパース
        const personalities = JSON.parse(jsonText)
        console.log('Successfully parsed personalities:', personalities.length)
        return Response.json(personalities)
      }
      catch (parseError) {
        console.error('JSON parse error:', parseError)
        // JSONパースに失敗した場合、テキストから構造を抽出
        return Response.json(extractPersonalitiesFromText(text, theme))
      }
    }
    catch (aiError) {
      console.error('Error calling AI:', aiError)
      return Response.json(getDefaultPersonalities(theme))
    }
  }
  catch (error) {
    console.error('General error in character API:', error)
    return Response.json(getDefaultPersonalities('一般的なトピック'))
  }
}

// テキストから人格を抽出する関数
function extractPersonalitiesFromText(
  text: string,
  theme: string,
): Array<{ name: string, description: string, tone: string }> {
  const personalities = []

  // 名前パターン
  const namePattern = /名前[:：]?\s*[「『]?([^「『」』\n]+)[」』]?/g
  // 説明パターン
  const descPattern = /説明[:：]?\s*([^\n]+(?:\n(?!\S+[:：])[^\n]+)*)/g
  // トーンパターン
  const tonePattern = /トーン[:：]?\s*([^\n]+(?:\n(?!\S+[:：])[^\n]+)*)/g

  let nameMatch
  const names = []
  while ((nameMatch = namePattern.exec(text)) !== null) {
    names.push(nameMatch[1].trim())
  }

  let descMatch
  const descriptions = []
  while ((descMatch = descPattern.exec(text)) !== null) {
    descriptions.push(descMatch[1].trim())
  }

  let toneMatch
  const tones = []
  while ((toneMatch = tonePattern.exec(text)) !== null) {
    tones.push(toneMatch[1].trim())
  }

  // 3つの人格を作成（データが足りない場合はデフォルト値で補完）
  for (let i = 0; i < 3; i++) {
    personalities.push({
      name: names[i] || `パーソナリティ${i + 1}`,
      description: descriptions[i] || `${theme}に詳しい話し手`,
      tone: tones[i] || '自然で親しみやすい話し方',
    })
  }

  return personalities
}

// デフォルトの人格を返す関数
function getDefaultPersonalities(theme: string) {
  return [
    {
      name: 'テック・エンスージアスト',
      description: `${theme}に精通し、わかりやすく説明するのが得意なテクノロジー愛好家です。最新の動向や専門知識を持ちながらも、専門用語を一般の方にも理解しやすく噛み砕いて伝えることができます。`,
      tone: '明るく情熱的で、時に冗談を交えながら、専門用語は必ず解説します',
    },
    {
      name: 'フィロソフィカル・マインド',
      description: `${theme}の哲学的側面を掘り下げ、深い考察を提供する思想家タイプです。多角的な視点からテーマの本質に迫り、リスナーに新しい気づきを与えます。`,
      tone: '落ち着いた口調で、時折ユーモアを交えた知的な話し方、問いかけを多用します',
    },
    {
      name: 'エブリデイ・エクスプローラー',
      description: `一般人の視点から${theme}について好奇心旺盛に様々な疑問を投げかける探求者です。リスナーが思いつく疑問をいち早く代弁し、専門家やゲストから回答を導き出します。`,
      tone: '親しみやすく会話的、「なるほど！」「へぇ〜」など感嘆詞を多用し、質問が上手です',
    },
  ]
}
