const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/servers.json');

module.exports = {
  name: 'ban',
  execute: async (message, args) => {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a user to ban!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.ban({ reason });

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const guildConfig = config[message.guild.id];

      if (guildConfig && guildConfig.logsChannel) {
        const logsChannel = message.guild.channels.cache.get(guildConfig.logsChannel);

        if (logsChannel) {
          const banEmbed = {
            color: 0xFF0000,
            title: 'User Banned',
            fields: [
              {
                name: 'User',
                value: `${user.tag} (${user.id})`,
                inline: false,
              },
              {
                name: 'Reason',
                value: reason,
                inline: false,
              },
              {
                name: 'Banned By',
                value: `${message.author.tag}`,
                inline: false,
              },
              {
                name: 'Date',
                value: new Date().toLocaleString(),
                inline: false,
              },
            ],
          };

          logsChannel.send({ embeds: [banEmbed] });
        }
      }

      message.reply(`✓ ${user.tag} has been banned. Reason: ${reason}`);
    } catch (error) {
      console.error('Error banning user:', error);
      message.reply('There was an error banning this user!');
    }
  },
};
