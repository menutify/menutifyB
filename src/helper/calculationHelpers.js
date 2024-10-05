// agrega dias a una fecha (parametros: int, date)
export const addDaysToDate = (days, dateData) => {
    const date = new Date(dateData)
    date.setDate(date.getDate() + days)
    return date
  }
