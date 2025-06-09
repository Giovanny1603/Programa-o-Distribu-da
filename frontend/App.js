import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Conexão com o backend
const BACKEND_URL = 'https://programa-o-distribu-da-production.up.railway.app';

const socket = io(BACKEND_URL);

function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Busca as notas corretas do backend
    axios.get(`${BACKEND_URL}/notes`).then(res => {
      setNotes(res.data);
    });

    // Atualiza a lista de notas em tempo real via Socket.io
    socket.on('noteAdded', (note) => {
      setNotes(prev => [...prev, note]);
    });

    return () => {
      socket.off('noteAdded');
    };
  }, []);

  const addNote = async () => {
    if (content.trim() === '') return;
    
    await axios.post(`${BACKEND_URL}/notes`, { content });
    setContent('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Notes Sync</h1>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          rows="3"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Digite sua nota..."
        ></textarea>
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          onClick={addNote}
        >
          Adicionar Nota
        </button>
      </div>
      <ul>
        {notes.map((note, index) => (
          <li key={index} className="bg-white p-2 my-2 rounded shadow">
            {note.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;