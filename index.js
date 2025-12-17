const { Client } = require('selfcord');
const client = new Client();

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.login(process.env.TOKEN);

