const { EmbedBuilder } = require("discord.js");
const {
  getTodayClasses,
  getWeekClasses,
} = require("../repositories/timetableRepository");
const { getAllTasksForUser } = require("../repositories/sqlRepository");

function createDailyTimetableEmbed() {
  const todayClassesObj = getTodayClasses();
  const sortedTimes = Object.keys(todayClassesObj).sort((a, b) =>
    a.localeCompare(b)
  );
  const dateObj = new Date();
  // set day in English
  const day = new Intl.DateTimeFormat("en-EU", { weekday: "long" }).format(
    dateObj
  );
  const date = dateObj.toLocaleDateString("en-EU");
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${day}-${date} COMSCI3 Classes`)
    .setTimestamp()
    .setFooter({ text: "Timetable" });

  sortedTimes.forEach((time) => {
    const classInfo = todayClassesObj[time];
    const fieldName = `${time} - ${classInfo.module}`;
    const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
    embed.addFields({ name: fieldName, value: fieldValue });
  });

  return embed;
}

function createWeeklyTimetableEmbed() {
  const weekClassesObj = getWeekClasses();
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("This Week's COMSCI3 Classes")
    .setTimestamp()
    .setFooter({ text: "Timetable" });

  Object.entries(weekClassesObj).forEach(([day, classes]) => {
    embed.addFields({ name: day, value: "\u200B" });
    const sortedTimes = Object.keys(classes).sort((a, b) => a.localeCompare(b));
    sortedTimes.forEach((time) => {
      const classInfo = classes[time];
      const fieldName = `${time} - ${classInfo.module}`;
      const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
      embed.addFields({ name: fieldName, value: fieldValue });
    });
    embed.addFields({ name: "\u200B", value: "\n\u200B" });
  });

  return embed;
}

async function createUserTasksEmbed(userId, username) {
  const tasks = await getAllTasksForUser(userId);

  const embed = new EmbedBuilder()
    .setTitle(`Tasks Due For ${username}`)
    .setTimestamp();

  for (const taskObj of tasks) {
    const { taskID, task, dueDate, completed, late } = taskObj;
    const date = new Date(dueDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JavaScript
    const year = date.getFullYear();
    const due = `${day}/${month}/${year}`;

    const fieldName = `Task ID: ${taskID} - ${task}`;
    const fieldValue = `Due: ${due}\nCompleted: ${
      completed ? true : false
    }\nLate: ${late ? true : false}`;
    embed.addFields({ name: fieldName, value: fieldValue });
  }

  return embed;
}

module.exports = {
  createDailyTimetableEmbed,
  createWeeklyTimetableEmbed,
  createUserTasksEmbed,
};
