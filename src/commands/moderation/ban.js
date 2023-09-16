const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "ban",
  description: "Bans a member of the server.",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // deleted: Boolean,
  options: [
    {
      name: "target-user",
      description: "The user you want to ban",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "The reason for banning",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissionsRequired: [PermissionFlagsBits.Administrator],

  callback: (client, interaction) => {
    interaction.reply("ban..");
  },
};
