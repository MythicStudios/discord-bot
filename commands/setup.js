const db = require('../database/db');

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

      db.run(
        `INSERT OR REPLACE INTO logs_channels (guildId, channelId)
         VALUES (?, ?)`,
        [message.guild.id, channel.id],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            message.reply('There was an error setting the logs channel!');
          } else {
            message.reply(`✓ Logs channel set to ${channel}`);
          }
        }
      );
    } else {
      message.reply('Available subcommands: !setup logs <#channel>');
    }
  },
};
