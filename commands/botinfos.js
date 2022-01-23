const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Donne les crédits du bot.Donne les crédits du bot.'),
  async execute(interaction, client) {
    const embed = new client.discord.MessageEmbed()
      .setColor('6d6ee8')
      .setDescription('Développé avec le 💜 par ๖̶ζ͜͡Patoûûû༻#8321 & cyril59310#9010')
      .setFooter(client.user.tag, client.user.avatarURL())
      .setTimestamp();
    await interaction.reply({
      embeds: [embed]
    });
  },
};