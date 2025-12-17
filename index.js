const WebSocket = require('ws');
const token = process.env.TOKEN;

if (!token) {
  console.log('ERROR: TOKEN env var missing');
  process.exit(1);
}

const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

ws.on('open', () => {
  ws.send(JSON.stringify({
    op: 2,
    d: {
      token: token,
      properties: { $os: "linux", $browser: "Chrome", $device: "Chrome" },
      presence: { status: "online" }
    }
  }));
  console.log('✅ Selfbot online!');
});

ws.on('message', data => {
  try {
    const packet = JSON.parse(data);
    if (packet.op === 10) ws.send(JSON.stringify({ op: 11, d: 1073741824 }));
  } catch {}
});

ws.on('close', () => setTimeout(() => process.exit(1), 5000));
