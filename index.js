const WebSocket = require('ws');
const express = require('express');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) process.exit(1);

const app = express();
app.get('/', (req, res) => res.send('alive'));
app.listen(process.env.PORT || 5000, () => console.log('Web OK'));

let heartbeatTimer = null;

const connect = () => {
  // Clear old heartbeat
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  
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
        const interval = packet.d.heartbeat_interval;
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: null })); // Proper heartbeat
          }
        }, interval);
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
