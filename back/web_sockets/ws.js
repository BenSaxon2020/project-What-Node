const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// Load SSL/TLS certificates
const options = {
  key: fs.readFileSync('./private.key'),
  cert: fs.readFileSync('./certificate.crt')
};

// Create an HTTPS server
const server = https.createServer(options);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Event: New WebSocket connection
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Event: Received a message from a client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Event: WebSocket connection closed
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start the HTTPS server
server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
