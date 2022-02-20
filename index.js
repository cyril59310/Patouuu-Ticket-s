const fs = require('fs');
const request = require('request')
const {
  Client,
  Collection,
  Intents
} = require('discord.js');
const chalk = require('chalk')
const config = require('./config.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const Discord = require('discord.js');
client.discord = Discord;
client.config = config;

setInterval(() => {
  request("http://45.155.170.110:3001/api/push/o1HWJkwnCH?msg=OK&ping=")
  console.log('ping status page')
}, 20000);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
};

client.on('guildMemberAdd' , async(member) => {
  const addRole = member.guild.roles.cache.get("820618671051374593")
  member.roles.add(addRole)

  const addRole2 = member.guild.roles.cache.get("744241445946392717")
  member.roles.add(addRole2)

  const addRole3 = member.guild.roles.cache.get("744241206858481815")
  member.roles.add(addRole3)

  const addRole4 = member.guild.roles.cache.get("748960097908162602")
  member.roles.add(addRole4)

  const addRole5 = member.guild.roles.cache.get("820625248629686292")
  member.roles.add(addRole5)

  const addRole6 = member.guild.roles.cache.get("748634093830406234")
  member.roles.add(addRole6)

  console.log('role ajouter')
})

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client, config);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'Une erreur s\'est produite lors de l\'exécution de cette commande !',
      ephemeral: true
    });
  };
});

client.login(require('./config.json').token);