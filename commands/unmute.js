const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/servers.json');
const mutesPath = path.join(__dirname, '../config/mutes.json');

module.exports = {
  name: 'unmute',
  execute: async (message, args) => {
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply('You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a member to unmute!');
    }

    try {
      const member = await message.guild.members.fetch(user.id);

      await member.timeout(null);

      const mutes = JSON.parse(fs.readFileSync(mutesPath, 'utf8'));
      if (mutes[message.guild.id] && mutes[message.guild.id][user.id]) {
        delete mutes[message.guild.id][user.id];
        fs.writeFileSync(mutesPath, JSON.stringify(mutes, null, 2));
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const guildConfig = config[message.guild.id];

      if (guildConfig && guildConfig.logsChannel) {
        const logsChannel = message.guild.channels.cache.get(guildConfig.logsChannel);

        if (logsChannel) {
          const unmuteEmbed = {
            color: 0x00FF00,
            title: 'Member Unmuted',
            fields: [
              {
                name: 'Member',
                value: `${user.tag} (${user.id})`,
                inline: false,
              },
              {
                name: 'Unmuted By',
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

          logsChannel.send({ embeds: [unmuteEmbed] });
        }
      }

      message.reply(`✓ ${user.tag} has been unmuted!`);
    } catch (error) {
      console.error('Error unmuting member:', error);
      message.reply('There was an error unmuting this member!');
    }
  },
};
