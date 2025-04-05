import { useState } from 'react'
import { AddEventForm } from '@/features/events/components/add-event-form'
import { AddTaskForm } from '@/features/tasks/components/add-task-form'
import { useNavigate } from '@tanstack/react-router'
import { CalendarPlusIcon, LogOutIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import { NAVIGATION_ITEMS } from '@/config/app-layout.config'
import { type Project } from '@/lib/api'
import { useSignOut } from '@/hooks/use-sign-out'
import { useTheme } from '@/hooks/use-theme'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { DynamicIcon } from '../ui/dynamic-icon'
import { SidebarMenuButton } from '../ui/sidebar'

type AppCommandProps = {
  projects?: Project[]
}

const AppCommand = ({ projects }: AppCommandProps) => {
  const [open, setOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const navigate = useNavigate()
  const signOut = useSignOut()
  const { theme, setTheme } = useTheme()

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault()
      setOpen((open) => !open)
    },
    {
      preventDefault: true,
    }
  )

  return (
    <>
      <SidebarMenuButton
        variant="search"
        className="flex min-h-10 w-full items-center justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <SearchIcon size={16} />
          Search
        </span>
        <span className="flex items-center pr-0.5 text-xs opacity-50">⌘K</span>
      </SidebarMenuButton>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => {
                setOpen(false)
                setIsAddTaskOpen(true)
              }}
            >
              <PlusIcon className="size-4" />
              <span>Add Task</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false)
                setIsAddEventOpen(true)
              }}
            >
              <CalendarPlusIcon className="size-4" />
              <span>Add Event</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Pages">
            {NAVIGATION_ITEMS.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => {
                  setOpen(false)
                  navigate({ to: item.url })
                }}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {projects && projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => {
                    setOpen(false)
                    navigate({ to: '/projects/$projectId', params: { projectId: project.id } })
                  }}
                >
                  <DynamicIcon name={project.icon} />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Other">
            <CommandItem
              onSelect={() => {
                setOpen(false)
                setTheme(theme === 'light' ? 'dark' : 'light')
              }}
            >
              {theme === 'light' ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
              <span>Switch Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false)
                signOut()
              }}
            >
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <AddTaskForm open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
      <AddEventForm open={isAddEventOpen} onOpenChange={setIsAddEventOpen} />
    </>
  )
}

export { AppCommand }
