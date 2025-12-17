const WebSocket = require('ws');
const token = process.env.TOKEN;

if (!token) {
  console.error('ERROR: TOKEN env var missing');
  process.exit(1);
}

const ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

ws.on('open', () => {
  console.log('✅ Connecting to Discord gateway...');
  ws.send(JSON.stringify({
    op: 2,
    d: {
      token: token,
      properties: { 
        $os: "linux", 
        $browser: "Chrome", 
        $device: "Chrome" 
      },
      presence: { status: "online" },
      intents: 513 // Basic intents for selfbot
    }
  }));
  console.log('✅ Selfbot online!');
});

// Handle gateway events
ws.on('message', data => {
  try {
    const packet = JSON.parse(data.toString());
    console.log('Gateway packet:', packet.t || packet.op);
    
    if (packet.op === 10) { // Hello
      ws.send(JSON.stringify({ 
        op: 11, 
        d: 1073741824 // Heartbeat interval
      }));
    } else if (packet.op === 11) { // Heartbeat ACK
      console.log('Heartbeat ACK received');
    }
  } catch (e) {
    console.error('Packet parse error:', e);
  }
});

ws.on('error', error => {
  console.error('WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket closed: ${code} - ${reason}`);
  // Attempt reconnect after 5s
  setTimeout(() => {
    console.log('Attempting reconnect...');
    process.exit(1); // Render will restart
  }, 5000);
});

// Keep process alive for Render
console.log('Selfbot running...');
setInterval(() => {
  console.log('Heartbeat - Selfbot alive');
}, 30000); // Log every 30s to show activity
