const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GameManager } = require('../../services/game-manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startgame')
    .setDescription('Start a new math challenge game.')
    .addIntegerOption(option => option.setName('seconds_per_round').setDescription('Seconds per round').setRequired(true))
    .addIntegerOption(option => option.setName('points_to_win').setDescription('Points to win the game').setRequired(true))
    .addIntegerOption(option => option.setName('number_of_digits').setDescription('Number of input digits (4 recommended)').setRequired(true)),
  async execute(interaction) {
    const secondsPerRound = interaction.options.getInteger('seconds_per_round');
    const pointsToWin = interaction.options.getInteger('points_to_win');
    const numDigits = interaction.options.getInteger('number_of_digits');

    const embed = new EmbedBuilder()
      .setTitle('Starting a new game')
      .setDescription('During each round, reach the target number using the provided digits. Digits can be concatenated and evaluated using common mathematical operations. First one to answer gets a point!')
      .setColor(0x3498db)
      .addFields(
        {
          name: 'Allowed Operators',
          value:
            '`+` Addition\n' +
            '`-` Subtraction\n' +
            '`*` Multiplication\n' +
            '`/` Division\n' +
            '`%` Modulo\n' +
            '`^` Exponentiation\n' +
            '`!` Factorial\n' +
            '`()` Parentheses\n' +
            '`&`, `|`, `<<`, `>>` Bitwise\n' +
            '...and [more](https://mathjs.org/docs/reference/functions.html)\n',
          inline: true
        },
        {
          name: 'Game Settings',
          value:
            `**Time per round:** \`${secondsPerRound}\` sec\n` +
            `**Points to win:** \`${pointsToWin}\`\n` +
            `**Digits per round:** \`${numDigits}\`\n`,
          inline: true
        }
      );

    const started = GameManager.startGame(interaction.channel, {
      host: interaction.user.id,
      secondsPerRound,
      pointsToWin,
      numDigits
    });

    if (started) {
      await interaction.reply({ embeds: [embed] });
      interaction.channel.send('Starting in 5 seconds!');
    } else {
      await interaction.reply({
        content: 'A game is already running in this channel. Use `/stopgame` to end it.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};