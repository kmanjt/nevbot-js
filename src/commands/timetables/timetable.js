const {
  createWeeklyTimetableEmbed,
  createDailyTimetableEmbed,
} = require("../../utils/discordUtils");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "timetable",
  description: "Manage COMSCI3 timetables.",
  options: [
    {
      name: "daily",
      type: ApplicationCommandOptionType.Subcommand,
      description: "See the COMSCI3 timetable for today.",
      execute: (client, interaction) => {
        const embed = createDailyTimetableEmbed();
        interaction.reply({ embeds: [embed] });
      },
    },
    {
      name: "weekly",
      type: ApplicationCommandOptionType.Subcommand,
      description: "See the COMSCI3 timetable for the week.",
      execute: (client, interaction) => {
        const embed = createWeeklyTimetableEmbed();
        interaction.reply({ embeds: [embed] });
      },
    },
  ],
  callback: (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    this.options
      .find((option) => option.name === subcommand)
      .execute(client, interaction);
  },
};
