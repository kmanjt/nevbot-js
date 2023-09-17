const { Client, GatewayIntentBits } = require("discord.js");

module.exports = async (client) => {
  console.log(`${client.user.tag} is online.`);

  const globalCommands = await client.application.commands.fetch();
  console.log("Global Commands:");
  globalCommands.forEach((cmd) => console.log(`- ${cmd.name}`));

  const guild = await client.guilds.fetch("1151424341586751549");
  const guildCommands = await guild.commands.fetch();
  console.log(`Guild Commands for ${guild.name}:`);
  guildCommands.forEach((cmd) => console.log(`- ${cmd.name}`));

  // // This takes ~1 hour to update
  //client.application.commands.set([]);
  // // This updates immediately
  //guild.commands.set([]);

  // Loop through all guilds the bot is a part of
  for (const [guildId, guild] of client.guilds.cache) {
    console.log(`Processing guild: ${guild.name} (${guildId})`);

    // Fetch commands for the current guild
    const commands = await guild.commands.fetch();

    // Create a map to track duplicate commands
    const commandNames = new Map();

    // Loop through each command to identify duplicates
    commands.forEach(async (command) => {
      if (commandNames.has(command.name)) {
        // This is a duplicate command, delete it
        console.log(`Deleting duplicate command: ${command.name}`);
        await guild.commands.delete(command.id);
      } else {
        // This is the first occurrence of the command, add it to the map
        commandNames.set(command.name, true);
      }
    });
  }
};
