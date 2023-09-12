require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField } = require("discord.js"); // Import required classes from discord.js

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.once("ready", (c) => {
  console.log(`Bot is online and logged in as ${c.user.tag}!`);
});

client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
