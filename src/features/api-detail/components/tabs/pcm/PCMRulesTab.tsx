import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { RULE_CATEGORIES, getRulesByCategory } from '@/shared/lib/pcm-rules-data'
import { useSettings } from '@/shared/hooks/use-settings'

const SEVERITY_COLORS: Record<string, string> = {
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

export function PCMRulesTab() {
  const { t } = useSettings()
  const [search, setSearch] = useState('')

  const filteredRulesByCategory = useMemo(() => {
    const lowerSearch = search.toLowerCase()
    return RULE_CATEGORIES.map(category => {
      const rules = getRulesByCategory(category).filter(rule =>
        !search ||
        rule.field.toLowerCase().includes(lowerSearch) ||
        rule.description.toLowerCase().includes(lowerSearch) ||
        rule.rule.toLowerCase().includes(lowerSearch) ||
        (rule.apiFamily && rule.apiFamily.toLowerCase().includes(lowerSearch))
      )
      return { category, rules }
    }).filter(group => group.rules.length > 0)
  }, [search])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('pcmRules.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('pcmRules.description')}</p>
      </div>

      <div className="relative">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('pcmRules.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {RULE_CATEGORIES.map(cat => (
          <Badge key={cat} variant="outline">
            {t(`pcmRules.${cat}`)} ({getRulesByCategory(cat).length})
          </Badge>
        ))}
      </div>

      <Accordion type="multiple" defaultValue={[...RULE_CATEGORIES]} className="space-y-2">
        {filteredRulesByCategory.map(({ category, rules }) => (
          <AccordionItem key={category} value={category} className="border rounded-lg px-4">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                {t(`pcmRules.${category}`)}
                <Badge variant="secondary">
                  {t('pcmRules.rulesCount').replace('{count}', String(rules.length))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {rules.map(rule => (
                  <Card key={rule.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono font-semibold">{rule.field}</code>
                      <Badge className={SEVERITY_COLORS[rule.severity]}>{rule.severity}</Badge>
                      {rule.apiFamily && (
                        <Badge variant="outline">{rule.apiFamily}</Badge>
                      )}
                      {rule.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <p className="text-sm">{rule.rule}</p>
                    {rule.endpoints[0] !== '*' && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">{t('pcmRules.endpoints')}:</span>{' '}
                        {rule.endpoints.join(', ')}
                      </div>
                    )}
                    {rule.domain && (
                      <div className="text-xs">
                        <span className="font-medium">Domain:</span>{' '}
                        <code>{rule.domain}</code>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
