const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cors());

// Create an HTTP server and attach Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // For demo purposes; adjust in production
    methods: ["GET", "POST"]
  }
});

// Endpoint for one-time stock data fetch (optional)
app.get('/stocks', (req, res) => {
  const stocks = [
    { symbol: 'AAPL', price: (Math.random() * 50 + 100).toFixed(2) },
    { symbol: 'GOOG', price: (Math.random() * 100 + 1000).toFixed(2) },
    { symbol: 'MSFT', price: (Math.random() * 30 + 150).toFixed(2) },
  ];
  res.json(stocks);
});

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('Client connected');

  // Emit updated stock data every 5 seconds
  const intervalId = setInterval(() => {
    const stocks = [
      { symbol: 'AAPL', price: (Math.random() * 50 + 100).toFixed(2) },
      { symbol: 'GOOG', price: (Math.random() * 100 + 1000).toFixed(2) },
      { symbol: 'MSFT', price: (Math.random() * 30 + 150).toFixed(2) },
    ];
    socket.emit('stockData', stocks);
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(intervalId);
    console.log('Client disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
