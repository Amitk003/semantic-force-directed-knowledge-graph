# Semantic Force Directed Knowledge Graph

A browser-based app that turns your notes into a visual graph. Related ideas automatically group together. Everything runs locally - no data is sent to any server.

## Problem

Normal note-taking apps make you organize everything by hand. You have to create folders, add tags, and link notes yourself. This takes time and you might miss connections between your ideas.

## Solution

This app uses AI to understand what your notes mean. When you add a note, the app finds other notes with similar meaning and puts them close together in a visual graph. You can see how your ideas connect without doing any manual work.

## Features

- Add notes by typing text into the sidebar
- Related notes automatically cluster together in the graph
- Search notes by text - matching nodes stay visible, others dim
- Adjust the similarity threshold slider to control how links are shown
- Click a node to see full note text and ranked related notes
- Delete notes you no longer need
- Everything works offline after the first load

## How It Works

The AI runs completely inside your browser using a small model (all-MiniLM-L6-v2). This model converts your text into numbers (embeddings) that capture the meaning. The app then compares these numbers to find similar notes. If WebGPU is available, it uses it for faster performance. Otherwise it falls back to WASM.

## Tech Stack

- React 19 with TypeScript
- Vite for building
- Transformers.js for running AI in the browser
- react-force-graph-2d for the visual graph
- IndexedDB for storing data locally
- Web Workers for running AI without slowing down the UI
- WebGPU for faster AI (falls back to WASM if not available)

## Setup

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Usage

1. Wait for the AI model to download and load (shown in the sidebar)
2. Type a note in the text box and click "Add Note"
3. Watch as the note appears on the graph and moves close to related notes
4. Click a node to see its full text and related notes ranked by similarity
5. Use the search bar to find notes by text
6. Use the threshold slider to control how connected notes appear

## Build

```bash
npm run build
npm run preview
```

## Demo Video

(Add link to your demo video here)

## Screenshots

(Add screenshots here)

## License

MIT
