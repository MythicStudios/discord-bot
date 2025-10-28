const db = require('../database/db');

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

      db.run(
        `DELETE FROM mutes WHERE guildId = ? AND userId = ?`,
        [message.guild.id, user.id],
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
        }
      );

      message.reply(`✓ ${user.tag} has been unmuted!`);
    } catch (error) {
      console.error('Error unmuting member:', error);
      message.reply('There was an error unmuting this member!');
    }
  },
};
