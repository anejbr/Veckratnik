import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'

import { useAuth } from '@/auth/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const roleLabel = user.role === 'teacher' ? 'Učitelj' : user.grade ? `Učenec · ${user.grade}. razred` : 'Učenec'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 rounded-full pr-3 pl-1">
          <Avatar className="size-8">
            <AvatarFallback
              className={user.role === 'teacher' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-700'}
            >
              {initials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-36 truncate font-semibold sm:inline">{user.full_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-xs font-normal text-muted-foreground">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            signOut()
            navigate('/', { replace: true })
          }}
        >
          <LogOut /> Odjava
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
