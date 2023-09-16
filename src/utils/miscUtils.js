function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}

function isDateWithinLimit(dateString) {
  const date = new Date(dateString);
  const todayDate = new Date();
  if (
    date.getFullYear() <= todayDate.getFullYear() &&
    date.getMonth() <= todayDate.getMonth() + 1
  ) {
    return true;
  }
  return false;
}

function isFutureDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

module.exports = { isValidDate, isDateWithinLimit, isFutureDate };
