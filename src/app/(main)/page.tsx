import Link from 'next/link'
import React from 'react'

export default function List() {
  return (
    <div>
      <p>ポッドキャスト一覧</p>
      <br />
      <ul>
        <li>
          <Link href="/user-id-1">ユーザーid: 1</Link>
          <span>/</span>
          <Link href="/user-id-1/podcast-id-1">ポッドキャストid: 1</Link>
        </li>
        <li>
          <Link href="/user-id-1">ユーザーid1</Link>
          <span>/</span>
          <Link href="/user-id-1/podcast-id-2">ポッドキャストid: 2</Link>
        </li>
        <li>
          <Link href="/user-id-1">ユーザーid1</Link>
          <span>/</span>
          <Link href="/user-id-1/podcast-id-3">ポッドキャストid: 3</Link>
        </li>
        <li>
          <Link href="/user-id-2">ユーザーid2</Link>
          <span>/</span>
          <Link href="/user-id-2/podcast-id-4">ポッドキャストid: 4</Link>
        </li>
        <li>
          <Link href="/user-id-2">ユーザーid2</Link>
          <span>/</span>
          <Link href="/user-id-2/podcast-id-5">ポッドキャストid: 5</Link>
        </li>
      </ul>
      <br />
      <Link href="/new">新規録音</Link>
    </div>
  )
}
