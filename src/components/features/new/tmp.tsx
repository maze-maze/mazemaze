'use client';

import Link from 'next/link';
import { useQueryState } from 'nuqs'
import { Button } from '~/components/ui/button';

export default function NewTmp() {
  const [name, setName] = useQueryState('s')

  return (
    <div>
      <Button
        onClick={() => {
          setName('1')
        }}
      >
        Step 1
      </Button>
      <Button
        onClick={() => {
          setName('2')
        }}
      >
        Step 2
      </Button>
      <Button
        onClick={() => {
          setName('3')
        }}
      >
        Step 3
      </Button>
      <Button
        onClick={() => {
          setName('4')
        }}
      >
        Step 4
      </Button>
      <br />
      <Link href='/new/recording'>
        録音
      </Link>
    </div>
  )
}
