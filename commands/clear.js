module.exports = {
  name: 'clear',
  execute: async (message, args) => {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('You do not have permission to use this command!');
    }

    const amount = parseInt(args[0]) || 1;

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Please provide a number between 1 and 100!');
    }

    try {
      const deleted = await message.channel.bulkDelete(amount, true);

      const confirmMsg = await message.channel.send(
        `✓ ${deleted.size} messages deleted!`
      );

      setTimeout(() => confirmMsg.delete(), 3000);
    } catch (error) {
      console.error('Error deleting messages:', error);
      message.channel.send('There was an error deleting messages!');
    }
  },
};
