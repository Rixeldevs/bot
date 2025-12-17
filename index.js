process.env.WERIFT_LOG_LEVEL = 'none';

const { Client } = require('discord.js-selfbot-v13');

const client = new Client({
  voice: false,
  voiceStateUpdateInterval: 0,
  checkUpdate: false,
  syncStatus: false,
  autoUpdate: false
});

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.login(process.env.TOKEN);
