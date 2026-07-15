# Semantic Force-Directed Knowledge Graph

**Your thoughts, mapped. Automatically.**

A browser-based knowledge graph app that reads your notes with on-device AI and arranges them into a living map of connected ideas. No data leaves your machine.

---

## Problem

Every note-taking app makes you do the hard work. Folders. Tags. Manual links. You spend time organizing instead of thinking. And the connections between your ideas stay hidden inside the text you wrote.

## Solution

This app uses a small AI model that runs entirely in your browser. Type a note. The AI reads it, understands its meaning, and places it near other notes with similar ideas. A force-directed graph builds itself before your eyes.

Related ideas cluster. Unrelated ideas drift apart. You see the shape of your thinking.

## How It Uses On-Device AI

The app runs **all-MiniLM-L6-v2** via [Transformers.js](https://github.com/xenova/transformers.js) inside a Web Worker. It converts each note into a 384-dimensional embedding vector that captures semantic meaning. The model is ~23 MB, cached after first load.

- **WebGPU** is used when available for 2-5x faster inference
- **WASM fallback** ensures the app works on any modern browser
- **Zero data leaves your device** - no API calls, no servers, no tracking
- **Works offline** after the initial model download

This is not a thin client calling a cloud API. This is real AI inference running locally in your browser tab.

## Sample Inputs and Expected Outputs

### Input
Type notes like these in the sidebar:
```
Machine learning models learn patterns from large datasets
Neural networks can recognize objects in images accurately
Drinking enough water keeps your body hydrated and healthy
Regular exercise strengthens your heart and lungs
```

### Expected Output
- Each note appears as a node on the force-directed graph
- The two ML notes form a cluster close together
- The two health notes form a separate cluster at a distance
- A link line appears between related notes (similarity >= threshold)
- Clicking any node shows its full text and ranked related notes with similarity scores

## Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Runtime |
| npm | >= 9 | Package manager |
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool |
| @huggingface/transformers | 4.2.0 | On-device AI inference |
| react-force-graph-2d | ^1.25 | Graph visualization |
| idb-keyval | ^6.2 | IndexedDB storage |

No server, database, or cloud API dependencies.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| AI Inference | Transformers.js 4.2.0 (WebGPU / WASM) |
| Graph Visualization | react-force-graph-2d (D3 force simulation) |
| Storage | IndexedDB via idb-keyval |
| Concurrency | Web Workers (Dedicated Worker for AI) |
| Linting | Oxlint |
| Formatting | Prettier |

## Setup

```bash
git clone https://github.com/Amitk003/semantic-force-directed-knowledge-graph.git
cd semantic-force-directed-knowledge-graph
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

1. **Wait for the AI model** to download and initialize (shown in the sidebar)
2. **Add notes** by typing into the text box and clicking "Add Note"
3. **Watch the graph grow** as new notes appear and move close to related ones
4. **Click a node** to read the full note and see ranked related notes
5. **Search** by text to highlight matching nodes
6. **Adjust the threshold slider** to control how similar notes must be to show a connection
7. **Delete notes** you no longer need with the delete button

## Demo Video

[Watch the demo on YouTube](https://youtu.be/JsbRO4EEAwg)

## Documentation

| File | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, component tree, design decisions |
| [docs/TECHNICAL_REPORT.md](docs/TECHNICAL_REPORT.md) | Model details, latency, memory usage, tested devices |
| [docs/ON_DEVICE_AI.md](docs/ON_DEVICE_AI.md) | How on-device AI works, WebGPU vs WASM, privacy |
| [docs/EVALUATION.md](docs/EVALUATION.md) | Accuracy results, benchmarks, known failure cases |
| [docs/PRIVACY_SAFETY.md](docs/PRIVACY_SAFETY.md) | Data handling, storage, permissions, risks |
| [docs/ATTRIBUTION.md](docs/ATTRIBUTION.md) | Pretrained models, libraries, pre-existing work |
| [docs/USECASE.md](docs/USECASE.md) | Problem, solution, real-world scenarios |
| [docs/FUTURE_SCOPE.md](docs/FUTURE_SCOPE.md) | Future plans and known limitations |
| [SAMPLE_THOUGHTS.md](SAMPLE_THOUGHTS.md) | Pre-built notes to test the demo |

## Project Structure

```
docs/                    # Documentation
src/
  App.tsx                # Main UI with graph, sidebar, search
  App.css                # Dark theme styles
  main.tsx               # Entry point
  hooks/                 # useEmbedding, useKnowledgeGraph
  workers/               # Web Worker with Transformers.js
  utils/vector.ts        # Vector math utilities
  db/notes.ts            # IndexedDB operations
  types/                 # TypeScript type definitions
SAMPLE_THOUGHTS.md       # Pre-built demo notes
```

## Build for Production

```bash
npm run build
npm run preview
```

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with React, Transformers.js, and a belief that your data should stay yours.
