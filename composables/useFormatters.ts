export function useFormatters() {
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  function formatDate(dateStr: string, includeTime = false): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    return new Date(dateStr).toLocaleDateString('es-ES', options)
  }

  return { formatCurrency, formatDate }
}
