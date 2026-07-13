# Semantic Force Directed Knowledge Graph

A browser-based app that turns your notes into a visual graph. Related ideas automatically group together. Everything runs on your device - no data is sent to any server.

## Problem

Normal note-taking apps make you organize everything by hand. You have to create folders, add tags, and link notes yourself. This takes time and you might miss connections between your ideas.

## Solution

This app uses AI to understand what your notes mean. When you add a note, the app finds other notes with similar meaning and puts them close together in a visual graph. You can see how your ideas connect without doing any manual work.

## How On-Device AI Works

The AI runs completely inside your browser using a small AI model (all-MiniLM-L6-v2). This model converts your text into numbers (called embeddings) that capture the meaning. The app then compares these numbers to find similar notes.

No internet connection is needed after the first load. Your data never leaves your computer.

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

## Build

```bash
npm run build
npm run preview
```

## License

MIT
