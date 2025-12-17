const WebSocket = require('ws');
require('dotenv').config(); // For Replit secrets

const token = process.env.TOKEN;
if (!token) {
  console.error('❌ TOKEN missing from Secrets!');
  process.exit(1);
}

// Flask-like web server for UptimeRobot pings (keeps Replit alive)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Selfbot alive! 👋'));
app.listen(8080, () => console.log('✅ Web server on port 8080'));

// Discord WebSocket
const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

ws.on('open', () => {
  console.log('✅ Selfbot connected to Discord!');
  ws.send(JSON.stringify({
    op: 2,
    d: {
      token: token,
      properties: { $os: "linux", $browser: "Chrome", $device: "Chrome" },
      presence: { status: "online" },
      intents: 513
    }
  }));
});

ws.on('message', data => {
  try {
    const packet = JSON.parse(data.toString());
    if (packet.op === 10) {
      ws.send(JSON.stringify({ op: 11, d: 1073741824 }));
    }
    console.log(`📦 Event: ${packet.t || packet.op}`);
  } catch(e) {
    console.error('Packet error:', e);
  }
});

ws.on('error', err => console.error('WS Error:', err));
ws.on('close', (code) => {
  console.log(`Disconnected: ${code}. Restarting in 5s...`);
  setTimeout(() => process.exit(1), 5000);
});

// Keep alive logs
setInterval(() => console.log('❤️ Selfbot heartbeat'), 60000);
