require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField } = require("discord.js");
const {
  getTodayClasses,
  getWeekClasses,
} = require("./repositories/timetableRepository");
const {
  createDailyTimetableEmbed,
  createWeeklyTimetableEmbed,
} = require("./utils/discordUtils");

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

client.on("messageCreate", async (message) => {
  if (message.content === "!today") {
    const embed = createDailyTimetableEmbed();

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!week") {
    const embed = createWeeklyTimetableEmbed();

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!ping") {
    message.reply("Pong!");
  }
});

// Notify 30 and 15 minutes before class
setInterval(async () => {
  const todayClasses = getTodayClasses();
  const currentTime = new Date();

  // Loop through each time slot for today's classes
  for (const [time, classInfo] of Object.entries(todayClasses)) {
    const hour = parseInt(time.substring(0, 2), 10);
    const minute = parseInt(time.substring(2, 4), 10);

    const classTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      hour,
      minute
    );

    const timeDifference = (classTime - currentTime) / 1000 / 60; // Time difference in minutes

    if (timeDifference === 30 || timeDifference === 15) {
      // Send notification
      const channel = client.channels.cache.get("1151460014968545350");
      if (channel) {
        channel.send(
          `Class ${classInfo.module} starts in ${timeDifference} minutes.`
        );
      }
    }
  }
}, 60 * 1000); // Run every minute

// Login to Discord
client.login(process.env.BOT_TOKEN);
