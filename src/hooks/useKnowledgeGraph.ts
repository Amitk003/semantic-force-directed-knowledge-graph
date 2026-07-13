import { useState, useEffect, useCallback } from 'react';
import { useEmbedding } from './useEmbedding';
import { saveNote, getAllNotes, deleteNote } from '../db/notes';
import { cosineSimilarity } from '../utils/vector';
import type { Note, GraphData, GraphLink } from '../types';

const SIMILARITY_THRESHOLD = 0.3;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function buildGraphData(notes: Note[]): GraphData {
  const nodes = notes.map((note) => ({
    id: note.id,
    label: note.text.slice(0, 60) + (note.text.length > 60 ? '...' : ''),
  }));

  const links: GraphLink[] = [];
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const similarity = cosineSimilarity(
        Array.from(notes[i].embedding),
        Array.from(notes[j].embedding),
      );
      if (similarity >= SIMILARITY_THRESHOLD) {
        links.push({
          source: notes[i].id,
          target: notes[j].id,
          similarity,
        });
      }
    }
  }

  return { nodes, links };
}

export function useKnowledgeGraph() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const { progress, embedNote } = useEmbedding();

  useEffect(() => {
    async function loadNotes() {
      try {
        const storedNotes = await getAllNotes();
        setNotes(storedNotes);
      } catch (err) {
        console.error('Failed to load notes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      setGraphData(buildGraphData(notes));
    } else {
      setGraphData({ nodes: [], links: [] });
    }
  }, [notes]);

  const addNote = useCallback(
    async (text: string) => {
      const id = generateId();
      const embeddingArray = await embedNote(id, text);
      const embedding = new Float32Array(embeddingArray);
      const note: Note = {
        id,
        text,
        embedding,
        timestamp: Date.now(),
      };
      await saveNote(note);
      setNotes((prev) => [...prev, note]);
    },
    [embedNote],
  );

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return {
    notes,
    graphData,
    loading,
    progress,
    addNote,
    removeNote,
  };
}
