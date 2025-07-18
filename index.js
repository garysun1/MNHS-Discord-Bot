const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config/config.json');

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load command folders
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

// Load command files
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

// Bot ready event
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Slash command handler
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching "${interaction.commandName}" found.`);
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

// Log in to Discord
client.login(token);
