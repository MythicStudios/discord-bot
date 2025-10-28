const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/servers.json');

module.exports = {
  name: 'kick',
  execute: async (message, args) => {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a member to kick!');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const member = await message.guild.members.fetch(user.id);
      await member.kick(reason);

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const guildConfig = config[message.guild.id];

      if (guildConfig && guildConfig.logsChannel) {
        const logsChannel = message.guild.channels.cache.get(guildConfig.logsChannel);

        if (logsChannel) {
          const kickEmbed = {
            color: 0xFFA500,
            title: 'Member Kicked',
            fields: [
              {
                name: 'Member',
                value: `${user.tag} (${user.id})`,
                inline: false,
              },
              {
                name: 'Reason',
                value: reason,
                inline: false,
              },
              {
                name: 'Kicked By',
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

          logsChannel.send({ embeds: [kickEmbed] });
        }
      }

      message.reply(`✓ ${user.tag} has been kicked. Reason: ${reason}`);
    } catch (error) {
      console.error('Error kicking member:', error);
      message.reply('There was an error kicking this member!');
    }
  },
};
