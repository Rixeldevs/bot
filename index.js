const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.login(process.env.TOKEN);
