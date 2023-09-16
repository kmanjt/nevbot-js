require("dotenv").config(); // Load environment variables from .env file
const { Client, IntentsBitField } = require("discord.js");
const {
  db,
  initializeClasses,
  insertTask,
  clearDatabase,
} = require("./repositories/sqlRepository");
const { getTodayClasses } = require("./repositories/timetableRepository");
const {
  createDailyTimetableEmbed,
  createWeeklyTimetableEmbed,
} = require("./utils/discordUtils");
const {
  isValidDate,
  isDateWithinLimit,
  isFutureDate,
} = require("./utils/miscUtils");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

client.once("ready", (c) => {
  console.log(`Bot is online and logged in as ${c.user.tag}!`);

  // Initialize the database with today's classes
  const todayClasses = getTodayClasses();
  initializeClasses(todayClasses);
  sendDailyReminders();
  // Registering the /addtask command
  client.application.commands.create({
    name: "addtask",
    description: "Adds a new task",
    options: [
      {
        name: "description",
        type: 3,
        description: "The description of the task",
        required: true,
      },
      {
        name: "day",
        type: 4,
        description: "The day the task is due (DD)",
        required: true,
      },
      {
        name: "month",
        type: 4,
        description: "The month the task is due (MM)",
        required: true,
      },
      {
        name: "year",
        type: 4,
        description: "The year the task is due (YYYY)",
        required: true,
      },
    ],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "addtask") {
    const taskDescription = interaction.options.getString("description");
    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");
    const year = interaction.options.getInteger("year");

    const dueDate = new Date(year, month - 1, day); // month is 0-indexed

    const userID = interaction.user.id;

    const dateValid = isValidDate(dueDate);
    const dateWithinLimit = isDateWithinLimit(dueDate);
    const futureDate = isFutureDate(dueDate);

    if (!dateValid || !dateWithinLimit || !futureDate) {
      console.log("Date for a given add task request was not valid!");
      console.log(
        `Date valid: ${dateValid}, within limit: ${dateWithinLimit}, future: ${futureDate}`
      );
      interaction.reply(
        "Please enter a valid future date within the next month. The correct command should look like: /addtask [description] [dueDate]"
      );
      return;
    }

    // Insert the task into the database
    insertTask(taskDescription, dueDate, userID);
    interaction.reply("Task added!");
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "!today") {
    const embed = createDailyTimetableEmbed();

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  const tokens = message.content.split(" ");
  if (tokens.slice(0, 2).join(" ") === "!add task") {
    const taskDescription = tokens[2];
    const dueDate = tokens[3];
    const userID = message.author.id;

    if (
      !isValidDate(dueDate) ||
      !isDateWithinLimit(dueDate) ||
      !isFutureDate(dueDate)
    ) {
      console.log("Date for a given add task request was not valid!");
      message.reply(
        "Please enter a valid future date within the next month. The correct command should look like: !add task [description] [dueDate]"
      );
      return;
    }

    // Insert the task into the database
    insertTask(taskDescription, dueDate, userID);
    message.reply("Task added!");
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

function sendDailyReminders() {
  setInterval(async () => {
    // Fetch all tasks that are not completed
    db.all("SELECT * FROM tasks WHERE completed = 0", [], async (err, rows) => {
      if (err) {
        console.error(`Database error: ${err.message}`);
        return;
      }

      console.log("Attempting to send reminders...");

      if (rows.length === 0) {
        console.log("No tasks found for reminders.");
        return;
      }

      const now = new Date();

      for (const row of rows) {
        const dueDate = new Date(row.dueDate);
        const isLate = now > dueDate;
        const taskID = row.taskID;
        const taskDescription = row.task;

        // Fetch the userID associated with the task from the notifyUsers table
        db.get(
          "SELECT userID FROM notifyUsers WHERE taskID = ?",
          [taskID],
          async (err, userRow) => {
            if (err) {
              console.error(
                `Database error while fetching userID: ${err.message}`
              );
              return;
            }

            if (!userRow) {
              console.warn(`No userID found for taskID ${taskID}`);
              return;
            }

            const userID = userRow.userID;

            // Find the Discord user by their ID
            let user = client.users.cache.get(userID);
            if (!user) {
              console.warn(
                `User with ID ${userID} not found in Discord cache. Fetching...`
              );
              try {
                user = await client.users.fetch(userID);
              } catch (error) {
                console.error(
                  `Failed to fetch user with ID ${userID}: ${error}`
                );
                return;
              }
            }

            // Send reminder
            if (isLate) {
              console.log(
                `Sending overdue reminder to user ${userID} for task ${taskID}`
              );
              user.send(
                `You have an overdue task: ${taskDescription}. Please complete it as soon as possible.`
              );
            } else {
              console.log(
                `Sending upcoming task reminder to user ${userID} for task ${taskID}`
              );
              user.send(
                `You have a task due soon: ${taskDescription}. Due date: ${dueDate}.`
              );
            }
          }
        );
      }
    });
  }, 24 * 60 * 60 * 1000); // Run every 60 seconds for testing, change this to 24 * 60 * 60 * 1000 for daily reminders
}

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
