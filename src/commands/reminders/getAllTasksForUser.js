const { createUserTasksEmbed } = require("../../utils/discordUtils");
const { getAllTasksForUser } = require("../../repositories/sqlRepository");

module.exports = {
  name: "gettasks",
  description: "See all tasks associated with you",
  callback: async (client, interaction) => {
    try {
      console.log("Command invoked"); // Debugging line

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
};
