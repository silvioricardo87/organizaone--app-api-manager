import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { APIContract } from '@/lib/types'
import type { Language } from '@/lib/i18n'

const labels = {
  en: {
    title: 'PCM Fields Report',
    api: 'API',
    version: 'Version',
    date: 'Generated on',
    totalFields: 'Total Fields',
    field: 'Field',
    endpoint: 'Endpoint',
    method: 'Method',
    definition: 'Definition',
    fillingRule: 'Filling Rule',
    roles: 'Roles',
    httpCodes: 'HTTP Codes',
    mandatory: 'Mandatory',
    domain: 'Domain',
    maxSize: 'Max Size',
    pattern: 'Pattern',
    page: 'Page',
    of: 'of',
    server: 'Server',
    client: 'Client',
    both: 'Both',
    none: 'None',
  },
  pt: {
    title: 'Relatório de Campos PCM',
    api: 'API',
    version: 'Versão',
    date: 'Gerado em',
    totalFields: 'Total de Campos',
    field: 'Campo',
    endpoint: 'Endpoint',
    method: 'Método',
    definition: 'Definição',
    fillingRule: 'Regra de Preenchimento',
    roles: 'Papéis',
    httpCodes: 'Códigos HTTP',
    mandatory: 'Obrigatório',
    domain: 'Domínio',
    maxSize: 'Tam. Máx.',
    pattern: 'Padrão',
    page: 'Página',
    of: 'de',
    server: 'Servidor',
    client: 'Cliente',
    both: 'Ambos',
    none: 'Nenhum',
  },
}

function getMandatoryLabel(value: string, lang: Language): string {
  const l = labels[lang]
  switch (value) {
    case 'server': return l.server
    case 'client': return l.client
    case 'both': return l.both
    default: return l.none
  }
}

export function exportPCMFieldsPDF(api: APIContract, language: Language) {
  const l = labels[language]
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const now = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Header
  doc.setFillColor(30, 64, 175) // blue-800
  doc.rect(0, 0, pageWidth, 25, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(l.title, 14, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${l.api}: ${api.name}  |  ${l.version}: ${api.version}  |  ${l.date}: ${now}  |  ${l.totalFields}: ${api.pcmFields.length}`, 14, 20)

  // Table
  const tableHeaders = [
    l.field,
    l.endpoint,
    l.method,
    l.definition,
    l.fillingRule,
    l.roles,
    l.httpCodes,
    l.mandatory,
    l.domain,
    l.maxSize,
    l.pattern,
  ]

  const tableData = api.pcmFields.map(f => [
    f.field,
    f.endpoint,
    f.method,
    f.definition || '-',
    f.fillingRule || '-',
    f.roles.join(', ') || '-',
    f.httpCodes.join(', ') || '-',
    getMandatoryLabel(f.mandatory, language),
    f.domain || '-',
    f.maxSize || '-',
    f.pattern || '-',
  ])

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 28 },  // field
      1: { cellWidth: 45 },  // endpoint
      2: { cellWidth: 12 },  // method
      3: { cellWidth: 35 },  // definition
      4: { cellWidth: 35 },  // fillingRule
      5: { cellWidth: 18 },  // roles
      6: { cellWidth: 25 },  // httpCodes
      7: { cellWidth: 15 },  // mandatory
      8: { cellWidth: 25 },  // domain
      9: { cellWidth: 12 },  // maxSize
      10: { cellWidth: 25 }, // pattern
    },
    margin: { top: 30, left: 6, right: 6 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages()
      const currentPage = data.pageNumber
      doc.setFontSize(7)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `${l.page} ${currentPage} ${l.of} ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      )
      doc.text(
        'OrganizaOne API Manager',
        pageWidth - 6,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'right' }
      )
    },
  })

  const filename = `${api.name}-v${api.version}-pcm-fields-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

export function exportAllPCMFieldsPDF(apis: APIContract[], language: Language) {
  const l = labels[language]
  const allLabel = language === 'pt' ? 'Todas as APIs' : 'All APIs'
  const summaryLabel = language === 'pt' ? 'Resumo' : 'Summary'
  const apiNameLabel = language === 'pt' ? 'Nome da API' : 'API Name'
  const fieldsCountLabel = language === 'pt' ? 'Qtd. Campos' : 'Fields Count'
  const noFieldsLabel = language === 'pt' ? 'Nenhum campo PCM configurado' : 'No PCM fields configured'

  const apisWithPCM = apis.filter(a => a.pcmFields.length > 0)
  const totalFields = apisWithPCM.reduce((sum, a) => sum + a.pcmFields.length, 0)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const now = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const drawHeader = (subtitle: string) => {
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 25, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${l.title} — ${allLabel}`, 14, 12)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`${subtitle}  |  ${l.date}: ${now}`, 14, 20)
  }

  // --- Page 1: Summary table ---
  drawHeader(`${summaryLabel}  |  ${l.totalFields}: ${totalFields}  |  APIs: ${apisWithPCM.length}/${apis.length}`)

  const summaryData = apisWithPCM.map(api => [
    api.name,
    api.version,
    api.apiGroup || '-',
    String(api.pcmFields.length),
  ])

  autoTable(doc, {
    head: [[apiNameLabel, l.version, 'Grupo / Group', fieldsCountLabel]],
    body: summaryData,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 60 },
      3: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  if (apisWithPCM.length === 0) {
    doc.setTextColor(128, 128, 128)
    doc.setFontSize(11)
    doc.text(noFieldsLabel, pageWidth / 2, 50, { align: 'center' })
  }

  // --- Per-API pages ---
  const tableHeaders = [
    l.field,
    l.endpoint,
    l.method,
    l.definition,
    l.fillingRule,
    l.roles,
    l.httpCodes,
    l.mandatory,
    l.domain,
    l.maxSize,
    l.pattern,
  ]

  for (const api of apisWithPCM) {
    doc.addPage()
    drawHeader(`${l.api}: ${api.name}  |  ${l.version}: ${api.version}  |  ${l.totalFields}: ${api.pcmFields.length}`)

    const tableData = api.pcmFields.map(f => [
      f.field,
      f.endpoint,
      f.method,
      f.definition || '-',
      f.fillingRule || '-',
      f.roles.join(', ') || '-',
      f.httpCodes.join(', ') || '-',
      getMandatoryLabel(f.mandatory, language),
      f.domain || '-',
      f.maxSize || '-',
      f.pattern || '-',
    ])

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 45 },
        2: { cellWidth: 12 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 18 },
        6: { cellWidth: 25 },
        7: { cellWidth: 15 },
        8: { cellWidth: 25 },
        9: { cellWidth: 12 },
        10: { cellWidth: 25 },
      },
      margin: { top: 30, left: 6, right: 6 },
    })
  }

  // Page numbers on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `${l.page} ${i} ${l.of} ${pageCount}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
    doc.text(
      'OrganizaOne API Manager',
      pageWidth - 6,
      pageHeight - 5,
      { align: 'right' }
    )
  }

  const filename = `all-apis-pcm-fields-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
