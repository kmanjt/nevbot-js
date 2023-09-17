const { testServer } = require("../../config/config.json");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    // Fetch local commands and application commands for the test server
    const localCommands = getLocalCommands();
    const guildApplicationCommands = await getApplicationCommands(
      client,
      testServer
    );
    const globalApplicationCommands = await getApplicationCommands(client);

    // Log the guild property of applicationCommands
    console.log(
      `applicationCommands is for guild: ${
        guildApplicationCommands.guild
          ? guildApplicationCommands.guild.id
          : "global"
      }`
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      // Check if the command exists either globally or in the guild
      const existingGuildCommand = guildApplicationCommands.cache.find(
        (cmd) => cmd.name === name
      );
      const existingGlobalCommand = globalApplicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingGuildCommand || existingGlobalCommand) {
        const existingCommand = existingGuildCommand || existingGlobalCommand;

        if (localCommand.deleted) {
          await guildApplicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await guildApplicationCommands.edit(existingCommand.id, {
            name,
            description,
            options,
          });

          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `⏩ Skipping registering command "${name}" as it's set to delete.`
          );
          continue;
        }

        await guildApplicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Registered command "${name}."`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
    console.log(`Error details: ${JSON.stringify(error, null, 2)}`);
  }
};
