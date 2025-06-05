import { Input } from '🎙️/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchBar() {
  return (
    <div className="pt-22 pb-14 px-8 w-full">
      <div className="flex relative items-center">
        <Search className="absolute left-4 text-[#9B9FAB]" size={20} />
        <Input
          className="flex-1 py-4 px-2 pl-12 h-12 border-none text-[#9B9FAB] bg-white rounded-[40px]"
          placeholder="AIとテーマを探そう"
          // value={searchQuery}
          // onChange={e => setSearchQuery(e.target.value)}
          // onKeyDown={(e) => {
          // if (e.key === 'Enter' && searchQuery.trim()) {
          // searchRelatedThemes(searchQuery)
          // }
          // }}
        />

      </div>
    </div>
  )
}
