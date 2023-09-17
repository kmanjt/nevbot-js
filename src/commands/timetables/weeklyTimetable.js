const { ApplicationCommandOptionType } = require("discord.js");
const { createWeeklyTimetableEmbed } = require("../../utils/discordUtils");

module.exports = {
  name: "weeklytimetable",
  description: "See the COMSCI3 timetable for the week.",
  // devOnly: Boolean,
  // testOnly: Boolean,
  deleted: true,

  callback: (client, interaction) => {
    const embed = createWeeklyTimetableEmbed();
    interaction.reply({ embeds: [embed] });
  },
};
