import { useState, useRef, useEffect } from 'react';
import { useKnowledgeGraph } from './hooks/useKnowledgeGraph';
import ForceGraph2D from 'react-force-graph-2d';
import './App.css';

function App() {
  const { notes, graphData, loading, progress, addNote, removeNote } =
    useKnowledgeGraph();

  const [inputText, setInputText] = useState('');
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-150);
      fgRef.current
        .d3Force('link')
        .distance((link: any) => (1 - link.similarity) * 120)
        .strength((link: any) => link.similarity);
    }
  }, [graphData]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || submitting || progress.status !== 'ready') {
      return;
    }

    try {
      setSubmitting(true);
      await addNote(inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isModelLoading =
    progress.status === 'downloading' || progress.status === 'loading';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Semantic Graph</h1>
          <p>Local On-Device Note Clustering</p>
        </header>

        <div className="status-box">
          {progress.status === 'error' && (
            <div className="status-message error">
              Error: {progress.message}
            </div>
          )}
          {isModelLoading && (
            <div className="status-message loading">
              <p>{progress.message}</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
          {progress.status === 'ready' && (
            <div className="status-message ready">
              Model ready (WebGPU/WASM)
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="note-form">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a new note here..."
            rows={4}
            disabled={progress.status !== 'ready' || submitting}
          />
          <button
            type="submit"
            disabled={
              !inputText.trim() || progress.status !== 'ready' || submitting
            }
          >
            {submitting ? 'Generating Embedding...' : 'Add Note'}
          </button>
        </form>

        <div className="notes-list-container">
          <h2>Notes ({notes.length})</h2>
          {loading ? (
            <p className="loading-text">Loading notes from database...</p>
          ) : notes.length === 0 ? (
            <p className="empty-text">No notes saved yet.</p>
          ) : (
            <ul className="notes-list">
              {notes.map((note) => (
                <li key={note.id} className="note-item">
                  <div className="note-content">
                    <p className="note-text">{note.text}</p>
                    <span className="note-date">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="delete-btn"
                    title="Delete Note"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="graph-container">
        {notes.length === 0 ? (
          <div className="graph-placeholder">
            <p>Write your first note on the left to start the graph.</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="label"
            nodeColor={() => '#58a6ff'}
            nodeVal={6}
            linkWidth={(link: any) => link.similarity * 3}
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            linkDirectionalParticles={3}
            linkDirectionalParticleSpeed={(link: any) => link.similarity * 0.02}
          />
        )}
      </main>
    </div>
  );
}

export default App;
