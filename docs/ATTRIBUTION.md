# Attribution

## Pretrained Models

| Model | Source | License | Purpose |
|---|---|---|---|
| all-MiniLM-L6-v2 | Hugging Face (sentence-transformers) | Apache 2.0 | Sentence embedding for semantic similarity |

The model is loaded via Transformers.js from Hugging Face's CDN. The original model is published by sentence-transformers and cross-encoded to ONNX format by the Xenova/Transformers.js team.

## Libraries and Frameworks

| Library | Version | License | Purpose |
|---|---|---|---|
| React | 19 | MIT | UI framework |
| TypeScript | 6 | Apache 2.0 | Type-safe JavaScript |
| Vite | 8 | MIT | Build tool and dev server |
| @huggingface/transformers | 4.2.0 | Apache 2.0 | On-device AI inference in JavaScript |
| react-force-graph-2d | ^1.25 | MIT | Force-directed graph visualization |
| d3-force (via react-force-graph-2d) | 3.x | ISC | D3 force simulation engine |
| idb-keyval | ^6.2 | Apache 2.0 | IndexedDB key-value wrapper |
| oxlint | latest | MIT | JavaScript/TypeScript linter |
| Prettier | latest | MIT | Code formatter |

## Pre-Existing Work and References

| Reference | Usage |
|---|---|
| Transformers.js documentation (xenova/transformers.js) | Web Worker integration pattern |
| react-force-graph-2d examples (vasturiano/react-force-graph-2d) | Canvas node rendering, D3 force customization |
| MDN Web Docs - Web Workers API | Worker lifecycle and message passing |
| MDN Web Docs - IndexedDB API | Client-side data persistence |
| SBERT.net - all-MiniLM-L6-v2 | Model selection and performance data |

## APIs

| API | Usage |
|---|---|
| Web Workers (DedicatedWorkerGlobalScope) | Run AI inference off the main thread |
| WebGPU (GPUDevice, GPUComputePassEncoder) | GPU-accelerated model inference |
| WebAssembly (WASM) | CPU-based fallback inference |
| IndexedDB (IDBObjectStore) | Local note and embedding storage |
| Cache Storage API (browser HTTP cache) | Model file caching |

## Development Tools

| Tool | Purpose |
|---|---|
| Node.js | JavaScript runtime for development |
| npm | Package management |
| Visual Studio Code | Code editor |
| Git | Version control |
| GitHub | Repository hosting |
