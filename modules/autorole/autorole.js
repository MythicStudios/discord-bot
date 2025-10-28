module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      const role = member.guild.roles.cache.find(r => r.name === 'Member');

      if (!role) {
        console.error('Member role not found on server');
        return;
      }

      await member.roles.add(role);
      console.log(`Assigned Member role to ${member.user.tag}`);
    } catch (error) {
      console.error('Error assigning Member role:', error);
    }
  });
};
