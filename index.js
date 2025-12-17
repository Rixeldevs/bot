const { Client, GatewayIntentBits } = require('discord.js-selfbot-v13');

const client = new Client({
  checkUpdate: false,
  syncStatus: true,
  autoUpdate: false,
  intents: [GatewayIntentBits.Guilds]
});

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.login(process.env.TOKEN);
