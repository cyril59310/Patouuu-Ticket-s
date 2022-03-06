const { getPasteUrl, PrivateBinClient } = require('@agc93/privatebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Vous avez déjà un ticket ouvert !',
          ephemeral: true
        });
      };

      let ticketid
      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL'],
            deny: ['SEND_MESSAGES'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        ticketid = c.id
        interaction.reply({
          content: `Ticket créé ! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor(`${interaction.user.username}'s Ticket`, 'https://img.cyril59310.fr/c48csn.png')
          .setDescription('Sélectionnez la catégorie de votre ticket')
          .setFooter(`${client.user.tag} `, client.user.displayAvatarURL())
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Sélectionnez la catégorie du ticket')
            .addOptions([{
                label: client.config.Category1,
                value: client.config.Category1,
                emoji: '🤖',
              },
              {
                label: client.config.Category2,
                value: client.config.Category2,
                emoji: '🔧',
              },
              {
                label: client.config.Category3,
                value: client.config.Category3,
                emoji: '🚨',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 300000 //5 minutes
        });

        console.log(ticketid)
        const chan = client.channels.cache.get(ticketid);
        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', interaction.user.displayAvatarURL())
                  .setDescription(`<@!${interaction.user.id}> Création d'un ticket avec des problèmes concernant \`${i.values[0]}\`\n\n**/add** pour ajouter un membre au ticket\n**/remove** pour supprimer un membre au ticket`)
                  .setFooter(`${client.user.tag} `, client.user.displayAvatarURL())
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('Fermer')
                    .setEmoji('✖')
                    .setStyle('DANGER'),
                  );
                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
          };
          chan.permissionOverwrites.create(
            interaction.user.id,{SEND_MESSAGES:true,VIEW_CHANNEL:true})
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Aucune catégorie sélectionnée. Fermeture du ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('Fermer')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('Annuler')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Êtes-vous sûr de vouloir fermer le ticket ?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket fermé par <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', 'https://img.cyril59310.fr/c48csn.png')
                .setDescription('```Résumé du ticket```')
                .setFooter(`${client.user.tag} `, client.user.displayAvatarURL())
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Supprimer')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'Abandon de la fermeture !',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Abandon de la fermeture !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Enregistrement des messages...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('en-EN')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        var paste = new PrivateBinClient("https://privatebin.net/");
        var result = await paste.uploadContent(a, {uploadFormat: 'markdown'})
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Ticket Logs', 'https://img.cyril59310.fr/c48csn.png')
              .setDescription(`📰 Logs pour le ticket \`${chan.id}\` | créé par <@!${chan.topic}> | fermé par <@!${interaction.user.id}>\n\nLogs: [**Cliquez ici pour voir les journaux**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter("Ce journal sera supprimé dans 24 heures !")
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Ticket Logs', 'https://img.cyril59310.fr/c48csn.png')
              .setDescription(`📰 Logs pour le ticket \`${chan.id}\`: [**Cliquez ici pour voir les journaux**](${getPasteUrl(result)})`)
              .setColor('2f3136')
              .setFooter("Ce journal sera supprimé dans 24 heures !")
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            }).catch(() => console.log("Canal du journal des tickets introuvable."));
            chan.send('Suppression du channel...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
    };
  },
};