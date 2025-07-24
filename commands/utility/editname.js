import { SlashCommandBuilder } from 'discord.js';
import { setRealName } from '../../services/helper.js';

export const data = new SlashCommandBuilder()
  .setName('editname')
  .setDescription('Register your name exactly as it appears in our records. If you don\'t remember, ask an officer!')
  .addStringOption(o => o.setName('first').setDescription('First name').setRequired(true))
  .addStringOption(o => o.setName('last').setDescription('Last name').setRequired(true));

export async function execute(interaction) {
  const first = interaction.options.getString('first');
  const last  = interaction.options.getString('last');

  await setRealName(interaction.user.id, { first, last });
  await interaction.reply({
    content: `Saved as **${first} ${last}**`,
    flags: MessageFlags.Ephemeral
  });
}