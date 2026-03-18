import type { PCMRule, PCMRuleCategory } from '@/shared/lib/types'

// ============================================================
// Category 1: Campos Obrigatórios e Opcionais
// ============================================================
export const MANDATORY_FIELD_RULES: PCMRule[] = [
  {
    id: 'mf-additionalInfo',
    category: 'mandatory-fields',
    field: 'additionalInfo',
    description: 'Informações adicionais sobre o reporte. Client: Obrigatório (object). Server: Não obrigatório.',
    rule: 'Client: Sim, Server: Não. Caso não exista o campo enviar como um objeto vazio: {}',
    roles: ['CLIENT'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-clientOrgId',
    category: 'mandatory-fields',
    field: 'clientOrgId',
    description: 'Identificador da organização de onde a chamada foi disparada',
    rule: 'Obrigatório. UUID da organização no diretório de participantes.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'string<uuid>',
  },
  {
    id: 'mf-clientSSId',
    category: 'mandatory-fields',
    field: 'clientSSId',
    description: 'Identificador do software statement de onde a chamada foi disparada',
    rule: 'Obrigatório. A PCM garante que foi esta orgId que obteve o token de acesso utilizado neste reporte.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'string<uuid>',
  },
  {
    id: 'mf-serverOrgId',
    category: 'mandatory-fields',
    field: 'serverOrgId',
    description: 'Identificador da organização para onde a chamada foi feita',
    rule: 'Obrigatório. UUID da organização servidora.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'string<uuid>',
  },
  {
    id: 'mf-endpoint',
    category: 'mandatory-fields',
    field: 'endpoint',
    description: 'Identificação do endpoint utilizado na transação reportada',
    rule: 'Obrigatório. Deve estar presente na lista de endpoints aceitos pela PCM (ENUM). NÃO usar o path da requisição original com dados variáveis.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-endpointUriPrefix',
    category: 'mandatory-fields',
    field: 'endpointUriPrefix',
    description: 'Endereço do servidor de destino da chamada, incluindo o prefixo',
    rule: 'Obrigatório para CLIENT. Formato: https://{host}/{prefixo}. Para /token e /register, enviar URL inteira.',
    roles: ['CLIENT'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-fapiInteractionId',
    category: 'mandatory-fields',
    field: 'fapiInteractionId',
    description: 'UUID RFC4122 que identifica uma transação específica entre dois participantes',
    rule: 'CLIENT: Obrigatório em todos os cenários incluindo 4xx/5xx. SERVER: Obrigatório quando recebido na requisição ou gerado conforme spec da API.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'string<uuid>',
  },
  {
    id: 'mf-httpMethod',
    category: 'mandatory-fields',
    field: 'httpMethod',
    description: 'Método HTTP da solicitação',
    rule: 'Obrigatório. Valores: DELETE, GET, PATCH, POST, PUT',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'DELETE, GET, PATCH, POST, PUT',
  },
  {
    id: 'mf-statusCode',
    category: 'mandatory-fields',
    field: 'statusCode',
    description: 'Status de retorno HTTP da solicitação (200-599)',
    rule: 'Obrigatório. Em caso de timeout client side, preencher com 408.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-timestamp',
    category: 'mandatory-fields',
    field: 'timestamp',
    description: 'Data/Hora UTC no formato ISO8601 com milissegundos',
    rule: 'Obrigatório. Formato: YYYY-MM-DDTHH:mm:ss.sssZ.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-processTimespan',
    category: 'mandatory-fields',
    field: 'processTimespan',
    description: 'Tempo em milissegundos decorrido desde o timestamp até a chegada do primeiro byte da resposta',
    rule: 'Obrigatório. Valor inteiro > 0.',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
  },
  {
    id: 'mf-role',
    category: 'mandatory-fields',
    field: 'role',
    description: 'Indica se o reporte apresenta a visão do server ou do client',
    rule: 'Obrigatório. Valores: CLIENT, SERVER',
    roles: ['CLIENT', 'SERVER'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'error',
    domain: 'CLIENT, SERVER',
  },
  {
    id: 'mf-correlationId',
    category: 'mandatory-fields',
    field: 'correlationId',
    description: 'ID de correlação para sequência de chamadas inter-relacionadas',
    rule: 'Opcional (somente CLIENT POST). Máximo 100 caracteres.',
    roles: ['CLIENT'],
    httpCodes: ['200', '201', '204', '400', '401', '403', '404', '408', '422', '429', '500', '503', '504'],
    endpoints: ['*'],
    severity: 'info',
  },
]

// ============================================================
// Category 2: Regras de Descarte
// ============================================================
export const DISCARD_RULES: PCMRule[] = [
  { id: 'dr-additionalInfo', category: 'discard-rules', field: 'additionalInfo', description: 'Regras que causam DISCARDED para additionalInfo', rule: 'Invalid type: Required (não enviado) | should not be empty (vazio) | Expected object, received outro tipo', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-clientOrgId', category: 'discard-rules', field: 'clientOrgId', description: 'Regras que causam DISCARDED para clientOrgId', rule: 'Required (ausente) | Invalid UUID | clientOrgId inválido para role CLIENT | Requester id mismatch (PAR-100)', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-clientSSId', category: 'discard-rules', field: 'clientSSId', description: 'Regras que causam DISCARDED para clientSSId', rule: 'Required (ausente) | Invalid UUID | should not be empty | SSID not found in combined org IDs', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-endpoint', category: 'discard-rules', field: 'endpoint', description: 'Regras que causam DISCARDED para endpoint', rule: "Required (ausente) | can't be empty | Unlisted endpoint (não aceito pela PCM)", roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-fapiInteractionId', category: 'discard-rules', field: 'fapiInteractionId', description: 'Regras que causam DISCARDED para fapiInteractionId', rule: "Required | can't be empty for status 408/500 | Invalid UUID | Mismatch (não pode ser UUID nulo)", roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-httpMethod', category: 'discard-rules', field: 'httpMethod', description: 'Regras que causam DISCARDED para httpMethod', rule: 'Required (ausente) | Invalid enum: Expected GET|POST|PUT|PATCH|DELETE', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-processTimespan', category: 'discard-rules', field: 'processTimespan', description: 'Regras que causam DISCARDED para processTimespan', rule: 'Required (ausente) | Expected number | Must be > 0', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-serverOrgId', category: 'discard-rules', field: 'serverOrgId', description: 'Regras que causam DISCARDED para serverOrgId', rule: 'Required (ausente) | Invalid UUID | Requester id mismatch (PAR-100)', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-statusCode', category: 'discard-rules', field: 'statusCode', description: 'Regras que causam DISCARDED para statusCode', rule: "Required (ausente) | Expected number | Must be 200-599 | can't be empty", roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-timestamp', category: 'discard-rules', field: 'timestamp', description: 'Regras que causam DISCARDED para timestamp', rule: "Invalid date | can't be empty | Report is too old (> 7 dias)", roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'dr-role', category: 'discard-rules', field: 'role', description: 'Regras que causam DISCARDED para role', rule: 'Required (ausente) | Invalid enum: Expected SERVER|CLIENT', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
]

// ============================================================
// Category 3: Regras de Obrigatoriedade additionalInfo
// ============================================================
export const ADDITIONAL_INFO_RULES: PCMRule[] = [
  // Câmbio
  { id: 'ai-consentId-exchanges', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador único do consentimento (URN)', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/exchanges/vx/operations', '/open-banking/exchanges/vx/operations/{operationId}', '/open-banking/exchanges/vx/operations/{operationId}/events'], apiFamily: 'exchanges', versions: ['v1'], severity: 'error' },
  { id: 'ai-tokenId-exchanges', category: 'additionalinfo-requirements', field: 'tokenId', description: 'Hash SHA256 do token (72 bits iniciais Base64URL-safe)', rule: 'Gerado pelo CLIENT com SHA256(token + Pepper). Omitir quando POST /token retornar 4xx/5xx.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/exchanges/vx/operations', '/open-banking/exchanges/vx/operations/{operationId}', '/open-banking/exchanges/vx/operations/{operationId}/events'], apiFamily: 'exchanges', versions: ['v1'], severity: 'warning' },
  // Cartão de Crédito
  { id: 'ai-consentId-credit-cards', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador único do consentimento (URN)', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/credit-cards-accounts/vx/accounts', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/limits', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/transactions', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/transactions-current', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/bills', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/bills/{billId}/transactions'], apiFamily: 'credit-cards-accounts', versions: ['v2'], severity: 'error' },
  { id: 'ai-tokenId-credit-cards', category: 'additionalinfo-requirements', field: 'tokenId', description: 'Hash SHA256 do token', rule: 'Gerado pelo CLIENT com SHA256(token + Pepper). Omitir quando POST /token retornar 4xx/5xx.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/credit-cards-accounts/vx/accounts', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/limits', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/transactions', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/transactions-current', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/bills', '/open-banking/credit-cards-accounts/vx/accounts/{creditCardAccountId}/bills/{billId}/transactions'], apiFamily: 'credit-cards-accounts', versions: ['v2'], severity: 'warning' },
  // Consentimento
  { id: 'ai-consentId-consents', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador único do consentimento (URN)', rule: 'Obrigatório para CLIENT em todos os HTTP codes (menos 4xx/5xx para POST).', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents', '/open-banking/consents/vx/consents/{consentId}', '/open-banking/consents/vx/consents/{consentId}/extensions', '/open-banking/consents/vx/consents/{consentId}/extends'], apiFamily: 'consents', severity: 'error' },
  { id: 'ai-personType-consents', category: 'additionalinfo-requirements', field: 'personType', description: 'Natureza do solicitante: PF ou PJ', rule: 'Se .data.businessEntity preenchido → PJ, senão → PF.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents'], apiFamily: 'consents', severity: 'error', domain: 'PESSOA_JURIDICA, PESSOA_NATURAL, PF, PJ' },
  { id: 'ai-status-consents', category: 'additionalinfo-requirements', field: 'status', description: 'Status atual do consentimento', rule: 'Preencher com .data.status. Para listas, usar apenas o primeiro item.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents/{consentId}'], apiFamily: 'consents', severity: 'error', domain: 'AUTHORISED, AWAITING_AUTHORISATION, REJECTED' },
  { id: 'ai-dropReason-consents', category: 'additionalinfo-requirements', field: 'dropReason', description: 'Razão pela qual usuário não prosseguiu na jornada de consentimento', rule: 'SERVER: Obrigatório no POST /consents. NONE/NO_CREDENTIAL/NO_AUTHORITY/NO_AUTHORITY_PERSON_MISMATCH', roles: ['SERVER'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents'], apiFamily: 'consents', severity: 'error', domain: 'NO_AUTHORITY, NO_AUTHORITY_PERSON_MISMATCH, NO_CREDENTIAL, NONE' },
  { id: 'ai-tokenId-consents', category: 'additionalinfo-requirements', field: 'tokenId', description: 'Hash SHA256 do token', rule: 'Gerado pelo CLIENT com SHA256(token + Pepper). Omitir quando POST /token retornar 4xx/5xx.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents', '/open-banking/consents/vx/consents/{consentId}'], apiFamily: 'consents', severity: 'warning' },
  { id: 'ai-companyProfileInfo-consents', category: 'additionalinfo-requirements', field: 'companyProfileInfo', description: 'Perfil da PJ: naturezaJuridica e porteEmpresa', rule: 'Obrigatório para clientes PJ. Obter de fontes oficiais (SERPRO/Dados Abertos CNPJ).', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents'], apiFamily: 'consents', severity: 'error' },
  // Contas
  { id: 'ai-consentId-accounts', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador único do consentimento (URN)', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/accounts/vx/accounts', '/open-banking/accounts/vx/accounts/{accountId}', '/open-banking/accounts/vx/accounts/{accountId}/balances', '/open-banking/accounts/vx/accounts/{accountId}/transactions', '/open-banking/accounts/vx/accounts/{accountId}/transactions-current', '/open-banking/accounts/vx/accounts/{accountId}/overdraft-limits'], apiFamily: 'accounts', versions: ['v2'], severity: 'error' },
  { id: 'ai-tokenId-accounts', category: 'additionalinfo-requirements', field: 'tokenId', description: 'Hash SHA256 do token', rule: 'Gerado pelo CLIENT com SHA256(token + Pepper). Omitir quando POST /token retornar 4xx/5xx.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/accounts/vx/accounts', '/open-banking/accounts/vx/accounts/{accountId}', '/open-banking/accounts/vx/accounts/{accountId}/balances', '/open-banking/accounts/vx/accounts/{accountId}/transactions', '/open-banking/accounts/vx/accounts/{accountId}/transactions-current', '/open-banking/accounts/vx/accounts/{accountId}/overdraft-limits'], apiFamily: 'accounts', versions: ['v2'], severity: 'warning' },
  // Dados Cadastrais
  { id: 'ai-consentId-customers', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador único do consentimento (URN)', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/customers/vx/personal/identifications', '/open-banking/customers/vx/business/identifications', '/open-banking/customers/vx/personal/qualifications', '/open-banking/customers/vx/business/qualifications', '/open-banking/customers/vx/personal/financial-relations', '/open-banking/customers/vx/business/financial-relations'], apiFamily: 'customers', versions: ['v2'], severity: 'error' },
  { id: 'ai-tokenId-customers', category: 'additionalinfo-requirements', field: 'tokenId', description: 'Hash SHA256 do token', rule: 'Gerado pelo CLIENT com SHA256(token + Pepper). Omitir quando POST /token retornar 4xx/5xx.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/customers/vx/personal/identifications', '/open-banking/customers/vx/business/identifications', '/open-banking/customers/vx/personal/qualifications', '/open-banking/customers/vx/business/qualifications', '/open-banking/customers/vx/personal/financial-relations', '/open-banking/customers/vx/business/financial-relations'], apiFamily: 'customers', versions: ['v2'], severity: 'warning' },
  // Investimentos
  { id: 'ai-consentId-funds', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Fundos de Investimento', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/funds/vx/investments', '/open-banking/funds/vx/investments/{investmentId}', '/open-banking/funds/vx/investments/{investmentId}/balances', '/open-banking/funds/vx/investments/{investmentId}/transactions', '/open-banking/funds/vx/investments/{investmentId}/transactions-current'], apiFamily: 'funds', versions: ['v1'], severity: 'error' },
  { id: 'ai-consentId-bank-fixed', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Renda Fixa Bancária', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/bank-fixed-incomes/vx/investments', '/open-banking/bank-fixed-incomes/vx/investments/{investmentId}', '/open-banking/bank-fixed-incomes/vx/investments/{investmentId}/balances', '/open-banking/bank-fixed-incomes/vx/investments/{investmentId}/transactions', '/open-banking/bank-fixed-incomes/vx/investments/{investmentId}/transactions-current'], apiFamily: 'bank-fixed-incomes', versions: ['v1'], severity: 'error' },
  { id: 'ai-consentId-credit-fixed', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Renda Fixa Crédito', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/credit-fixed-incomes/vx/investments', '/open-banking/credit-fixed-incomes/vx/investments/{investmentId}', '/open-banking/credit-fixed-incomes/vx/investments/{investmentId}/balances', '/open-banking/credit-fixed-incomes/vx/investments/{investmentId}/transactions', '/open-banking/credit-fixed-incomes/vx/investments/{investmentId}/transactions-current'], apiFamily: 'credit-fixed-incomes', versions: ['v1'], severity: 'error' },
  { id: 'ai-consentId-variable', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Renda Variável', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/variable-incomes/vx/investments', '/open-banking/variable-incomes/vx/investments/{investmentId}', '/open-banking/variable-incomes/vx/investments/{investmentId}/balances', '/open-banking/variable-incomes/vx/investments/{investmentId}/transactions', '/open-banking/variable-incomes/vx/investments/{investmentId}/transactions-current'], apiFamily: 'variable-incomes', versions: ['v1'], severity: 'error' },
  { id: 'ai-consentId-treasure', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Títulos do Tesouro Direto', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/treasure-titles/vx/investments', '/open-banking/treasure-titles/vx/investments/{investmentId}', '/open-banking/treasure-titles/vx/investments/{investmentId}/balances', '/open-banking/treasure-titles/vx/investments/{investmentId}/transactions', '/open-banking/treasure-titles/vx/investments/{investmentId}/transactions-current'], apiFamily: 'treasure-titles', versions: ['v1'], severity: 'error' },
  // Empréstimos
  { id: 'ai-consentId-loans', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Empréstimos', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/loans/vx/contracts', '/open-banking/loans/vx/contracts/{contractId}', '/open-banking/loans/vx/contracts/{contractId}/warranties', '/open-banking/loans/vx/contracts/{contractId}/scheduled-instalments', '/open-banking/loans/vx/contracts/{contractId}/payments'], apiFamily: 'loans', versions: ['v2'], severity: 'error' },
  // Financiamentos
  { id: 'ai-consentId-financings', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Financiamentos', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/financings/vx/contracts', '/open-banking/financings/vx/contracts/{contractId}', '/open-banking/financings/vx/contracts/{contractId}/warranties', '/open-banking/financings/vx/contracts/{contractId}/scheduled-instalments', '/open-banking/financings/vx/contracts/{contractId}/payments'], apiFamily: 'financings', versions: ['v2'], severity: 'error' },
  // Recursos
  { id: 'ai-consentId-resources', category: 'additionalinfo-requirements', field: 'consentId', description: 'Identificador do consentimento - Recursos', rule: 'Preencher com .data.consentId após POST /consents', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/resources/vx/resources'], apiFamily: 'resources', versions: ['v3'], severity: 'error' },
]

// ============================================================
// Category 4: Jornada Otimizada
// ============================================================
export const OPTIMIZED_JOURNEY_RULES: PCMRule[] = [
  { id: 'oj-journeyIsLinked', category: 'optimized-journey', field: 'journeyIsLinked', description: 'Indica que o consentimento é vinculado a outro em uma Jornada Otimizada', rule: 'Preencher com journey.isLinked do POST /consents quando isLinked=true. NÃO reportar fora do contexto de Jornada Otimizada.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents', '/open-banking/consents/vx/consents/{consentId}'], apiFamily: 'consents', severity: 'warning', domain: 'TRUE, FALSE' },
  { id: 'oj-journeyLinkId', category: 'optimized-journey', field: 'journeyLinkId', description: 'Identificador que vincula consentimentos em uma Jornada Otimizada', rule: 'Preencher com journey.linkId do POST /consents quando isLinked=true. NÃO reportar fora do contexto de Jornada Otimizada.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['/open-banking/consents/vx/consents', '/open-banking/consents/vx/consents/{consentId}'], apiFamily: 'consents', severity: 'warning' },
]

// ============================================================
// Category 5: Regras de Validação
// ============================================================
export const VALIDATION_RULES: PCMRule[] = [
  { id: 'vr-timestamp', category: 'validation-rules', field: 'timestamp', description: 'Validação: não pode ter mais de 7 dias', rule: 'Timestamp não pode ter mais de 7 dias da data atual. Reportes antigos serão DISCARDED.', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'vr-statusCode', category: 'validation-rules', field: 'statusCode', description: 'Validação: deve estar entre 200 e 599', rule: 'Valor deve estar entre 200 e 599. Para timeout client side, usar 408.', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'vr-processTimespan', category: 'validation-rules', field: 'processTimespan', description: 'Validação: deve ser maior que zero', rule: 'Valor inteiro em milissegundos, deve ser maior que zero.', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'vr-fapiInteractionId', category: 'validation-rules', field: 'fapiInteractionId', description: 'Validação: não pode ser UUID nulo', rule: 'Não pode ser 00000000-0000-0000-0000-000000000000. Deve ser UUID RFC4122.', roles: ['CLIENT', 'SERVER'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'vr-consentId', category: 'validation-rules', field: 'consentId', description: 'Validação: formato URN', rule: 'Padrão URN: ^urn:[a-zA-Z0-9]... Máximo 100 caracteres.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
  { id: 'vr-endpointUriPrefix', category: 'validation-rules', field: 'endpointUriPrefix', description: 'Validação: formato URI com prefixo', rule: 'Formato https://{host}/{prefixo}. Para /token e /register, usar URL inteira. Máximo 200 caracteres.', roles: ['CLIENT'], httpCodes: ['*'], endpoints: ['*'], severity: 'error' },
]

// ============================================================
// Aggregation and helpers
// ============================================================
export const ALL_PCM_RULES: PCMRule[] = [
  ...MANDATORY_FIELD_RULES,
  ...DISCARD_RULES,
  ...ADDITIONAL_INFO_RULES,
  ...OPTIMIZED_JOURNEY_RULES,
  ...VALIDATION_RULES,
]

export const RULE_CATEGORIES: PCMRuleCategory[] = [
  'mandatory-fields',
  'discard-rules',
  'validation-rules',
  'additionalinfo-requirements',
  'optimized-journey',
]

export function getRulesByCategory(category: PCMRuleCategory): PCMRule[] {
  return ALL_PCM_RULES.filter(r => r.category === category)
}

export function getRulesForField(field: string): PCMRule[] {
  return ALL_PCM_RULES.filter(r => r.field === field)
}

export function getRulesForEndpoint(endpoint: string, apiFamily?: string): PCMRule[] {
  return ALL_PCM_RULES.filter(r => {
    const endpointMatch = r.endpoints.includes('*') || r.endpoints.some(ep => {
      const pattern = ep.replace('/vx/', '/v\\d+/')
      return new RegExp(pattern).test(endpoint) || endpoint.includes(ep.replace('/vx/', '/'))
    })
    const familyMatch = !r.apiFamily || r.apiFamily === apiFamily
    return endpointMatch && familyMatch
  })
}
