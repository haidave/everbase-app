import React from 'react'
import * as LucideIcons from 'lucide-react'

import { cn } from '@/lib/utils'

type DynamicIconProps = {
  name?: string
  className?: string
  fallback?: keyof typeof LucideIcons
}

const DynamicIcon = ({ name, className, fallback = 'Folder' }: DynamicIconProps) => {
  const IconComponent = React.useMemo(() => {
    if (name && name in LucideIcons) {
      return LucideIcons[name as keyof typeof LucideIcons]
    }
    return LucideIcons[fallback]
  }, [name, fallback]) as React.ComponentType<React.SVGProps<SVGSVGElement>>

  return <IconComponent className={cn('shrink-0', className)} />
}

export { DynamicIcon }
