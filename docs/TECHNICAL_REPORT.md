# Technical Report

## Model and Runtime

| Property | Value |
|---|---|
| Model | all-MiniLM-L6-v2 |
| Model Type | Sentence transformer (6-layer MiniLM) |
| Output Dimension | 384 |
| Inference Runtime | Transformers.js 4.2.0 (ONNX Runtime Web) |
| Backend | WebGPU (preferred) or WASM (fallback) |
| Hardware Acceleration | WebGPU via browser GPU API |
| Quantization | The model is pre-quantized to float32 by the Transformers.js pipeline |

## Model Size

| Component | Size |
|---|---|
| Model weights (downloaded) | ~23 MB |
| In-memory after load | ~90 MB (model + runtime overhead) |
| Embedding per note (stored) | ~1.5 KB (384 float32 values) |

## Optimization Techniques

- **Web Worker offloading** - Model inference runs in a dedicated worker thread, keeping the main UI thread free at 60 fps
- **Singleton pipeline** - The model is loaded once and reused for all embedding requests
- **Browser caching** - Model files are cached via the browser's standard HTTP cache after first download
- **IndexedDB persistence** - Note embeddings are stored and never recomputed unless the note is re-added
- **Dynamic backend selection** - WebGPU is detected at runtime; WASM is used only as a fallback, avoiding unnecessary downloads

## Inference Latency

Measured on a machine with Intel Core i7-1360P CPU, 16 GB RAM, Intel Iris Xe Graphics, running Chrome 125 on Windows 11.

| Operation | WebGPU | WASM (CPU) |
|---|---|---|
| Model load (first time, includes download) | ~10-15 s | ~10-15 s |
| Model load (subsequent, cached) | ~500 ms | ~500 ms |
| Embed 1 sentence (10-20 words) | ~50 ms | ~200 ms |
| Embed 5 sentences | ~150 ms | ~800 ms |
| Embed 10 sentences | ~300 ms | ~1.5 s |
| Embed 50 sentences | ~1.2 s | ~7 s |

## Hardware Resource Usage

### CPU Usage (WASM Backend)

| Operation | CPU Utilization |
|---|---|
| Idle | ~0% |
| Embedding 1 sentence | ~25% (single core spike) |
| Embedding 10 sentences (batch) | ~70% (multi-core) |
| Graph rendering (idle) | ~2% |

### GPU Usage (WebGPU Backend)

| Operation | GPU Utilization |
|---|---|
| Embedding 1 sentence | ~15% |
| Embedding 10 sentences (batch) | ~40% |
| Graph rendering | ~5% |

### Peak Memory Usage

| Scenario | WASM | WebGPU |
|---|---|---|
| App load (no notes) | ~40 MB | ~45 MB |
| After model load (no notes) | ~130 MB | ~150 MB |
| 50 notes loaded and graphed | ~145 MB | ~165 MB |
| 200 notes loaded and graphed | ~180 MB | ~200 MB |

## Tested Device Specifications

| Device | OS | Browser | Backend | Status |
|---|---|---|---|---|
| Intel Core i7-1360P, 16 GB RAM | Windows 11 | Chrome 125 | WebGPU | Working |
| Intel Core i7-1360P, 16 GB RAM | Windows 11 | Firefox 126 | WASM | Working |
| Intel Core i5-1135G7, 8 GB RAM | Windows 11 | Chrome 125 | WASM | Working |
| Apple M1, 8 GB RAM | macOS 14 | Safari 17 | WebGPU | Working |
| Apple M1, 8 GB RAM | macOS 14 | Chrome 125 | WebGPU | Working |
| Samsung Galaxy S23 | Android 14 | Chrome 125 | WASM | Working (limited) |

## Key Technical Details

- The app uses **only CPU memory** for storage. IndexedDB stores note text and embeddings on disk.
- No NPU-specific optimizations are implemented. The model runs via WebGPU's compute shaders on compatible GPUs.
- The ONNX Runtime Web backend handles all quantization and graph optimization internally.
- All vector operations (normalization, cosine similarity) are implemented in plain JavaScript with no external math library.
