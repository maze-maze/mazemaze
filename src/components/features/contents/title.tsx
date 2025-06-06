import Image from 'next/image'

export default function Title({ title, imageUrl }: { title: string, imageUrl: string }) {
  return (
    <div className="flex py-3 px-4.5 justify-center items-center bg-gradient-to-t from-pink-300 to-purple-500 rounded-xl">
      <Image src={imageUrl} alt={title} width={50} height={50} />
      <h1 className="font-bold text-xl">{title}</h1>
    </div>
  )
}
