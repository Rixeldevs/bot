const WebSocket = require('ws');
const express = require('express');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) process.exit(1);

const app = express();
app.get('/', (req, res) => res.send('alive'));
app.listen(process.env.PORT || 5000, () => console.log('Web OK'));

let heartbeatInterval;
const connect = () => {
  const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
  
  ws.on('open', () => {
    console.log('✅ Selfbot connected');
    ws.send(JSON.stringify({
      op: 2,
      d: {
        token,
        properties: {$os: "linux", $browser: "Chrome", $device: "Chrome"},
        presence: {status: "online"}
      }
    }));
  });
  
  ws.on('message', data => {
    try {
      const packet = JSON.parse(data.toString());
      if (packet.op === 10) {
        heartbeatInterval = packet.d.heartbeat_interval;
        setInterval(() => ws.ping(), heartbeatInterval);
        console.log('❤️ Heartbeat started');
      }
    } catch {}
  });
  
  ws.on('close', () => {
    console.log('Reconnecting...');
    setTimeout(connect, 5000);
  });
};

connect();
