import Image from 'next/image'

export default function Character({ name, imageUrl }: { name: string, imageUrl: string }) {
  return (
    <div className="flex flex-col items-center">
      <Image src={imageUrl} alt={name} width={150} height={150} />
      <p className="font-bold">{name}</p>
    </div>
  )
}
