import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { theme, mainCharacter, guestCharacter } = await req.json()

    // テーマが指定されていない場合はエラー
    if (!theme) {
      return Response.json({ error: 'Theme is required' }, { status: 400 })
    }

    // キャラクター情報の整形（オプショナル）
    let mainCharacterInfo = null
    if (mainCharacter) {
      try {
        mainCharacterInfo = typeof mainCharacter === 'string' ? JSON.parse(mainCharacter) : mainCharacter
      }
      catch (e) {
        console.error('Error parsing main character info:', e)
      }
    }

    let guestCharacterInfo = null
    if (guestCharacter) {
      try {
        guestCharacterInfo = typeof guestCharacter === 'string' ? JSON.parse(guestCharacter) : guestCharacter
      }
      catch (e) {
        console.error('Error parsing guest character info:', e)
      }
    }

    // キャラクター情報を考慮した追加プロンプト
    let charactersPrompt = ''
    if (mainCharacterInfo || guestCharacterInfo) {
      charactersPrompt = `以下のパーソナリティを考慮して構成を考えてください：\n`
      if (mainCharacterInfo) {
        charactersPrompt += `- メインパーソナリティ: ${mainCharacterInfo.name} (${mainCharacterInfo.description}) トーン: ${mainCharacterInfo.tone}\n`
      }
      if (guestCharacterInfo) {
        charactersPrompt += `- ゲストパーソナリティ: ${guestCharacterInfo.name} (${guestCharacterInfo.description}) トーン: ${guestCharacterInfo.tone}\n`
      }
    }

    const prompt = `
    あなたは、ポッドキャストの構成を設計するプロフェッショナルです。
    テーマ「${theme}」のポッドキャストの構成を考えてください。
    ${charactersPrompt}
    
    以下の構成要素を含めてください：
    1. イントロ：ポッドキャストの導入部分
    2. セクション：3～5個のトピック。各セクションにはタイトルと具体的な内容や説明を含めてください。
    3. アウトロ：ポッドキャストの締めくくり
    
    以下の形式でJSON形式で回答してください:
    
    {
      "intro": "イントロの内容説明",
      "sections": [
        { "title": "セクション1のタイトル", "description": "セクション1の具体的な内容や説明" },
        { "title": "セクション2のタイトル", "description": "セクション2の具体的な内容や説明" },
        { "title": "セクション3のタイトル", "description": "セクション3の具体的な内容や説明" }
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
        maxTokens: 1000,
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
          return Response.json(getDefaultStructure(theme, mainCharacterInfo, guestCharacterInfo))
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
      return Response.json(getDefaultStructure(theme, mainCharacterInfo, guestCharacterInfo))
    }
  }
  catch (error) {
    console.error('General error in structure API:', error)
    return Response.json(getDefaultStructure('一般的なトピック', null, null))
  }
}

// テキストから構造を抽出する関数
function extractStructureFromText(
  text: string,
  theme: string,
): { intro: string, sections: { title: string, description: string }[], outro: string } {
  // イントロを抽出
  const introPattern = /イントロ[:：]?\s*([^\n]+(?:\n(?!\S+[:：])[^\n]+)*)/
  const introMatch = text.match(introPattern)
  const intro = introMatch
    ? introMatch[1].trim()
    : `テーマ「${theme}」についての紹介`

  // セクションを抽出（様々なパターンを試す）
  let sections: { title: string, description: string }[] = []

  // 抽出ロジックを改善してタイトルと説明をペアで取得
  // 簡単な正規表現で「N. タイトル\n説明...」のような形式を想定
  const complexSectionPattern = /(\d+)\.\s*([^\n]+)\n([\s\S]*?)(?=\n\d+\. |\n\n|アウトロ[:：]|$)/g
  let complexMatch
  while ((complexMatch = complexSectionPattern.exec(text)) !== null) {
    if (complexMatch[2] && complexMatch[3]) {
      sections.push({ title: complexMatch[2].trim(), description: complexMatch[3].trim() })
    }
  }

  // JSONパースに失敗した場合のフォールバックとして、タイトルのみを抽出する旧ロジックも残す（ただしsectionsの型は合わせる）
  if (sections.length === 0) {
    const simpleSectionPattern = /セクション\d+[:：]?\s*([^\n]+)/g
    let simpleMatch
    while ((simpleMatch = simpleSectionPattern.exec(text)) !== null) {
      if (simpleMatch[1]) {
        sections.push({ title: simpleMatch[1].trim(), description: '' }) // 説明は空文字
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
      { title: 'テーマの背景と重要性', description: 'テーマの背景と重要性について詳しく説明します。' },
      { title: '主要な論点とディスカッション', description: '主要な論点とディスカッションについて議論します。' },
      { title: 'まとめと今後の展望', description: 'まとめと今後の展望について話します。' },
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
  mainCharacter: { name: string, description: string, tone: string } | null,
  guestCharacter: { name: string, description: string, tone: string } | null,
): { intro: string, sections: { title: string, description: string }[], outro: string } {
  let hostNames = 'ホスト'
  if (mainCharacter && guestCharacter) {
    hostNames = `${mainCharacter.name}と${guestCharacter.name}`
  }
  else if (mainCharacter) {
    hostNames = mainCharacter.name
  }
  else if (guestCharacter) {
    hostNames = guestCharacter.name
  }

  return {
    intro: `こんにちは、${hostNames}です。今回のポッドキャストでは「${theme}」について掘り下げていきます。このテーマは多くの人にとって興味深い内容です。さあ、始めましょう。`,
    sections: [
      { title: `${theme}の背景と基本情報`, description: `${theme}についての導入と基本的な情報について話します。` },
      { title: `${theme}に関する重要なポイントや課題`, description: `${theme}を取り巻く主要な論点や直面している課題について議論します。` },
      { title: `${theme}の未来と可能性`, description: `${theme}の今後の展望や秘められた可能性について探ります。` },
    ],
    outro: `今回の「${theme}」についてのポッドキャストはいかがでしたか？次回もお楽しみに。ご視聴ありがとうございました。`,
  }
}
