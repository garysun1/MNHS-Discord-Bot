const { SlashCommandBuilder } = require('discord.js');
const { GameManager } = require('../../services/game-manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopgame')
    .setDescription('Stop the currently running math game.'),

  async execute(interaction) {
    const channel = interaction.channel;

    const stopped = GameManager.stopGame(channel);
    if (stopped) {
      await interaction.reply('Game has been stopped.');
    } else {
      await interaction.reply({ content: 'No game is currently running in this channel.', ephemeral: true });
    }
  }
};