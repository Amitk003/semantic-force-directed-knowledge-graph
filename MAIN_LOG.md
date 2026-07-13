# Main Log

This file tracks all commands run, packages installed, and changes made during development.

## Phase 1 - Project Setup (Branch: phase-1-project-setup)

Date: 13 July 2026

### Commands Run
- `git clone https://github.com/Amitk003/semantic-force-directed-knowledge-graph.git` - Cloned empty repo
- `npm create vite@latest . -- --template react-ts` - Scaffolded Vite + React + TypeScript project
- `npm install` - Installed base dependencies
- `npm install -D prettier` - Installed Prettier for code formatting

### Files Created / Modified
- `.prettierrc` - Prettier configuration (single quotes, trailing commas, 80 print width)
- `.prettierignore` - Ignore patterns for Prettier
- `LICENSE` - MIT license file
- `MAIN_LOG.md` - This log file
- `README.md` - Project readme (simple English)
- `package.json` - Updated with format scripts
- `src/types/index.ts` - Shared TypeScript types
- `src/` directory restructured with subdirectories:
  - `components/` - React components
  - `workers/` - Web Workers
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions
  - `db/` - IndexedDB helpers

## Phase 2 - Web Worker and Local Inference (Branch: feature/phase-2-web-worker)

Date: 13 July 2026

### Commands Run (Agent 2)
- `npm install @huggingface/transformers` - Installed Hugging Face transformers package for running local AI models
- `npm run build` - Ran TypeScript compile and Vite build to check for compilation errors
- `npm run lint` - Ran linter to check code style and syntax issues
- `npm run format` - Formatted all source files with Prettier

### Files Created / Modified (Agent 2)
- `src/types/index.ts` - Added note id to the WorkerRequest type
- `src/workers/embedding.worker.ts` - Created background worker script that loads Xenova/all-MiniLM-L6-v2 model and generates text embeddings locally
- `src/hooks/useEmbedding.ts` - Created custom hook to manage the lifecycle of the worker and communicate embedding results to the main app thread
- `MAIN_LOG.md` - Documented activities for Phase 2

### Review Fixes (Agent 1)
- `src/hooks/useEmbedding.ts` - Removed premature setProgress('ready') call after worker creation that showed 'ready' before model was actually loaded
- `src/workers/embedding.worker.ts` - Added a 'ready' progress message after pipeline singleton resolves so the UI knows when the model is fully ready

## Phase 3 - Vector Math and Local Storage (Branch: feature/phase-3-vector-storage)

Date: 13 July 2026

### Commands Run
- `npm install idb-keyval` - Installed lightweight IndexedDB wrapper
- `npm run build` - TypeScript compile and Vite build
- `npm run lint` - Linter check

### Files Created
- `src/utils/vector.ts` - Vector math utilities (normalize, dotProduct, cosineSimilarity)
- `src/db/notes.ts` - IndexedDB CRUD operations for notes (saveNote, getAllNotes, deleteNote)
- `src/hooks/useKnowledgeGraph.ts` - Main hook combining embedding, storage, and similarity graph building

### Review Fixes (Agent 2)
- `src/utils/vector.ts` - Replaced Math.hypot with a simple loop in the normalize function to prevent call stack issues and improve efficiency on large arrays

## Phase 4 - Applied Spatial Graph Physics (Branch: feature/phase-4-graph-physics)

Date: 13 July 2026

### Commands Run
- `npm install react-force-graph-2d` - Installed react-force-graph-2d to render the network graph on canvas
- `npm run build` - Compiled TypeScript and built the client to check for packaging issues
- `npm run lint` - Ran linter checks on the code changes
- `npm run format` - Ran Prettier to format codebase files

### Files Modified
- `package.json` - Added react-force-graph-2d to dependencies
- `src/App.tsx` - Created app UI layout, integrated note hook, and embedded force graph with customized D3 physics (charge repulsion and semantic link attraction)
- `src/App.css` - Created dark mode stylesheet with styling for the sidebar, form input, notes list, and graph container
- `MAIN_LOG.md` - Documented activities for Phase 4



