const { ApplicationCommandOptionType } = require("discord.js");
const { createDailyTimetableEmbed } = require("../../utils/discordUtils");

module.exports = {
  name: "dailytimetable",
  description: "See the COMSCI3 timetable for today.",
  // devOnly: Boolean,
  // testOnly: Boolean,
  deleted: true,

  callback: (client, interaction) => {
    const embed = createDailyTimetableEmbed();
    interaction.reply({ embeds: [embed] });
  },
};
