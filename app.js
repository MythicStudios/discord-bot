const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = new Map();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.set(command.name, command);
}

const autorole = require('./modules/autorole/autorole');
autorole(client);

client.on('ready', () => {
  console.log(`✓ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!commands.has(commandName)) return;

  const command = commands.get(commandName);

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing this command!');
  }
});

client.login(process.env.DISCORD_TOKEN);
