require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField } = require("discord.js"); // Import required classes from discord.js

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("message", (message) => {
  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
