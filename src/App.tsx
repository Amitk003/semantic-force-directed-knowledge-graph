import { useState, useRef, useEffect } from 'react';
import { useKnowledgeGraph } from './hooks/useKnowledgeGraph';
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from 'react-force-graph-2d';
import type { GraphNode, GraphLink } from './types';
import { cosineSimilarity } from './utils/vector';
import './App.css';

function App() {
  const { notes, graphData, loading, progress, addNote, removeNote } =
    useKnowledgeGraph();

  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Interactive UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(undefined);

  // Helper to extract node string ID
  const getNoteId = (nodeIdOrObj: unknown): string => {
    if (typeof nodeIdOrObj === 'object' && nodeIdOrObj !== null) {
      return (nodeIdOrObj as { id: string }).id;
    }
    return nodeIdOrObj as string;
  };

  // Filter links dynamically based on similarity threshold
  const filteredLinks = graphData.links.filter(
    (link) => link.similarity >= similarityThreshold,
  );

  // Dynamically calculate connected neighbors
  const neighbors = new Set<string>();
  if (selectedNoteId) {
    filteredLinks.forEach((link) => {
      const sourceId = getNoteId(link.source);
      const targetId = getNoteId(link.target);
      if (sourceId === selectedNoteId) {
        neighbors.add(targetId);
      } else if (targetId === selectedNoteId) {
        neighbors.add(sourceId);
      }
    });
  }

  // Update forces when links change
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) {
      return;
    }

    const chargeForce = fg.d3Force('charge');
    if (chargeForce) {
      chargeForce.strength(-150);
    }

    const linkForce = fg.d3Force('link');
    if (linkForce) {
      linkForce
        .distance(
          (link: unknown) => (1 - (link as LinkObject).similarity) * 120,
        )
        .strength((link: unknown) => (link as LinkObject).similarity);
    }

    return () => {
      fg.d3ReheatSimulation();
    };
  }, [graphData, similarityThreshold]);

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

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Calculate similarity rankings for the selected note
  const relatedNotes = selectedNote
    ? notes
        .filter((n) => n.id !== selectedNote.id)
        .map((n) => {
          const sim = cosineSimilarity(
            Array.from(selectedNote.embedding),
            Array.from(n.embedding),
          );
          return { note: n, similarity: sim };
        })
        .filter((item) => item.similarity >= similarityThreshold)
        .sort((a, b) => b.similarity - a.similarity)
    : [];

  const isModelLoading =
    progress.status === 'downloading' || progress.status === 'loading';

  // Node drawing routine
  const drawNode = (
    node: NodeObject<GraphNode>,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => {
    const isSelected = node.id === selectedNoteId;
    const isNeighbor =
      selectedNoteId !== null && neighbors.has(node.id as string);
    const label = node.label || '';

    // Search query matches
    const isSearchMatch =
      searchQuery.trim() !== '' &&
      label.toLowerCase().includes(searchQuery.toLowerCase());

    // Compute sizing
    const radius = isSelected ? 8 : isNeighbor ? 6 : 5;

    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI, false);

    // Apply color palettes
    if (isSelected) {
      ctx.fillStyle = '#58a6ff'; // Bright accent blue
    } else if (isNeighbor) {
      ctx.fillStyle = '#388bfd'; // Secondary light blue
    } else if (searchQuery && !isSearchMatch) {
      ctx.fillStyle = '#21262d'; // Dimmed inactive node
    } else {
      ctx.fillStyle = '#8b949e'; // Neutral standard gray
    }
    ctx.fill();

    // Outline style for focus
    if (isSelected || isSearchMatch) {
      ctx.strokeStyle = '#f2cc60'; // Gold circle highlight
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Font layout scaling
    const fontSize = 11 / globalScale;
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;

    if (globalScale > 0.8 || isSelected || isSearchMatch) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected
        ? '#58a6ff'
        : searchQuery && !isSearchMatch
          ? '#30363d'
          : '#c9d1d9';
      ctx.fillText(label, node.x || 0, (node.y || 0) + radius + 3);
    }
  };

  const handleNodeClick = (node: NodeObject<GraphNode>) => {
    setSelectedNoteId((prev) =>
      prev === node.id ? null : (node.id as string),
    );
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Semantic Graph</h1>
          <p>Local AI Note Clustering</p>
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

        {/* Global Controls Panel */}
        <div className="controls-panel">
          <div className="search-bar-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="search-input"
            />
          </div>
          <div className="slider-container">
            <div className="slider-header">
              <label>Link Strength Threshold</label>
              <span>{similarityThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) =>
                setSimilarityThreshold(parseFloat(e.target.value))
              }
              className="threshold-slider"
            />
          </div>
        </div>

        {/* Conditional Sidebar Views */}
        {selectedNote ? (
          <div className="note-details-panel">
            <div className="panel-actions">
              <button
                onClick={() => setSelectedNoteId(null)}
                className="back-btn"
              >
                Back to notes
              </button>
              <button
                onClick={async () => {
                  await removeNote(selectedNote.id);
                  setSelectedNoteId(null);
                }}
                className="delete-btn-full"
              >
                Delete note
              </button>
            </div>
            <div className="selected-note-card">
              <h3>Selected Note</h3>
              <p className="full-note-text">{selectedNote.text}</p>
              <span className="note-timestamp">
                {new Date(selectedNote.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="related-notes-section">
              <h3>Related Notes ({relatedNotes.length})</h3>
              {relatedNotes.length === 0 ? (
                <p className="empty-text">No notes meet the threshold.</p>
              ) : (
                <ul className="related-notes-list">
                  {relatedNotes.map(({ note, similarity }) => (
                    <li
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className="related-note-item"
                    >
                      <span className="similarity-badge">
                        {Math.round(similarity * 100)}% Match
                      </span>
                      <p className="related-note-preview">
                        {note.text.slice(0, 80)}
                        {note.text.length > 80 ? '...' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="note-form">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a new note here..."
                rows={3}
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
                  {notes
                    .filter((note) =>
                      note.text
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .map((note) => (
                      <li
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className="note-item-interactive"
                      >
                        <div className="note-content">
                          <p className="note-text">
                            {note.text.slice(0, 120)}
                            {note.text.length > 120 ? '...' : ''}
                          </p>
                          <span className="note-date">
                            {new Date(note.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>

      <main className="graph-container">
        {notes.length === 0 ? (
          <div className="graph-placeholder">
            <p>Write your first note on the left to start the graph.</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={{ nodes: graphData.nodes, links: filteredLinks }}
            nodeCanvasObject={drawNode}
            onNodeClick={handleNodeClick}
            nodeVal={6}
            linkWidth={(link: unknown) => (link as LinkObject).similarity * 3}
            linkColor={(link: unknown) => {
              const activeSource = getNoteId((link as LinkObject).source);
              const activeTarget = getNoteId((link as LinkObject).target);
              if (
                selectedNoteId === activeSource ||
                selectedNoteId === activeTarget
              ) {
                return 'rgba(56, 139, 253, 0.6)'; // Highlighted active link
              }
              return 'rgba(255, 255, 255, 0.1)'; // Default link color
            }}
            linkDirectionalParticles={(link: unknown) =>
              selectedNoteId === getNoteId((link as LinkObject).source) ||
              selectedNoteId === getNoteId((link as LinkObject).target)
                ? 4
                : 0
            }
            linkDirectionalParticleSpeed={(link: unknown) =>
              (link as LinkObject).similarity * 0.02
            }
          />
        )}
      </main>
    </div>
  );
}

export default App;
