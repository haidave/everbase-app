import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Activity,
  Bath,
  BedDouble,
  Book,
  BriefcaseBusiness,
  Camera,
  ChevronsUpDown,
  Code,
  Construction,
  CookingPot,
  CreditCard,
  Droplet,
  Dumbbell,
  Flame,
  Folder,
  FolderCode,
  FolderCog,
  FolderGit2,
  FolderHeart,
  Folders,
  Gamepad2,
  Headphones,
  Home,
  LampDesk,
  Layers,
  Layers2,
  Leaf,
  Lightbulb,
  Milestone,
  Moon,
  Pencil,
  PiggyBank,
  Puzzle,
  Sofa,
  Star,
  Sun,
  Trophy,
  Tv,
} from 'lucide-react'

type IconPickerProps = {
  value: string
  onChange: (value: string) => void
}

const iconMap = {
  Star,
  Sun,
  Moon,
  Leaf,
  Flame,
  Droplet,
  Home,
  Construction,
  Puzzle,
  Layers,
  Layers2,
  Book,
  Pencil,
  Gamepad2,
  Headphones,
  Tv,
  Camera,
  Activity,
  Trophy,
  Milestone,
  Lightbulb,
  LampDesk,
  Dumbbell,
  BedDouble,
  Sofa,
  Bath,
  CookingPot,
  CreditCard,
  PiggyBank,
  BriefcaseBusiness,
  Code,
  Folder,
  Folders,
  FolderCode,
  FolderGit2,
  FolderHeart,
  FolderCog,
}

const iconEntries = Object.entries(iconMap)

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    if (!search) return iconEntries
    return iconEntries.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const SelectedIcon = useMemo(() => {
    return value && iconMap[value as keyof typeof iconMap] ? iconMap[value as keyof typeof iconMap] : Folder
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="input" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <SelectedIcon />
            <span>{value || 'Select icon...'}</span>
          </div>
          <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command value={value}>
          <CommandInput placeholder="Search icons..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              <div className="grid grid-cols-8 gap-2 p-2">
                {filteredIcons.map(([name, Icon]) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => {
                      onChange(name)
                      setOpen(false)
                    }}
                    className="flex size-10 cursor-pointer items-center justify-center rounded-md p-0"
                  >
                    <Icon />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
