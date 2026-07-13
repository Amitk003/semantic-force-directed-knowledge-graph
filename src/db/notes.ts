import { get, set, del } from 'idb-keyval';
import type { Note } from '../types';

const NOTES_PREFIX = 'note_';
const ALL_IDS_KEY = 'note_ids';

export async function saveNote(note: Note): Promise<void> {
  const noteKey = NOTES_PREFIX + note.id;
  const data = {
    id: note.id,
    text: note.text,
    embedding: Array.from(note.embedding),
    timestamp: note.timestamp,
  };
  await set(noteKey, data);
  const existingIds: string[] = (await get(ALL_IDS_KEY)) || [];
  if (!existingIds.includes(note.id)) {
    existingIds.push(note.id);
    await set(ALL_IDS_KEY, existingIds);
  }
}

export async function getAllNotes(): Promise<Note[]> {
  const allIds: string[] = (await get(ALL_IDS_KEY)) || [];
  if (allIds.length === 0) {
    return [];
  }
  const noteKeys = allIds.map((id) => NOTES_PREFIX + id);
  const results: Note[] = [];
  for (const key of noteKeys) {
    const data: any = await get(key);
    if (data) {
      results.push({
        id: data.id,
        text: data.text,
        embedding: new Float32Array(data.embedding),
        timestamp: data.timestamp,
      });
    }
  }
  results.sort((a, b) => a.timestamp - b.timestamp);
  return results;
}

export async function deleteNote(id: string): Promise<void> {
  const noteKey = NOTES_PREFIX + id;
  await del(noteKey);
  const existingIds: string[] = (await get(ALL_IDS_KEY)) || [];
  const filtered = existingIds.filter((existingId) => existingId !== id);
  await set(ALL_IDS_KEY, filtered);
}
