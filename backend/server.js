import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Modelo de nota
const Note = mongoose.model('Note', new mongoose.Schema({
  content: String
}));

app.use(cors());
app.use(express.json());

// Rota GET - Buscar notas
app.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// Rota POST - Adicionar nota
app.post('/notes', async (req, res) => {
  const note = new Note({ content: req.body.content });
  await note.save();
  io.emit('noteAdded', note);
  res.status(201).json(note);
});

// ✅ Rota DELETE - Excluir nota
app.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (deletedNote) {
      io.emit('noteDeleted', id); // notifica todos os clientes
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Nota não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao deletar nota:', err);
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
});

// Socket.IO conexão
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
