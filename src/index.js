require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const {
  getTodayClasses,
  getWeekClasses,
} = require("./repositories/timetableRepository");

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
    const todayClasses = getTodayClasses();
    const dateObj = new Date();
    // set day in English
    const day = new Intl.DateTimeFormat("en-EU", { weekday: "long" }).format(
      dateObj
    );
    const date = dateObj.toLocaleDateString("en-EU");
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${day}-${date} COMSCI3 Classes`)
      .setTimestamp()
      .setFooter({ text: "Timetable" });

    for (const [time, classInfo] of Object.entries(todayClasses)) {
      const fieldName = `${time} - ${classInfo.module}`;
      const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
      embed.addFields({ name: fieldName, value: fieldValue });
    }

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!week") {
    const weekClasses = getWeekClasses();
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("This Week's COMSCI3 Classes")
      .setTimestamp()
      .setFooter({ text: "Timetable" });

    // Loop through each day
    for (const [day, timeSlots] of Object.entries(weekClasses)) {
      // Add a header for each day
      embed.addFields({ name: day, value: "\u200B" });

      // Loop through each time slot for that day
      for (const [time, classInfo] of Object.entries(timeSlots)) {
        const fieldName = `${time} - ${classInfo.module}`;
        const fieldValue = `Duration: ${classInfo.duration} mins\nType: ${classInfo.type}\nBuilding: ${classInfo.building}\nRoom: ${classInfo.room}`;
        embed.addFields({ name: fieldName, value: fieldValue });
      }
      embed.addFields({ name: "\u200B", value: "\n\u200B" });
    }

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!ping") {
    message.reply("Pong!");
  }

  if (message.content === "!timetable today") {
    const todayClasses = getTodayClasses();
    message.reply(`Today's classes: ${JSON.stringify(todayClasses)}`);
  }

  if (message.content === "!timetable week") {
    const weekClasses = getWeekClasses();
    message.reply(`This week's classes: ${JSON.stringify(weekClasses)}`);
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
      const channel = client.channels.cache.get("YOUR_CHANNEL_ID");
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
