export type Language = 'en' | 'pt'

export const monthNames = {
  en: {
    full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  pt: {
    full: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    short: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  },
}

export const dayNames = {
  en: {
    full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  pt: {
    full: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    short: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  },
}

export function formatDate(date: Date | string | undefined, format: 'short' | 'medium' | 'long' | 'full' | 'time' | 'dateTime' | 'monthYear' | 'dayMonth', language: Language): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()
  const dayOfWeek = d.getDay()
  const hours = d.getHours()
  const minutes = d.getMinutes()

  const pad = (n: number) => n.toString().padStart(2, '0')

  const months = monthNames[language]
  const days = dayNames[language]

  switch (format) {
    case 'short':
      return language === 'pt'
        ? `${pad(day)}/${pad(month + 1)}/${year}`
        : `${pad(month + 1)}/${pad(day)}/${year}`

    case 'medium':
      return language === 'pt'
        ? `${pad(day)} de ${months.short[month]} de ${year}`
        : `${months.short[month]} ${pad(day)}, ${year}`

    case 'long':
      return language === 'pt'
        ? `${pad(day)} de ${months.full[month]} de ${year}`
        : `${months.full[month]} ${pad(day)}, ${year}`

    case 'full':
      return language === 'pt'
        ? `${days.full[dayOfWeek]}, ${pad(day)} de ${months.full[month]} de ${year}`
        : `${days.full[dayOfWeek]}, ${months.full[month]} ${pad(day)}, ${year}`

    case 'time':
      if (language === 'pt') {
        return `${pad(hours)}:${pad(minutes)}`
      } else {
        const h = hours % 12 || 12
        const ampm = hours >= 12 ? 'PM' : 'AM'
        return `${h}:${pad(minutes)} ${ampm}`
      }

    case 'dateTime': {
      const dateStr = language === 'pt'
        ? `${pad(day)}/${pad(month + 1)}/${year}`
        : `${pad(month + 1)}/${pad(day)}/${year}`
      const timeStr = language === 'pt'
        ? `${pad(hours)}:${pad(minutes)}`
        : (() => {
            const h = hours % 12 || 12
            const ampm = hours >= 12 ? 'PM' : 'AM'
            return `${h}:${pad(minutes)} ${ampm}`
          })()
      return `${dateStr} ${timeStr}`
    }

    case 'monthYear':
      return language === 'pt'
        ? `${months.full[month]} de ${year}`
        : `${months.full[month]} ${year}`

    case 'dayMonth':
      return language === 'pt'
        ? `${pad(day)} de ${months.short[month]}`
        : `${months.short[month]} ${pad(day)}`

    default:
      return d.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')
  }
}

export function formatRelativeDate(date: Date | string | undefined, language: Language): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (language === 'pt') {
    if (diffMinutes < 1) return 'agora mesmo'
    if (diffMinutes < 60) return `ha ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `ha ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    if (diffDays < 7) return `ha ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `ha ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `ha ${months} ${months === 1 ? 'mes' : 'meses'}`
    }
    const years = Math.floor(diffDays / 365)
    return `ha ${years} ${years === 1 ? 'ano' : 'anos'}`
  } else {
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? 'month' : 'months'} ago`
    }
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  }
}

export function formatDateRange(startDate: Date | string | undefined, endDate: Date | string | undefined, language: Language): string {
  if (!startDate && !endDate) return ''

  if (!startDate) {
    return language === 'pt'
      ? `Ate ${formatDate(endDate, 'medium', language)}`
      : `Until ${formatDate(endDate, 'medium', language)}`
  }

  if (!endDate) {
    return language === 'pt'
      ? `A partir de ${formatDate(startDate, 'medium', language)}`
      : `From ${formatDate(startDate, 'medium', language)}`
  }

  const start = formatDate(startDate, 'medium', language)
  const end = formatDate(endDate, 'medium', language)

  return language === 'pt'
    ? `${start} ate ${end}`
    : `${start} to ${end}`
}
