import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = 'https://programa-o-distribu-da-production.up.railway.app';
const socket = io(BACKEND_URL);

function App() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Carrega as notas do backend
    axios.get(`${BACKEND_URL}/notes`).then(res => setNotes(res.data));

    // Escuta adição de nota
    socket.on('noteAdded', (note) => {
      setNotes(prev => [...prev, note]);
    });

    // Escuta exclusão de nota
    socket.on('noteDeleted', (deletedId) => {
      setNotes(prev => prev.filter(note => note._id !== deletedId));
    });

    return () => {
      socket.off('noteAdded');
      socket.off('noteDeleted');
    };
  }, []);

  const addNote = async () => {
    if (content.trim() === '') return;
    await axios.post(`${BACKEND_URL}/notes`, { content });
    setContent('');
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta nota?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/notes/${id}`);
      // A remoção será tratada pelo socket
    } catch (err) {
      console.error('Erro ao excluir nota:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Notas Sincronizadas
      </h1>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
          rows="3"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Digite sua nota..."
        ></textarea>

        <button
          style={{
            marginTop: '10px',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
          onClick={addNote}
        >
          Adicionar Nota
        </button>
      </div>

      <ul style={{ padding: 0, listStyle: 'none' }}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <li
              key={note._id}
              style={{
                backgroundColor: 'white',
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{note.content}</span>
              <button
                onClick={() => deleteNote(note._id)}
                style={{
                  marginLeft: '10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Excluir
              </button>
            </li>
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>Nenhuma nota disponível</p>
        )}
      </ul>
    </div>
  );
}

export default App;
