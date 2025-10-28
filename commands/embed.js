const { loadEmbed, getAvailableEmbeds } = require('../modules/embed/embedLoader');

module.exports = {
  name: 'embed',
  execute: async (message, args) => {
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'show') {
      const embedId = args[1];

      if (!embedId) {
        return message.reply('Please specify an embed ID! Example: !embed show partner');
      }

      const embedData = loadEmbed(embedId);

      if (!embedData) {
        return message.reply(`Embed "${embedId}" not found!`);
      }

      try {
        await message.channel.send({ embeds: [embedData] });
      } catch (error) {
        console.error('Error sending embed:', error);
        message.reply('There was an error sending the embed!');
      }
    } else if (subcommand === 'list') {
      const availableEmbeds = getAvailableEmbeds();

      if (availableEmbeds.length === 0) {
        return message.reply('No embeds available!');
      }

      const embedList = {
        color: 0x3498DB,
        title: 'Available Embeds',
        description: availableEmbeds.map(e => `\`${e}\``).join(', '),
        footer: {
          text: `Total: ${availableEmbeds.length} embeds`,
        },
      };

      message.reply({ embeds: [embedList] });
    } else {
      message.reply('Available subcommands: !embed show <id>, !embed list');
    }
  },
};
