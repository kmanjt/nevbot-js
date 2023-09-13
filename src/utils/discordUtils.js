const { EmbedBuilder } = require("discord.js");
const {
  getTodayClasses,
  getWeekClasses,
} = require("../repositories/timetableRepository");

function createDailyTimetableEmbed() {
  const todayClasses = getTodayClasses();
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

  for (const [time, classInfo] of Object.entries(todayClasses)) {
    const fieldName = `${time} - ${classInfo.module}`;
    const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
    embed.addFields({ name: fieldName, value: fieldValue });
  }
  return embed;
}

function createWeeklyTimetableEmbed() {
  const weekClasses = getWeekClasses();
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("This Week's COMSCI3 Classes")
    .setTimestamp()
    .setFooter({ text: "Timetable" });

  // Loop through each day
  for (const [day, timeSlots] of Object.entries(weekClasses)) {
    // Add a header for each day
    embed.addFields({ name: day, value: "\u200B" });

    // Loop through each time slot for that day
    for (const [time, classInfo] of Object.entries(timeSlots)) {
      const fieldName = `${time} - ${classInfo.module}`;
      const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
      embed.addFields({ name: fieldName, value: fieldValue });
    }
    embed.addFields({ name: "\u200B", value: "\n\u200B" });
  }
  return embed;
}

module.exports = {
  createDailyTimetableEmbed,
  createWeeklyTimetableEmbed,
};
