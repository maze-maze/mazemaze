import { StorageKeys } from '🎙️/lib/storage-keys'
import { useEffect, useState } from 'react'

export function useRecordingScripts() {
  const [data, setData] = useState<{
    title: string
    character: string
    script: string
    userName?: string
    guest: string
  }>({
    title: '',
    character: '',
    script: '',
    userName: '',
    guest: '',
  })

  useEffect(() => {
    const theme = window.sessionStorage.getItem(StorageKeys.THEME)!
    const script = window.sessionStorage.getItem(StorageKeys.SCRIPT)!
    const mainCharacter = window.sessionStorage.getItem(StorageKeys.MAIN)!
    const guestCharacter = window.sessionStorage.getItem(StorageKeys.GUEST)!

    setData({
      title: JSON.parse(theme).theme,
      character: 'character',
      script,
      userName: JSON.parse(mainCharacter).name,
      guest: JSON.parse(guestCharacter),
    })
  }, [])

  return {
    title: data.title,
    character: 'character',
    script: data.script,
    userName: data.userName,
    guest: data.guest,
    //     title: '謎の未確認生物UMA探訪記',
    //     character: 'character',
    //     script: `椎名誠（メインパーソナリティ）:
    // 皆さん、こんばんは！そして、こんにちは！「謎の未確認生物UMA探訪記」、司会を務めます、自称UMA研究家の椎名誠です！この番組では、ロマンと謎に満ちた未確認生物UMAの世界を、ディープかつ楽しく探求していきます！

    // （少し間）

    // さて、記念すべき第一回目の放送となる今回は、スペシャルゲストをお迎えしました！日本のUMA研究の第一人者、サイエンスライターの並木伸一郎さんです！並木さん、ようこそ！

    // 並木伸一郎（ゲスト）:
    // こんばんは、椎名さん。そして、リスナーの皆さん、はじめまして。並木伸一郎です。本日はお招きいただきありがとうございます。

    // 椎名:
    // 並木さんには、この番組を通して、様々なUMAについて深く語っていただきたいと思っています。初回となる今回は、まず並木さんの自己紹介と、UMAとの出会いについて少しお聞かせいただけますでしょうか？

    // 並木:
    // はい。私は物心ついた頃から、世界の不思議な出来事や、まだ科学で解明されていない謎に強い興味を持っていました。その中でも、UMA、つまり未確認動物の存在は、私にとって最大のロマンだったんです。子供の頃に読んだネス湖のネッシーに関する本が、私のUMA探求の原点と言えるかもしれません。

    // 椎名:
    // なるほど！ネッシーはまさにUMAの代名詞のような存在ですよね！私がUMAに興味を持ったきっかけは、ヒマラヤの雪男イエティの写真を見た時でした。あの何とも言えない神秘的な雰囲気に、心を奪われたんです。

    // 並木:
    // イエティもロマンがありますね。足跡の写真一枚から、様々な想像が膨らみます。実際に現地に調査に行ったこともあるんですよ。

    // 椎名:
    // ええ！それはすごい！そのお話は、ぜひ今後の番組でじっくり聞かせてください！

    // 並木:
    // もちろんです。

    // 椎名:
    // さて、この「謎の未確認生物UMA探訪記」では、これから様々なUMAを取り上げ、その謎に迫っていきたいと思っています。リスナーの皆さんからのUMAに関する情報や疑問なども、どんどんお待ちしています！

    // 並木:
    // 私も、皆さんと一緒にUMAの世界を楽しんでいきたいと思っています。

    // 椎名:
    // ありがとうございます、並木さん。それでは、次回の放送では、具体的なUMAを一種類取り上げて、深掘りしていきたいと思います。お楽しみに！`,
    //     userName: `椎名 誠`,
    //     guest: `
    //     名前: 並木 伸一郎 (なみき しんいちろう)
    // キャラクター: 冷静かつ客観的にUMAについて語る専門家。豊富な知識と調査経験を持ち、信憑性の高い情報を提供する。椎名さんとの掛け合いで、よりUMAの奥深さを引き出す。
    // 肩書: サイエンスライター、UMA研究家`,
  }
}
