import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'
import { useTheme } from '@/hooks/use-theme'

import { SidebarMenuButton } from './sidebar'

const UserMenu = () => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const signOut = useSignOut()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          isActive={isOpen}
          className="h-auto w-full justify-start gap-3 data-[active=true]:font-normal"
        >
          <Avatar className="size-8 shrink-0 group-data-[collapsible=icon]:size-4">
            <AvatarImage src={user.user_metadata.picture} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start overflow-hidden text-left text-xs">
            <span className="w-full truncate font-medium">{user.user_metadata.full_name || 'User'}</span>
            <span className="text-muted-foreground w-full truncate">{user.email}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56">
        <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
          <span>Switch Theme</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOutIcon className="size-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
