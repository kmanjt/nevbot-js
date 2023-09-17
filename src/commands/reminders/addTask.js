const {
  isValidDate,
  isDateWithinLimit,
  isFutureDate,
} = require("../../utils/miscUtils");
const { insertTask } = require("../../repositories/sqlRepository");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "addtask",
  description: "Adds a new task for yourself",
  // devOnly: Boolean,
  // testOnly: Boolean,
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
  callback: (client, interaction) => {
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
};
