# Persistência de Dados - OpenFinance API Manager

## Visão Geral

Este aplicativo utiliza `localStorage` do navegador para persistência de dados. Todos os dados são armazenados localmente no navegador do usuário.

## Arquitetura de Persistência

### 1. Hook Personalizado: `usePersistedKV`

Localização: `/src/hooks/use-persisted-kv.ts`

Este hook encapsula operações de leitura/escrita no localStorage com tipagem TypeScript e API reativa via `useState`.

```typescript
const [value, setValue, deleteValue] = usePersistedKV<T>(key, defaultValue)
```

**Características:**
- Carregamento inicial de dados do localStorage
- Atualização automática do localStorage a cada escrita
- Type-safe com TypeScript

### 2. Utilitário de Storage

Localização: `/src/lib/storage.ts`

Fornece funções auxiliares para acesso direto ao localStorage:

```typescript
import { storage, STORAGE_KEYS } from '@/lib/storage'

// Operações gerais
storage.get<T>(key: string): T | null
storage.set<T>(key: string, value: T): void
storage.remove(key: string): void
storage.clear(): void

// Operações específicas para APIs
storage.getAPIConfig<T>(apiId: string): T | null
storage.setAPIConfig<T>(apiId: string, config: T): void
storage.removeAPIConfig(apiId: string): void
storage.getAllAPIConfigs(): string[]
```

## Dados Persistidos

### 1. Lista de Contratos de API

**Chave:** `openfinance-apis`

Armazena o array completo de contratos de API, incluindo:
- Informações básicas (nome, versão, resumo)
- Conteúdo YAML e especificação parseada
- Fases do ciclo de vida
- Marcos (milestones)
- Problemas conhecidos
- Itens do backlog
- Campos PCM (Plataforma de Coleta de Métricas)

**Uso no App:**
```typescript
const [apis, setApis] = usePersistedKV<APIContract[]>(STORAGE_KEYS.APIS, [])
```

### 2. Configurações de API Individual

**Chave:** `api-config-{apiId}`

Cada API também é persistida individualmente para redundância e acesso rápido:
- Atualizado automaticamente quando a API é visualizada/editada
- Removido quando a API é excluída
- Útil para recuperação de dados e backup

### 3. Idioma (Language)

**Chave:** `app-language`

Valores possíveis:
- `'pt'` - Português (Brasil) [padrão]
- `'en'` - English

**Uso:**
```typescript
const { language, setLanguage } = useSettings()
```

### 4. Tema (Theme/Color Mode)

**Chave:** `app-theme`

Valores possíveis:
- `'light'` - Modo claro
- `'dark'` - Modo escuro
- `'system'` - Segue preferência do sistema [padrão]

**Uso:**
```typescript
const { theme, setTheme } = useSettings()
```

## Implementação nos Componentes

### App.tsx
```typescript
import { usePersistedKV } from '@/hooks/use-persisted-kv'
import { STORAGE_KEYS, storage } from '@/lib/storage'

const [apis, setApis] = usePersistedKV<APIContract[]>(STORAGE_KEYS.APIS, [])

const handleDeleteAPI = (apiId: string) => {
  setApis((currentApis) => currentApis.filter(api => api.id !== apiId))
  storage.removeAPIConfig(apiId) // Remove configuração individual
}
```

### APIDetailView.tsx
```typescript
import { storage } from '@/lib/storage'

useEffect(() => {
  storage.setAPIConfig(api.id, api) // Persiste configuração individual
}, [api])
```

### SettingsProvider (use-settings.tsx)
```typescript
import { usePersistedKV } from '@/hooks/use-persisted-kv'
import { STORAGE_KEYS } from '@/lib/storage'

const [language, setLanguage] = usePersistedKV<Language>(STORAGE_KEYS.LANGUAGE, 'pt')
const [theme, setTheme] = usePersistedKV<Theme>(STORAGE_KEYS.THEME, 'light')
```

## Fluxo de Dados

### Leitura (Inicialização)
1. Componente monta e chama `usePersistedKV`
2. Hook carrega de `localStorage`
3. Se não encontrado, usa valor padrão

### Escrita (Atualização)
1. Componente chama `setValue(newValue)`
2. Hook atualiza `localStorage`
3. Estado React é atualizado

### Exclusão
1. Componente chama `deleteValue()` ou `storage.remove()`
2. Dados removidos do localStorage
3. Hook retorna ao valor padrão

## Debugging

Para inspecionar dados no localStorage:

```javascript
// No Console do Navegador (F12)

// Ver todos os dados
console.log(localStorage)

// Ver APIs
console.log(JSON.parse(localStorage.getItem('openfinance-apis')))

// Ver idioma
console.log(localStorage.getItem('app-language'))

// Ver tema
console.log(localStorage.getItem('app-theme'))

// Ver configuração de API específica
console.log(JSON.parse(localStorage.getItem('api-config-{seu-api-id}')))

// Limpar todos os dados (cuidado!)
localStorage.clear()
```

## Limitações do localStorage

1. **Tamanho**: ~5-10MB por domínio (varia por navegador)
2. **Síncrono**: Operações bloqueiam a thread principal
3. **Apenas Strings**: Requer JSON.stringify/parse
4. **Sem Encriptação**: Dados não são seguros

Para grandes volumes de dados YAML, considere:
- Compressão antes de salvar
- IndexedDB para contratos muito grandes
- Limpeza periódica de dados antigos
