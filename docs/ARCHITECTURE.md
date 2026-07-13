# Architecture

## High-Level Overview

The app is a single-page React application that runs entirely in the browser. It has three major layers:

1. **UI Layer** - React components for the graph, sidebar, search, and note details
2. **Worker Layer** - A Web Worker that runs Transformers.js for AI embedding, keeping the main thread responsive
3. **Storage Layer** - IndexedDB via idb-keyval for persisting notes and their embeddings

## Data Flow

```
User types a note
        |
        v
  useKnowledgeGraph hook
        |
        +--> useEmbedding hook sends text to Web Worker
        |         |
        |         v
        |    embedding.worker.ts
        |         |
        |         +--> Detects WebGPU (preferred) or falls back to WASM
        |         +--> Loads all-MiniLM-L6-v2 model (cached after first load)
        |         +--> Runs pipeline to generate 384-dim embedding vector
        |         |
        |         v
        |    Returns embedding to main thread
        |
        +--> Saves note + embedding to IndexedDB
        |
        +--> Loads all notes, computes cosine similarity matrix
        |
        +--> Builds graph data (nodes + weighted links)
        |
        v
  ForceGraph2D renders interactive graph
```

## Component Tree

```
App
  |-- Sidebar (left)
  |     |-- Model status indicator (loading / ready)
  |     |-- Search input
  |     |-- Similarity threshold slider
  |     |-- Note input & submit button
  |     |-- Note list with delete buttons
  |
  |-- ForceGraph2D (center/right)
  |     |-- Custom node canvas rendering
  |     |-- D3 force simulation (charge, link distance, center gravity)
  |
  |-- Note Details Panel (right, on node click)
        |-- Full note text
        |-- Ranked related notes with similarity scores
```

## Key Technical Decisions

### Web Worker for AI
The Transformers.js pipeline runs in a dedicated Web Worker. This prevents the model inference from blocking UI rendering. Communication happens via postMessage with a simple request/response protocol.

### Dynamic Import for Resilience
The worker uses dynamic import (`import()` inside the worker) for the Transformers library. If loading fails (e.g., unsupported browser), the error is caught and reported to the UI.

### Cosine Similarity Matrix
When computing links, every note embedding is compared against every other note embedding using cosine similarity. Links below the user's threshold are filtered out. This is O(n^2) but acceptable for hundreds of notes.

### IndexedDB Persistence
Notes and their embeddings are stored as key-value pairs using idb-keyval. On page reload, all notes are re-loaded and the graph is rebuilt from stored embeddings (no re-embedding needed).

### D3 Physics Customization
The force-directed layout uses tuned parameters:
- `chargeStrength`: -150 (strong repulsion spreads clusters)
- `linkDistance`: 80 (moderate link length)
- `centerGravity`: 0.1 (keeps graph centered)
- `linkIterations`: 5 (smoother initial layout)

## File Map

```
src/
  App.tsx                   Main UI component
  App.css                   Dark theme styles
  main.tsx                  React entry point
  types/
    index.ts                Shared TypeScript types
  hooks/
    useEmbedding.ts         Worker lifecycle and message handling
    useKnowledgeGraph.ts    Orchestrates embedding, storage, and graph building
  workers/
    embedding.worker.ts     Web Worker with Transformers.js pipeline
  utils/
    vector.ts               normalize, dotProduct, cosineSimilarity
  db/
    notes.ts                IndexedDB CRUD operations
```
