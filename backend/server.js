// backend/server.js
import dotenv from 'dotenv';
dotenv.config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Note = mongoose.model('Note', new mongoose.Schema({
  content: String
}));

app.use(cors());
app.use(express.json());

app.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/notes', async (req, res) => {
  const note = new Note({ content: req.body.content });
  await note.save();
  io.emit('noteAdded', note);
  res.status(201).json(note);
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
