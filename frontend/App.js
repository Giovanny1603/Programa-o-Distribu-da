// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://SEU_BACKEND_URL');
axios.get('https://SEU_BACKEND_URL/notes')


function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    axios.get('https://notes-sync-api.up.railway.app/notes').then(res => {
      setNotes(res.data);
    });

    socket.on('noteAdded', (note) => {
      setNotes(prev => [...prev, note]);
    });

    return () => {
      socket.off('noteAdded');
    };
  }, []);

  const addNote = async () => {
    if (content.trim() === '') return;
    await axios.post('https://notes-sync-api.up.railway.app/notes', { content });
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
