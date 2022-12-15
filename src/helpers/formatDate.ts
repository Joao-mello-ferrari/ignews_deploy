export function formatDate(date: string): string{
  const parsedDate = new Intl.DateTimeFormat('pt-BR').format(new Date(date))

  const [ year, month, day] = parsedDate.split('-')

  const monthsArray = [ 
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]

  const formattedDate = `${day} de ${monthsArray[Number(month)-1]} de ${year}`
  return formattedDate
}