const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getRealName, getHours } = require('../../services/helper.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkhours')
    .setDescription('Privately shows your recorded hours (Fall & Spring)'),

  async execute(interaction) {
    const mapping = await getRealName(interaction.user.id);
    if (!mapping) {
      await interaction.reply({
        content: 'I don’t know your name yet! Please run `/editname` first.',
        ephemeral: true,
      });
      return;
    }

    const { fall, spring, fallBreakdown, sprBreakdown } = await getHours(mapping);

    const embed = new EmbedBuilder()
      .setTitle(`${mapping.first} ${mapping.last} — Volunteer Hours`)
      .setColor(0x3498db)
      .addFields(
        { name: 'Fall Total', value: `${fall ?? '0'} hrs`, inline: true },
        { name: 'Spring Total', value: `${spring ?? '0'} hrs`, inline: true }
      );

    if (fallBreakdown.length) {
      embed.addFields({
        name: 'Fall Hour Breakdown',
        value: fallBreakdown.map(e => `• **${e.label}**: ${e.hours} hrs`).join('\n'),
      });
    }

    if (sprBreakdown.length) {
      embed.addFields({
        name: 'Spring Hour Breakdown',
        value: sprBreakdown.map(e => `• **${e.label}**: ${e.hours} hrs`).join('\n'),
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};