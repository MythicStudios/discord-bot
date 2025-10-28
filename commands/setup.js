const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/servers.json');
const configDir = path.dirname(configPath);

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, '{}');
}

module.exports = {
  name: 'setup',
  execute: async (message, args) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command!');
    }

    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'logs') {
      const channel = message.mentions.channels.first();

      if (!channel) {
        return message.reply('Please mention a channel! Example: !setup logs #logs');
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      config[message.guild.id].logsChannel = channel.id;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      message.reply(`✓ Logs channel set to ${channel}`);
    } else {
      message.reply('Available subcommands: !setup logs <#channel>');
    }
  },
};
