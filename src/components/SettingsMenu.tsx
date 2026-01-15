import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Gear, Sun, Moon, Desktop, Globe } from '@phosphor-icons/react'
import { useSettings } from '@/hooks/use-settings'

export function SettingsMenu() {
  const { language, setLanguage, theme, setTheme, t } = useSettings()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Gear size={20} weight="duotone" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe size={16} weight="duotone" />
          {t.settings.language}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pt')}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pt">Português (Brasil)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon size={16} weight="duotone" />
          ) : theme === 'light' ? (
            <Sun size={16} weight="duotone" />
          ) : (
            <Desktop size={16} weight="duotone" />
          )}
          {t.settings.theme}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
          <DropdownMenuRadioItem value="light">
            <Sun size={16} weight="duotone" className="mr-2" />
            {t.settings.light}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon size={16} weight="duotone" className="mr-2" />
            {t.settings.dark}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Desktop size={16} weight="duotone" className="mr-2" />
            {t.settings.system}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
