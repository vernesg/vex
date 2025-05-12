const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  // Command data for registering with Discord
  data: new SlashCommandBuilder()
    .setName('hentaigif')
    .setDescription('Sends a random hentai GIF from the Kaiz API')
    .setDMPermission(false), // Only allow usage in servers

  // This is the actual code that runs when the command is used
  async execute(interaction) {
    // Check if the command is used in an NSFW channel
    if (!interaction.channel.nsfw) {
      return await interaction.reply({
        content: 'This command can only be used in **NSFW channels**.',
        ephemeral: true,
      });
    }

    // Inform user that the bot is processing the request
    await interaction.deferReply();

    try {
      // Fetch data from the Kaiz API
      const response = await fetch('https://kaiz-apis.gleeze.com/api/hentaigif');

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }

      // Parse JSON data
      const data = await response.json();

      // Check if the expected URL is present
      if (!data || !data.url) {
        return await interaction.editReply('No GIF was returned by the API.');
      }

      // Create an embed to display the hentai GIF
      const hentaiEmbed = new EmbedBuilder()
        .setTitle('Random Hentai GIF')
        .setImage(data.url)
        .setColor('Purple')
        .setFooter({ text: 'Powered by Kaiz API' })
        .setTimestamp();

      // Send the embed as a reply
      await interaction.editReply({ embeds: [hentaiEmbed] });

    } catch (error) {
      console.error('Error while fetching hentai GIF:', error);

      // Handle errors gracefully
      await interaction.editReply({
        content: 'There was an error trying to fetch the hentai GIF. Please try again later.',
      });
    }
  },
};