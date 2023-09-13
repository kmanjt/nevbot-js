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
// Create an object to keep track of notifications
const notifiedClasses = {};

setInterval(async () => {
  const todayClasses = getTodayClasses();
  const currentTime = new Date();

  // Loop through each time slot for today's classes
  console.log("Checking for classes...");
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

    const timeDifference = Math.round((classTime - currentTime) / 1000 / 60); // Time difference in whole minutes

    // Create a unique identifier for each class
    const classIdentifier = `${classInfo.module}-${classTime.toISOString()}`;

    if (
      timeDifference <= 30 &&
      timeDifference >= 25 &&
      !notifiedClasses[classIdentifier]?.notifiedAt30
    ) {
      // Send 30-minute notification
      const channel = client.channels.cache.get("1151460014968545350");
      if (channel) {
        channel.send(
          `@everyone Class ${classInfo.module} starts in ${timeDifference} minutes in building ${classInfo.building} room ${classInfo.room}`
        );
        // Mark this class as notified at 30 minutes
        notifiedClasses[classIdentifier] = {
          ...notifiedClasses[classIdentifier],
          notifiedAt30: true,
        };
      }
    } else if (
      timeDifference === 15 &&
      !notifiedClasses[classIdentifier]?.notifiedAt15
    ) {
      // Send 15-minute notification
      const channel = client.channels.cache.get("1151460014968545350");
      if (channel) {
        channel.send(
          `@everyone Class ${classInfo.module} starts in 15 minutes in building ${classInfo.building} room ${classInfo.room}`
        );
        // Mark this class as notified at 15 minutes
        notifiedClasses[classIdentifier] = {
          ...notifiedClasses[classIdentifier],
          notifiedAt15: true,
        };
      }
    }
  }
}, 60 * 1000); // Run every minute

// Login to Discord
client.login(process.env.BOT_TOKEN);
