import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { theme, character } = await req.json()

    // テーマが指定されていない場合はエラー
    if (!theme) {
      return Response.json({ error: 'Theme is required' }, { status: 400 })
    }

    // character情報の整形（オプショナル）
    let characterInfo = null
    if (character) {
      try {
        characterInfo
          = typeof character === 'string' ? JSON.parse(character) : character
      }
      catch (e) {
        console.error('Error parsing character info:', e)
        // 解析エラー時は無視して続行
      }
    }

    // キャラクター情報を考慮した追加プロンプト
    const characterPrompt = characterInfo
      ? `また、パーソナリティは「${characterInfo.name}」(${characterInfo.description})です。
         ${characterInfo.name}の話し方のトーン: ${characterInfo.tone}
         この話し手の個性に合った構成を考えてください。`
      : ''

    const prompt = `
    あなたは、ポッドキャストの構成を設計するプロフェッショナルです。
    テーマ「${theme}」のポッドキャストの構成を考えてください。
    ${characterPrompt}
    
    以下の構成要素を含めてください：
    1. イントロ：ポッドキャストの導入部分
    2. セクション：3～5個のトピック
    3. アウトロ：ポッドキャストの締めくくり
    
    以下の形式でJSON形式で回答してください:
    
    {
      "intro": "イントロの内容説明",
      "sections": [
        "セクション1のタイトル",
        "セクション2のタイトル", 
        "セクション3のタイトル"
      ],
      "outro": "アウトロの内容説明"
    }
    
    JSONのみを返してください。余分な説明文は不要です。
    `

    console.log('Generating structure for theme:', theme)

    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        temperature: 0.7,
        maxOutputTokens: 1000,
      })

      console.log(
        'Response from generateText:',
        `${text?.substring(0, 100)}...`,
      )

      // テキストからJSONを抽出する（前後の余分なテキストを削除）
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      try {
        // JSONとしてパース
        const structure = JSON.parse(jsonText)
        console.log('Successfully parsed structure')

        // 必要なフィールドがあるか検証
        if (
          !structure.intro
          || !Array.isArray(structure.sections)
          || !structure.outro
        ) {
          console.warn(
            'Structure missing required fields, using default structure',
          )
          return Response.json(getDefaultStructure(theme, characterInfo))
        }

        return Response.json(structure)
      }
      catch (parseError) {
        console.error('JSON parse error:', parseError)
        // JSONパースに失敗した場合、テキストから構造を抽出
        return Response.json(extractStructureFromText(text, theme))
      }
    }
    catch (aiError) {
      console.error('Error calling AI:', aiError)
      return Response.json(getDefaultStructure(theme, characterInfo))
    }
  }
  catch (error) {
    console.error('General error in structure API:', error)
    return Response.json(getDefaultStructure('一般的なトピック', null))
  }
}

// テキストから構造を抽出する関数
function extractStructureFromText(
  text: string,
  theme: string,
): { intro: string, sections: string[], outro: string } {
  // イントロを抽出
  const introPattern = /イントロ[:：]?\s*([^\n]+(?:\n(?!\S+[:：])[^\n]+)*)/
  const introMatch = text.match(introPattern)
  const intro = introMatch
    ? introMatch[1].trim()
    : `テーマ「${theme}」についての紹介`

  // セクションを抽出（様々なパターンを試す）
  let sections: string[] = []

  // パターン1: セクション1: タイトル
  const sectionPattern1 = /セクション\d+[:：]?\s*([^\n]+)/g
  let sectionMatch1
  while ((sectionMatch1 = sectionPattern1.exec(text)) !== null) {
    if (sectionMatch1[1]) {
      sections.push(sectionMatch1[1].trim())
    }
  }

  // パターン2: 1. タイトル 形式
  if (sections.length === 0) {
    const sectionPattern2 = /\d+\.?\s*([^\n]+)/g
    let sectionMatch2
    while ((sectionMatch2 = sectionPattern2.exec(text)) !== null) {
      if (
        sectionMatch2[1]
        && !sectionMatch2[1].includes('イントロ')
        && !sectionMatch2[1].includes('アウトロ')
      ) {
        sections.push(sectionMatch2[1].trim())
      }
    }
  }

  // アウトロを抽出
  const outroPattern = /アウトロ[:：]?\s*([^\n]+(?:\n(?!\S+[:：])[^\n]+)*)/
  const outroMatch = text.match(outroPattern)
  const outro = outroMatch ? outroMatch[1].trim() : 'まとめと次回の予告'

  // セクションが空の場合はデフォルト
  if (sections.length === 0) {
    sections = [
      'テーマの背景と重要性',
      '主要な論点とディスカッション',
      'まとめと今後の展望',
    ]
  }

  return {
    intro,
    sections,
    outro,
  }
}

// デフォルトの構造を返す関数
function getDefaultStructure(
  theme: string,
  character: { name: string, description: string, tone: string } | null,
): { intro: string, sections: string[], outro: string } {
  const characterName = character ? character.name : 'ホスト'

  return {
    intro: `こんにちは、${characterName}です。今回のポッドキャストでは「${theme}」について掘り下げていきます。このテーマは多くの人にとって興味深い内容です。さあ、始めましょう。`,
    sections: [
      `${theme}の背景と基本情報`,
      `${theme}に関する重要なポイントや課題`,
      `${theme}の未来と可能性`,
    ],
    outro: `今回の「${theme}」についてのポッドキャストはいかがでしたか？次回もお楽しみに。ご視聴ありがとうございました。`,
  }
}
