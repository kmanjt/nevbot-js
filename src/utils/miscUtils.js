function isValidDate(dateString) {
  const date = new Date(dateString);
  const currentDate = new Date();
  return !isNaN(date) && date > currentDate;
}

function isDateWithinLimit(dateString) {
  const date = new Date(dateString);
  const todayDate = new Date();
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(todayDate.getMonth() + 1);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(todayDate.getFullYear() + 1);

  return date >= todayDate && date <= nextMonthDate && date <= oneYearFromNow;
}

module.exports = { isValidDate, isDateWithinLimit };
