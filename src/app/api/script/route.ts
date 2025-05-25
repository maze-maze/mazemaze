/* eslint-disable no-console */
import type { NextRequest } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

// キャラクターの型定義
interface Character {
  name: string
  description: string
  tone: string
}

// 構成のセクションの型定義
interface Section {
  title: string
  description: string
}

// 構成全体の型定義
interface Structure {
  intro: string
  sections: Section[]
  outro: string
}

export async function POST(req: NextRequest) {
  try {
    const { theme, mainCharacter, guestCharacter, structure }
      = await req.json()

    // 必須パラメータのバリデーション
    if (!theme || !structure) {
      return Response.json(
        { error: 'テーマと構成は必須です' },
        { status: 400 },
      )
    }

    // メインキャラクター情報の整形と必須チェック
    let mainCharacterInfo: Character | null = null
    if (mainCharacter) {
      try {
        mainCharacterInfo
          = typeof mainCharacter === 'string'
            ? JSON.parse(mainCharacter)
            : mainCharacter
      }
      catch (e) {
        console.error('Error parsing main character info:', e)
        return Response.json(
          { error: 'メインキャラクター情報のパースに失敗しました' },
          { status: 400 },
        )
      }
    }
    else {
      // メインキャラクターが指定されていない場合はエラー
      return Response.json(
        { error: 'メインキャラクターは必須です' },
        { status: 400 },
      )
    }

    // ゲストキャラクター情報の整形（オプショナル）
    let guestCharacterInfo: Character | null = null
    if (guestCharacter) {
      try {
        guestCharacterInfo
          = typeof guestCharacter === 'string'
            ? JSON.parse(guestCharacter)
            : guestCharacter
      }
      catch (e) {
        console.error('Error parsing guest character info:', e)
        // ゲスト情報はオプショナルなのでエラーにはせず、nullのままにする
      }
    }

    // 構造情報の整形と検証
    let structureInfo: Structure
    try {
      structureInfo
        = typeof structure === 'string' ? JSON.parse(structure) : structure
      // 構造のバリデーション
      if (
        !structureInfo.intro
        || !Array.isArray(structureInfo.sections)
        || !structureInfo.outro
        || structureInfo.sections.some(
          s => typeof s.title === 'undefined' || typeof s.description === 'undefined',
        )
      ) {
        throw new Error('構成情報に必要なフィールドが不足しているか、形式が正しくありません')
      }
    }
    catch (e) {
      console.error('Error parsing or validating structure:', e)
      return Response.json(
        { error: `構成情報のパースまたは検証に失敗しました: ${e}` },
        { status: 400 },
      )
    }

    // ホスト情報を決定
    const mainHost = mainCharacterInfo || {
      name: 'メインホスト',
      description:
            'ポッドキャストの中心となる話し手で、テーマに関する深い知識と経験を持つ。専門的な視点からリスナーに情報を提供します。',
      tone: '落ち着いて、専門的な口調',
    }
    const coHost = guestCharacterInfo || {
      name: 'ユウキ',
      description:
            'メインホストと異なる視点や意見を持ち、時に質問を投げかけ、時に補足説明をする役割。親しみやすく、聴取者の疑問を代弁するような話し方をします。',
      tone: '親しみやすく、好奇心旺盛な口調',
    }

    // セクションのリストを作成（タイトルと説明を含む）
    const sectionsList = structureInfo.sections
      .map(
        (section: Section, index: number) =>
          `セクション${index + 1}: ${section.title}\n内容のポイント: ${section.description}`,
      )
      .join('\n\n')

    // プロンプトを生成
    const prompt = `
あなたはポッドキャストのスクリプトを作成するプロのライターです。
以下の情報をもとに、実際に読み上げることを想定した二人のホストによるポッドキャストのスクリプトを作成してください。

テーマ: ${theme}

ホスト情報:
メインホスト: ${mainHost.name}
メインホストの説明: ${mainHost.description}
メインホストのトーン: ${mainHost.tone}

サブホスト: ${coHost.name}
サブホストの説明: ${coHost.description}
サブホストのトーン: ${coHost.tone}

構成:
イントロ: ${structureInfo.intro}

${sectionsList}

アウトロ: ${structureInfo.outro}

このポッドキャストのスクリプトは以下の特徴を持つように作成してください：

1.  ${mainHost.name}と${coHost.name}の対話形式で進行する。
2.  ${mainHost.name}は${mainHost.tone}で話し、${mainHost.description}らしい視点を提供する。
3.  ${coHost.name}は${coHost.tone}で話し、リスナー目線で質問を投げかけたり、別の視点を提示したりする。
4.  構成に沿って、イントロ、各セクション（タイトルと内容のポイントを反映）、アウトロを含める。
5.  自然な会話の流れになるよう、話し言葉で書く。
6.  二人の掛け合いが自然で、テンポよく進行するようにする。
7.  重要な用語や概念には適度な説明を入れる。
8.  各セクションの内容を深く掘り下げる。
9.  全体の長さは約5〜10分程度の読み上げを想定。
10.  しっかりと書くセクションの内容は出力して。（イントロ、アウトロを含む）

スクリプトは以下のような対話形式で作成してください：

${mainHost.name}: (セリフ)
${coHost.name}: (セリフ)
${mainHost.name}: (セリフ)
...

会話は自然でリアルな対話になるようにしてください。相槌や質問、意見交換などを含め、二人のパーソナリティが出るようにします。
スクリプト本文のみを返してください。余分な説明文は不要です。
`

    console.log(`Generating dialogue script for theme: ${theme}`)

    try {
      // AIを使用してスクリプトを生成
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt,
        temperature: 0.7, // 創造性を少し高める
        maxTokens: 15000,
      })

      console.log(
        `Script generated successfully, length: ${text.length} chars`,
      )
      // 生成されたスクリプトをJSON形式で返す
      return Response.json({ script: text })
    }
    catch (aiError) {
      console.error('Error generating script:', aiError)
      // AIエラー時にフォールバックスクリプトを生成して返す
      const fallbackScript = generateDialogueFallbackScript(
        theme,
        mainHost,
        coHost,
        structureInfo,
      )
      return Response.json({ script: fallbackScript })
    }
  }
  catch (error) {
    console.error('General error in script API:', error)
    // 予期せぬエラーが発生した場合
    return Response.json(
      { error: 'Failed to generate script', details: String(error) },
      { status: 500 },
    )
  }
}

// エラー時の対話型フォールバックスクリプトを生成する関数
function generateDialogueFallbackScript(
  theme: string,
  mainHost: Character,
  coHost: Character,
  structure: Structure,
): string {
  // 各セクションのフォールバックテキストを生成
  const sectionTexts = structure.sections
    .map((section, index) => {
      return `
## セクション${index + 1}: ${section.title}

${mainHost.name}: さて、このセクションでは「${section.title}」について掘り下げていきましょう。${section.description}。${coHost.name}さん、これについてどう思いますか？

${coHost.name}: そうですね、${mainHost.name}さん。${section.title}というのは、${theme}の中でも特に興味深い部分ですよね。リスナーの方々も気になっている点だと思います。例えば、${section.description}について、もう少し具体的に教えていただけますか？

${mainHost.name}: もちろんです。具体的には...（ここで${mainHost.name}が専門的な説明をする）。${mainHost.tone}で言うと、こんな感じです。

${coHost.name}: なるほど、${coHost.tone}で聞くと、非常にわかりやすいですね！ということは、つまり...（ここで${coHost.name}が補足や別の視点を提示する）。

${mainHost.name}: その通りです。${coHost.name}さんの視点は素晴らしいですね。

${coHost.name}: ありがとうございます。では、次のポイントに進みましょうか？
`
    })
    .join('\n')

  // 全体のフォールバックスクリプトを組み立てる
  return `
# ポッドキャスト: ${theme}

## イントロ

${mainHost.name}: こんにちは、${mainHost.name}です。

${coHost.name}: こんにちは、${coHost.name}です。

${mainHost.name}: 今日のポッドキャストへようこそ。今回のテーマは「${theme}」です。${structure.intro}

${coHost.name}: 本当に楽しみですね！${theme}は奥が深いですから、${mainHost.name}さんのお話を聞くのが待ちきれません。

${sectionTexts}

## アウトロ

${mainHost.name}: さて、あっという間でしたが、そろそろお時間です。${structure.outro}

${coHost.name}: 今日も${mainHost.name}さんのおかげで、${theme}について深く理解できました。リスナーの皆さん、お聴きいただきありがとうございました。

${mainHost.name}: また次回お会いしましょう。ありがとうございました。
`
}
