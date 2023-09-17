const {
  isValidDate,
  isDateWithinLimit,
  isFutureDate,
} = require("../../utils/miscUtils");
const { createUserTasksEmbed } = require("../../utils/discordUtils");
const {
  insertTask,
  getAllTasksForUser,
  markTaskAsComplete,
} = require("../../repositories/sqlRepository");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "reminders",
  description: "Manage COMSCI3 timetables.",
  options: [
    {
      name: "add",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Adds a new reminder for yourself.",
      execute: (client, interaction) => {
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
          interaction.reply({
            content: `Please enter a valid future date within the next month. The date was valid: ${dateValid}, within limit: ${dateWithinLimit}, in the future: ${futureDate}`,
            ephemeral: true,
          });

          return;
        }

        // Insert the task into the database
        insertTask(taskDescription, dueDate, userID);
        interaction.reply("Task added!");
      },
    },
    {
      name: "get",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Get all reminders for yourself.",
      execute: async (client, interaction) => {
        try {
          const userID = interaction.user.id;
          const userName = interaction.user.username;

          console.log(`Fetching tasks for user: ${userName} (${userID})`); // Debugging line

          // Await the embed creation
          const embed = await createUserTasksEmbed(userID, userName);
          console.log("Embed created:", embed); // Debugging line

          // Fetch tasks and reply
          const tasks = await getAllTasksForUser(userID);
          console.log("Tasks fetched:", tasks); // Debugging line

          if (tasks && tasks.length > 0) {
            interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            interaction.reply({
              content: "You have no tasks associated with you.",
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error("An error occurred:", error); // Debugging line
        }
      },
    },
    {
      name: "complete",
      type: ApplicationCommandOptionType.Subcommand,
      description: "Mark a task as complete.",
      execute: async (client, interaction) => {
        const taskID = interaction.options.getInteger("task_id");
        const userID = interaction.user.id;
    
        // Mark the task as complete in the database
        await markTaskAsComplete(taskID, userID);
    
        interaction.reply("Task marked as complete!");
      },
      options: [
        {
          name: "task_id",
          type: ApplicationCommandOptionType.Integer,
          description: "The ID of the task to mark as complete",
          required: true,
        },
      ],
    },    
  ],
  callback: function (client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    this.options
      .find((option) => option.name === subcommand)
      .execute(client, interaction);
  },
};
