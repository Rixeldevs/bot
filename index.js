const WebSocket = require('ws');
const express = require('express');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) {
  console.error('TOKEN missing');
  process.exit(1);
}

// HTTP server for pings (Replit + UptimeRobot)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('alive'));
app.listen(PORT, () => console.log('Web OK on', PORT));

let heartbeatTimer = null;

function connect() {
  // clear previous heartbeat before new connection
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

  ws.on('open', () => {
    console.log('✅ Selfbot connected');
    ws.send(JSON.stringify({
      op: 2,
      d: {
        token,
        properties: {
          $os: 'linux',
          $browser: 'chrome',
          $device: 'chrome'
        },
        presence: { status: 'online' }
      }
    }));
  });

  ws.on('message', (data) => {
    try {
      const packet = JSON.parse(data.toString());
      // OP 10 = HELLO (Discord sends heartbeat_interval here)
      if (packet.op === 10 && packet.d && packet.d.heartbeat_interval) {
        const interval = packet.d.heartbeat_interval;
        console.log('❤️ Heartbeat every', interval, 'ms');

        if (heartbeatTimer) clearInterval(heartbeatTimer);

        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // proper heartbeat op 1
            ws.send(JSON.stringify({ op: 1, d: null }));
          }
        }, interval);
      }
    } catch (e) {
      console.error('message error:', e.message);
    }
  });

  ws.on('close', (code) => {
    console.log('WS closed with code', code, '- reconnecting in 5s');
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    setTimeout(connect, 5000);
  });

  ws.on('error', (err) => {
    console.error('WS error:', err.message);
  });
}

connect();
