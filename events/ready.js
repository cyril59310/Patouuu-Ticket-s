const chalk = require('chalk');

module.exports = {
  name: 'ready',
  execute(client) {
    console.log(chalk.green('[cyril59310#9010 & ๖̶ζ͜͡Patoûûû༻#8321]') + chalk.cyan('💜'))
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setAuthor('Ticket', client.user.avatarURL())
        .setDescription('Cliquez sur le bouton ci-dessous pour ouvrir un ticket.')
        .setFooter(`${client.user.tag} `, client.user.displayAvatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('Ouvrir un ticket')
          .setEmoji('✉️')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    oniChan.bulkDelete(100).then(() => {
      sendTicketMSG()
      console.log(chalk.green('[PatouTicket]') + chalk.cyan(' Envoyé le widget de création de ticket..'))
    })
  },
};