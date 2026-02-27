import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { APIContract } from '@/lib/types'
import type { Language } from '@/lib/i18n'
import type { ValidationResult } from '@/lib/pcm-csv-validator'

const labels = {
  en: {
    title: 'PCM CSV Validation Report',
    api: 'API',
    version: 'Version',
    date: 'Generated on',
    dateRange: 'Date Range',
    summary: 'Summary',
    totalRecords: 'Total CSV Records',
    matchedRecords: 'Matched Records',
    unmatchedRecords: 'Unmatched Records',
    pairingStats: 'Pairing Statistics',
    paired: 'Paired',
    unpaired: 'Unpaired',
    pairedInconsistent: 'Paired Inconsistent',
    totalCalls: 'Total Calls',
    statusDistribution: 'Status Code Distribution',
    statusCode: 'Status Code',
    count: 'Count',
    percentage: 'Percentage',
    endpointCoverage: 'Endpoint Coverage',
    endpoint: 'Endpoint',
    inSpec: 'In Spec',
    inCSV: 'In CSV',
    callCount: 'Call Count',
    inconsistencies: 'Inconsistencies',
    severity: 'Severity',
    description: 'Description',
    yes: 'Yes',
    no: 'No',
    page: 'Page',
    of: 'of',
    warning: 'Warning',
    error: 'Error',
    info: 'Info',
    noInconsistencies: 'No inconsistencies found',
    organizations: 'Organizations',
    reporters: 'Reporters',
    detentores: 'Holders',
  },
  pt: {
    title: 'Relatório de Validação CSV PCM',
    api: 'API',
    version: 'Versão',
    date: 'Gerado em',
    dateRange: 'Período',
    summary: 'Resumo',
    totalRecords: 'Total de Registros CSV',
    matchedRecords: 'Registros Correspondentes',
    unmatchedRecords: 'Registros Não Correspondentes',
    pairingStats: 'Estatísticas de Pareamento',
    paired: 'Pareado',
    unpaired: 'Não Pareado',
    pairedInconsistent: 'Pareado Inconsistente',
    totalCalls: 'Total de Chamadas',
    statusDistribution: 'Distribuição de Status Code',
    statusCode: 'Status Code',
    count: 'Quantidade',
    percentage: 'Porcentagem',
    endpointCoverage: 'Cobertura de Endpoints',
    endpoint: 'Endpoint',
    inSpec: 'Na Spec',
    inCSV: 'No CSV',
    callCount: 'Chamadas',
    inconsistencies: 'Inconsistências',
    severity: 'Severidade',
    description: 'Descrição',
    yes: 'Sim',
    no: 'Não',
    page: 'Página',
    of: 'de',
    warning: 'Aviso',
    error: 'Erro',
    info: 'Info',
    noInconsistencies: 'Nenhuma inconsistência encontrada',
    organizations: 'Organizações',
    reporters: 'Reportantes',
    detentores: 'Detentoras',
  },
}

export function exportValidationPDF(api: APIContract, result: ValidationResult, language: Language) {
  const l = labels[language]
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  const now = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Header
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(l.title, 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${l.api}: ${api.name}  |  ${l.version}: ${api.version}  |  ${l.date}: ${now}`, 14, 20)

  let y = 32

  // Summary
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(l.summary, 14, y)
  y += 6

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const summaryData = [
    [l.totalRecords, String(result.totalRecords)],
    [l.matchedRecords, String(result.matchedRecords)],
    [l.unmatchedRecords, String(result.unmatchedRecords)],
  ]
  if (result.dateRange) {
    summaryData.push([l.dateRange, `${result.dateRange.min} — ${result.dateRange.max}`])
  }

  autoTable(doc, {
    body: summaryData,
    startY: y,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // Pairing stats
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(l.pairingStats, 14, y)
  y += 6

  const totalCalls = result.pairedCount + result.unpairedCount + result.pairedInconsistentCount
  autoTable(doc, {
    head: [[l.paired, l.unpaired, l.pairedInconsistent, l.totalCalls]],
    body: [[
      String(result.pairedCount),
      String(result.unpairedCount),
      String(result.pairedInconsistentCount),
      String(totalCalls),
    ]],
    startY: y,
    styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // Status distribution
  if (Object.keys(result.statusCodeDistribution).length > 0) {
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(l.statusDistribution, 14, y)
    y += 6

    const statusTotal = Object.values(result.statusCodeDistribution).reduce((s, v) => s + v, 0)
    const statusData = Object.entries(result.statusCodeDistribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, count]) => [
        code,
        String(count),
        `${((count / statusTotal) * 100).toFixed(1)}%`,
      ])

    autoTable(doc, {
      head: [[l.statusCode, l.count, l.percentage]],
      body: statusData,
      startY: y,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8
  }

  // Check page break
  if (y > 220) {
    doc.addPage()
    y = 20
  }

  // Endpoint coverage
  if (result.endpointCoverage.length > 0) {
    doc.setTextColor(30, 64, 175)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(l.endpointCoverage, 14, y)
    y += 6

    const epData = result.endpointCoverage.map(ep => [
      ep.endpoint,
      ep.inSpec ? l.yes : l.no,
      ep.inCSV ? l.yes : l.no,
      String(ep.csvCount),
    ])

    autoTable(doc, {
      head: [[l.endpoint, l.inSpec, l.inCSV, l.callCount]],
      body: epData,
      startY: y,
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8
  }

  // Check page break
  if (y > 240) {
    doc.addPage()
    y = 20
  }

  // Inconsistencies
  doc.setTextColor(30, 64, 175)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(l.inconsistencies, 14, y)
  y += 6

  if (result.inconsistencies.length === 0) {
    doc.setTextColor(0, 128, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(l.noInconsistencies, 14, y)
  } else {
    const severityLabel = (type: string) => {
      switch (type) {
        case 'error': return l.error
        case 'warning': return l.warning
        default: return l.info
      }
    }

    const incData = result.inconsistencies.map(inc => [
      severityLabel(inc.type),
      inc.message,
    ])

    autoTable(doc, {
      head: [[l.severity, l.description]],
      body: incData,
      startY: y,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const val = data.cell.raw as string
          if (val === l.error) {
            data.cell.styles.textColor = [220, 38, 38]
          } else if (val === l.warning) {
            data.cell.styles.textColor = [234, 179, 8]
          } else {
            data.cell.styles.textColor = [59, 130, 246]
          }
        }
      },
    })
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `${l.page} ${i} ${l.of} ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    )
    doc.text(
      'OrganizaOne API Manager',
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'right' }
    )
  }

  const filename = `${api.name}-v${api.version}-validation-report-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
