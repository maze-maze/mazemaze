/* eslint-disable no-console */

import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { theme, character, structure } = await req.json()
    // 必須パラメータのバリデーション
    if (!theme || !character || !structure) {
      return Response.json(
        { error: 'テーマ、キャラクター、構成が必要です' },
        { status: 400 },
      )
    }

    // キャラクター情報の整形
    let characterInfo
    try {
      characterInfo
        = typeof character === 'string' ? JSON.parse(character) : character
    }
    catch (e) {
      console.error('Error parsing character:', e)
      characterInfo = {
        name: 'ナレーター',
        description: 'ポッドキャストの司会者',
        tone: '親しみやすく知的な口調',
      }
    }

    // 構造情報の整形
    let structureInfo
    try {
      structureInfo
        = typeof structure === 'string' ? JSON.parse(structure) : structure
    }
    catch (e) {
      console.error('Error parsing structure:', e)
      structureInfo = {
        intro: `テーマ「${theme}」についてのポッドキャストへようこそ。`,
        sections: ['テーマの背景', '主な論点', 'まとめ'],
        outro: '今回のエピソードは以上になります。',
      }
    }

    // 第二のホスト名を生成
    const coHostName = 'ユウキ'

    // セクションのリストを作成
    const sectionsList = Array.isArray(structureInfo.sections)
      ? structureInfo.sections
          .map(
            (section: string, index: number) =>
              `セクション${index + 1}: ${section}`,
          )
          .join('\n')
      : ''

    const prompt = `
あなたはポッドキャストのスクリプトを作成するプロのライターです。
以下の情報をもとに、実際に読み上げることを想定した二人のホストによるポッドキャストのスクリプトを作成してください。

テーマ: ${theme}
メインホスト: ${characterInfo.name}
メインホストの説明: ${characterInfo.description}
メインホストのトーン: ${characterInfo.tone}
サブホスト名: ${coHostName}
サブホストの特徴: メインホストと異なる視点や意見を持ち、時に質問を投げかけ、時に補足説明をする役割。親しみやすく、聴取者の疑問を代弁するような話し方をします。

構成:
イントロ: ${structureInfo.intro}
${sectionsList}
アウトロ: ${structureInfo.outro}

このポッドキャストのスクリプトは以下の特徴を持つように作成してください：

1. メインホストとサブホストの対話形式で進行する
2. メインホストは${characterInfo.tone}で話し、${characterInfo.description}らしい視点を提供する
3. サブホストはリスナー目線で質問を投げかけたり、別の視点を提示したりする
4. 構成に沿って、イントロ、各セクション、アウトロを含める
5. 自然な会話の流れになるよう、話し言葉で書く
6. 二人の掛け合いが自然で、テンポよく進行するようにする
7. 重要な用語や概念には適度な説明を入れる
8. 全体の長さは約5〜10分程度の読み上げを想定（約1500〜3000文字程度）

スクリプトは以下のような対話形式で作成してください：

${characterInfo.name}: (セリフ)
${coHostName}: (セリフ)
${characterInfo.name}: (セリフ)
...

会話は自然でリアルな対話になるようにしてください。相槌や質問、意見交換などを含め、二人のパーソナリティが出るようにします。
`

    console.log(`Generating dialogue script for theme: ${theme}`)

    try {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        temperature: 0.7, // 創造性を高めるために温度を上げる
        maxTokens: 4096, // 長めのスクリプトを生成できるように
      })

      console.log(
        `Script generated successfully, length: ${text.length} chars`,
      )
      // "script" というキーでテキストを返す
      return Response.json({ script: text })
    }
    catch (error) {
      console.error('Error generating script:', error)
      // エラー時のフォールバックデータ
      const fallbackScript = generateDialogueFallbackScript(
        theme,
        characterInfo,
        coHostName,
        structureInfo,
      )
      return Response.json({ script: fallbackScript })
    }
  }
  catch (error) {
    console.error('General error in script API:', error)
    return Response.json(
      { error: 'Failed to generate script', details: String(error) },
      { status: 500 },
    )
  }
}

// エラー時の対話型フォールバックスクリプトを生成する関数
function generateDialogueFallbackScript(
  theme: string,
  character: { name: string, description: string, tone: string },
  coHostName: string,
  structure: { intro: string, sections: string[], outro: string },
): string {
  const sectionTexts = structure.sections
    .map((section, index) => {
      return `
## セクション${index + 1}: ${section}

${
  character.name
}: このセクションでは、${section}について詳しく見ていきましょう。このトピックは${theme}を理解する上で非常に重要です。

${coHostName}: なるほど、${section}がなぜそんなに重要なのか、もう少し詳しく説明してもらえますか？

${character.name}: もちろんです。${section}は...（ここでは専門的な説明）

${coHostName}: わかりやすい説明ありがとうございます。リスナーの皆さんも理解が深まったと思います。ところで、よく聞かれる質問として...

${character.name}: いい質問ですね。それについては...（回答）

${coHostName}: なるほど、とても興味深いですね。

${
  character.name
}: 以上が${section}についての概要です。次のセクションに進みましょう。
`
    })
    .join('\n')

  return `
# ポッドキャスト: ${theme}

## イントロ

${character.name}: こんにちは、${character.name}です。今日は「${theme}」というテーマでお送りします。

${coHostName}: こんにちは、${coHostName}です。今日もよろしくお願いします。「${theme}」は多くの方が興味を持っているテーマですよね。

${character.name}: そうですね。${structure.intro}

${coHostName}: とても興味深いですね。このポッドキャストを聴いて、リスナーの方々が新しい視点を得られることを願っています。

${sectionTexts}

## アウトロ

${character.name}: ${structure.outro}

${coHostName}: 今日も素晴らしい内容でしたね。リスナーの皆さん、お聴きいただきありがとうございました。

${character.name}: また次回お会いしましょう。ありがとうございました。

# 以上、「${theme}」についてのポッドキャストでした。${character.name}と${coHostName}がお送りしました。
`
}
