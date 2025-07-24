const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');
const { token } = require('./config/config.json');
const gameManager = require('./services/game-manager');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

	try {
	  const imported = require(filePath);
	  const command = imported?.default ?? imported;

	  if (command?.data?.name && typeof command.execute === 'function') {
		client.commands.set(command.data.name, command);
	  } else {
		console.warn(`[WARNING] Invalid command format at ${filePath}`);
	  }
	} catch (err) {
	  console.error(`[ERROR] Failed to load command at ${filePath}:`, err);
	}
  }
}

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user.setActivity('/checkhours', { type: ActivityType.Playing });
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command "${interaction.commandName}":`, error);
	try {
	  await interaction.reply({
		content: 'There was an error while executing this command!',
		ephemeral: true,
	  });
	} catch (err) {
	  console.error('Failed to send error reply:', err);
	}
  }
});

client.login(token);