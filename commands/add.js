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
    if (!interaction.member.roles.cache.find(r => r.id === client.config.roleSupport)) return interaction.reply({ content: "Vous devez avoir le role <@&" + client.config.roleSupport + "> .", ephemeral: true })
    if (chan.name.includes('ticket')) {
      chan.edit({
        permissionOverwrites: [{
          id: user,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: client.config.roleSupport,
          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
        },
        ],
      }).then(async () => {
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
