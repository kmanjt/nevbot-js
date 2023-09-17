module.exports = async (client, guildId) => {
  console.log(
    `Fetching commands for ${guildId ? `guild ${guildId}` : "global"}`
  );
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await client.application.commands;
  }

  await applicationCommands.fetch();
  return applicationCommands;
};
