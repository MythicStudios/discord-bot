const timeParser = require('../utils/timeParser');
const db = require('../database/db');

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

      const mutedAt = new Date().getTime();
      const unmuteAt = mutedAt + duration;

      db.run(
        `INSERT OR REPLACE INTO mutes (guildId, userId, mutedAt, unmuteAt, reason, mutedBy)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [message.guild.id, user.id, mutedAt, unmuteAt, reason, message.author.id],
        (err) => {
          if (err) console.error('Database error:', err);
        }
      );

      db.get(
        `SELECT channelId FROM logs_channels WHERE guildId = ?`,
        [message.guild.id],
        (err, row) => {
          if (err) console.error('Database error:', err);

          if (row) {
            const logsChannel = message.guild.channels.cache.get(row.channelId);

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
        }
      );

      message.reply(`✓ ${user.tag} has been muted for ${timeArg}. Reason: ${reason}`);
    } catch (error) {
      console.error('Error muting member:', error);
      message.reply('There was an error muting this member!');
    }
  },
};
