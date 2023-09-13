const fs = require("fs");
const path = require("path");
const { initializeClasses } = require("./sqlRepository");

const readTimetable = () => {
  const timetablePath = path.join(__dirname, "../config", "timetable.json");
  const rawData = fs.readFileSync(timetablePath);
  return JSON.parse(rawData);
};

const getTodayClasses = () => {
  const timetable = readTimetable();
  const today = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = days[today.getDay()];

  const todayClasses = timetable[dayOfWeek] || {}; // return an empty object if the day is not in the timetable

  return todayClasses;
};

const getWeekClasses = () => {
  return readTimetable();
};

module.exports = {
  getTodayClasses,
  getWeekClasses,
};
