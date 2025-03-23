export const calculateNextBirthdayAge = (birthDate: Date | string): number => {
  // Ensure we have a Date object
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate next birthday date
  const nextBirthday = new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate())

  // If this year's birthday has passed, use next year's
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }

  // Calculate the age they will be ON their next birthday
  const birthYear = birthDateObj.getFullYear()
  const nextBirthdayYear = nextBirthday.getFullYear()
  return nextBirthdayYear - birthYear
}

export const getNextBirthdayDate = (birthDate: Date | string): Date => {
  // Ensure we have a Date object
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate next birthday date
  const nextBirthday = new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate())

  // If this year's birthday has passed, use next year's
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }

  return nextBirthday
}
