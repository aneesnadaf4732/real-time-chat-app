const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const errorHandler = require('../middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', require('../routes/auth'));
app.use('/api/messages', require('../routes/messages'));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('chatMessage', (msg) => {
    io.to(msg.room).emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(errorHandler);

module.exports = { app, server };