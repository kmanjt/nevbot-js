require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField } = require("discord.js");
const { db, initializeClasses } = require("./repositories/sqlRepository");
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
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.once("ready", (c) => {
  console.log(`Bot is online and logged in as ${c.user.tag}!`);

  // Initialize the database with today's classes
  const todayClasses = getTodayClasses();
  initializeClasses(todayClasses);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!today") {
    const embed = createDailyTimetableEmbed();

    message.channel.send({ embeds: [embed] });
  }
});

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "general"
  );
  if (!channel) {
    console.log("Channel not found");
    return;
  }
  channel.send(`Welcome to the server, ${member}`);
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

    const channel = client.channels.cache.find((ch) => ch.name === "timetable");
    if (!channel) {
      console.log("Channel not found");
      return;
    }

    // Unique identifier for each class
    const classIdentifier = `${classInfo.module}-${classTime.toISOString()}`;

    db.get(
      "SELECT * FROM notifiedClasses WHERE classIdentifier = ?",
      [classIdentifier],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }

        const notifiedAt30 = row ? row.notifiedAt30 : 0;
        const notifiedAt15 = row ? row.notifiedAt15 : 0;

        if (timeDifference <= 30 && timeDifference >= 25 && !notifiedAt30) {
          // Send 30-minute notification and update database
          channel.send(
            `@everyone Class ${classInfo.module} starts in ${timeDifference} minutes in building ${classInfo.building} room ${classInfo.room}`
          );
          db.run(
            "INSERT OR REPLACE INTO notifiedClasses (classIdentifier, notifiedAt30, notifiedAt15) VALUES (?, 1, 0)",
            [classIdentifier]
          );
        } else if (
          timeDifference <= 15 &&
          timeDifference >= 10 &&
          !notifiedAt15
        ) {
          // Send 15-10-minute notification and update database
          channel.send(
            `@everyone Class ${classInfo.module} starts in ${timeDifference} minutes in building ${classInfo.building} room ${classInfo.room}`
          );
          // Delete the row as it's no longer needed today
          db.run("DELETE FROM notifiedClasses WHERE classIdentifier = ?", [
            classIdentifier,
          ]);
        }
      }
    );
  }
}, 60 * 1000); // Run every minute

// Calculate milliseconds until midnight
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0);
const msUntilMidnight = midnight - now;

// Clear the database at midnight and then every 24 hours
setTimeout(() => {
  clearDatabase();
  setInterval(clearDatabase, 24 * 60 * 60 * 1000);
}, msUntilMidnight);

// Login to Discord
client.login(process.env.BOT_TOKEN);
