# On-Device AI

## Why On-Device?

Traditional AI-powered apps send your data to a cloud API for processing. This introduces several problems:

- **Privacy risk** - Your notes, ideas, and personal thoughts leave your machine
- **Internet dependency** - The app is unusable offline
- **Latency** - Network round-trips add delay
- **Cost** - API usage costs money at scale
- **Vendor lock-in** - You depend on a specific cloud provider

This app solves all of these by running AI completely in the browser. Every embedding computation happens locally. Your data never leaves your device.

## How It Works

### Model

We use `all-MiniLM-L6-v2` via the [Transformers.js](https://github.com/xenova/transformers.js) library. This is a lightweight sentence embedding model that maps text to a 384-dimensional vector space. It is:

- **Small** - ~23 MB download, cached in browser after first load
- **Fast** - A single embedding takes ~50-200ms depending on hardware
- **Accurate** - Despite its small size, it captures semantic meaning effectively for short to medium text

### Execution Environment

The model runs inside a **Web Worker** to avoid blocking the UI. The worker:

1. Downloads the model from Hugging Face's CDN on first use (cached by the browser)
2. Detects whether WebGPU is available (WebGPU API check)
3. If WebGPU is available, runs the model using GPU acceleration (2-5x faster)
4. If WebGPU is unavailable, falls back to WASM (WebAssembly) inference, which still runs locally but uses the CPU

This approach is called **progressive enhancement** - the app works everywhere, but performs best on capable hardware.

### No Training Happens On-Device

The model is pre-trained and only used for **inference** (computing embeddings). No training data is collected, and no model weights are modified. The app is a pure consumer of the AI model.

## Performance Characteristics

| Operation | WebGPU | WASM |
|-----------|--------|------|
| First load (download model) | ~23 MB | ~23 MB |
| Subsequent loads | Instant (cached) | Instant (cached) |
| Embed 1 sentence | ~50ms | ~200ms |
| Embed 10 sentences | ~300ms | ~1.5s |
| Compute 100x100 similarity matrix | <10ms | <10ms |

## Internet Requirements

| Operation | Internet Needed? | Details |
|---|---|---|
| First-time model download | Yes | ~23 MB download from Hugging Face CDN. Cached by browser afterward. |
| Adding notes | No | Embedding runs locally. Zero data sent over network. |
| Viewing the graph | No | All data is local. |
| Searching | No | Runs locally against stored embeddings. |
| Deleting notes | No | IndexedDB operation, fully local. |

After the initial model download, the app works fully offline.

## Privacy Guarantee

- Zero data is sent to any server
- The model is downloaded once from Hugging Face CDN, then cached
- All computation happens in your browser tab
- No analytics, no tracking, no telemetry
- You can disconnect from the internet after the first model load
