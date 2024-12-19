/**
 * this have the real date and the next day
 * @param {*} date
 * @returns
 */
export const datesStringForBD = (date) => {
  const startDate = new Date(date)

  const endDate = new Date(startDate)
  const nextMonth = endDate.getMonth() + 1

  endDate.setMonth(nextMonth)

  return [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]
}

export const dateBDForString = (date) => {
  return new Date(date + 'T00:00:00Z')
}
