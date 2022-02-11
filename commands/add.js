const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Ajouter quelqu\'un au ticket')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Membre à ajouter au ticket')
        .setRequired(true)),
  async execute(interaction, client) {
    const chan = client.channels.cache.get(interaction.channelId);
    const user = interaction.options.getUser('target');
    if (chan.name.includes('ticket')) {
        chan.permissionOverwrites.create(
          user,{SEND_MESSAGES:true,VIEW_CHANNEL:true}
        ).then(async () => {
        interaction.reply({
          content: `<@${user.id}> a été ajouté au ticket !`
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
