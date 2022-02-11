const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('remove')
      .setDescription('Retirer quelqu\'un du ticket')
      .addUserOption(option =>
        option.setName('target')
        .setDescription('Membre à retirer du ticket')
        .setRequired(true)),
    async execute(interaction, client) {
      const chan = client.channels.cache.get(interaction.channelId);
      const user = interaction.options.getUser('target');
      if (chan.name.includes('ticket')) {
        chan.permissionOverwrites.create(
          user,{SEND_MESSAGES:false,VIEW_CHANNEL:false}
        ).then(async () => {
          interaction.reply({
            content: `<@${user.id}> a été retiré du ticket !`
          });
        });
      } else {
        interaction.reply({
          content: 'Vous n\'êtes pas dans un canal de ticket !',
          ephemeral: true
        });
      };
    },
  };
  