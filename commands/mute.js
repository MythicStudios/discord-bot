const fs = require('fs');
const path = require('path');
const timeParser = require('../utils/timeParser');

const configPath = path.join(__dirname, '../config/servers.json');
const mutesPath = path.join(__dirname, '../config/mutes.json');

if (!fs.existsSync(mutesPath)) {
  fs.writeFileSync(mutesPath, '{}');
}

module.exports = {
  name: 'mute',
  execute: async (message, args) => {
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply('You do not have permission to use this command!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a member to mute!');
    }

    const timeArg = args[1];
    if (!timeArg) {
      return message.reply('Please specify a time! Example: 1m, 1h, 1d, 1w, 1y');
    }

    const duration = timeParser(timeArg);
    if (duration === 0) {
      return message.reply('Invalid time format! Use: 1m, 1h, 1d, 1w, 1y');
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      const member = await message.guild.members.fetch(user.id);

      await member.timeout(duration, reason);

      const mutes = JSON.parse(fs.readFileSync(mutesPath, 'utf8'));
      if (!mutes[message.guild.id]) {
        mutes[message.guild.id] = {};
      }

      mutes[message.guild.id][user.id] = {
        mutedAt: new Date().getTime(),
        unmuteAt: new Date().getTime() + duration,
        reason,
      };

      fs.writeFileSync(mutesPath, JSON.stringify(mutes, null, 2));

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const guildConfig = config[message.guild.id];

      if (guildConfig && guildConfig.logsChannel) {
        const logsChannel = message.guild.channels.cache.get(guildConfig.logsChannel);

        if (logsChannel) {
          const muteEmbed = {
            color: 0xFFFF00,
            title: 'Member Muted',
            fields: [
              {
                name: 'Member',
                value: `${user.tag} (${user.id})`,
                inline: false,
              },
              {
                name: 'Duration',
                value: timeArg,
                inline: false,
              },
              {
                name: 'Reason',
                value: reason,
                inline: false,
              },
              {
                name: 'Muted By',
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

          logsChannel.send({ embeds: [muteEmbed] });
        }
      }

      message.reply(`✓ ${user.tag} has been muted for ${timeArg}. Reason: ${reason}`);
    } catch (error) {
      console.error('Error muting member:', error);
      message.reply('There was an error muting this member!');
    }
  },
};
