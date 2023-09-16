const { testServer } = require("../../config/config.json");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client, member) => {
  try {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "general"
    );
    if (!channel) {
      console.log("Channel not found");
      return;
    }
    channel.send(`Welcome to the server, ${member}`);
  } catch (error) {
    console.log(`Error encountered: ${error}`);
  }
};
