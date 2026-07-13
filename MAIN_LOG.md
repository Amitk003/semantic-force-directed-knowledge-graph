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

### Commands Run
- `npm install @huggingface/transformers` - Installed Hugging Face transformers package for running local AI models
- `npm run build` - Ran TypeScript compile and Vite build to check for compilation errors
- `npm run lint` - Ran linter to check code style and syntax issues
- `npm run format` - Formatted all source files with Prettier

### Files Created / Modified
- `src/types/index.ts` - Added note id to the WorkerRequest type
- `src/workers/embedding.worker.ts` - Created background worker script that loads Xenova/all-MiniLM-L6-v2 model and generates text embeddings locally
- `src/hooks/useEmbedding.ts` - Created custom hook to manage the lifecycle of the worker and communicate embedding results to the main app thread
- `MAIN_LOG.md` - Documented activities for Phase 2

