let pipelineFn: typeof import('@huggingface/transformers').pipeline | null = null;

async function loadTransformers() {
  try {
    const mod = await import('@huggingface/transformers');
    mod.env.allowLocalModels = false;
    pipelineFn = mod.pipeline;
    return true;
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: 'Failed to load AI library: ' + (err instanceof Error ? err.message : 'Unknown error'),
    });
    return false;
  }
}

async function detectWebGPU(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return false;
  }
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    await adapter.requestDevice();
    return true;
  } catch {
    return false;
  }
}

let pipelinePromise: Promise<any> | null = null;
let pipelineBackend: string = 'wasm';

async function initPipeline(progressCallback: (data: any) => void): Promise<any> {
  if (!pipelineFn) {
    throw new Error('Transformers library not loaded');
  }

  const hasWebGPU = await detectWebGPU();
  const options: Record<string, any> = {
    progress_callback: progressCallback,
  };

  if (hasWebGPU) {
    options.device = 'webgpu';
    pipelineBackend = 'webgpu';
    try {
      const pipe = await pipelineFn('feature-extraction', 'Xenova/all-MiniLM-L6-v2', options);
      return pipe;
    } catch (err) {
      console.warn('WebGPU init failed, falling back to WebAssembly:', err);
      self.postMessage({
        type: 'progress',
        status: 'loading',
        progress: 100,
        message: 'WebGPU failed, falling back to WASM',
      });
    }
  }

  pipelineBackend = 'wasm';
  delete options.device;
  const pipe = await pipelineFn('feature-extraction', 'Xenova/all-MiniLM-L6-v2', options);
  return pipe;
}

async function start() {
  const loaded = await loadTransformers();
  if (!loaded) {
    return;
  }

  self.postMessage({
    type: 'progress',
    status: 'loading',
    progress: 0,
    message: 'Loading AI model...',
  });

  try {
    pipelinePromise = initPipeline((data: any) => {
      if (data.status === 'progress') {
        self.postMessage({
          type: 'progress',
          status: 'downloading',
          progress: data.progress,
          message: `Downloading model weights: ${Math.round(data.progress)}%`,
        });
      } else if (data.status === 'ready') {
        self.postMessage({
          type: 'progress',
          status: 'loading',
          progress: 100,
          message: 'Loading model into memory...',
        });
      }
    });

    await pipelinePromise;

    self.postMessage({
      type: 'progress',
      status: 'ready',
      progress: 100,
      message: pipelineBackend === 'webgpu'
        ? 'AI model ready (WebGPU)'
        : 'AI model ready (WASM)',
    });
  } catch (err: any) {
    self.postMessage({
      type: 'error',
      message: 'Failed to initialize AI model: ' + (err.message || 'Unknown error'),
    });
    return;
  }

  self.addEventListener('message', async (event: MessageEvent) => {
    const { type, id, text } = event.data;

    if (type === 'embed') {
      try {
        const pipe = await pipelinePromise!;

        const output = await pipe(text, {
          pooling: 'mean',
          normalize: true,
        });

        const embedding = Array.from(output.data) as number[];

        self.postMessage({
          type: 'embed-result',
          id,
          embedding,
        });
      } catch (error: any) {
        self.postMessage({
          type: 'error',
          message: error.message || 'Failed to generate embedding',
        });
      }
    }
  });
}

start();
