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

class PipelineSingleton {
  private static task = 'feature-extraction' as const;
  private static model = 'Xenova/all-MiniLM-L6-v2';
  private static instance: Promise<any> | null = null;
  private static backend: string = 'wasm';

  public static async getInstance(
    progress_callback?: (data: any) => void,
  ): Promise<any> {
    if (this.instance === null) {
      this.instance = this.initPipeline(progress_callback);
    }
    return this.instance;
  }

  private static async initPipeline(
    progress_callback?: (data: any) => void,
  ): Promise<any> {
    if (!pipelineFn) {
      throw new Error('Transformers library not loaded');
    }

    const hasWebGPU = await detectWebGPU();
    const options: Record<string, any> = {
      progress_callback,
    };

    if (hasWebGPU) {
      options.device = 'webgpu';
      this.backend = 'webgpu';
      try {
        const pipe = await pipelineFn(this.task, this.model, options);
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

    this.backend = 'wasm';
    delete options.device;
    const pipe = await pipelineFn(this.task, this.model, options);
    return pipe;
  }

  public static getBackend(): string {
    return this.backend;
  }
}

loadTransformers().then((loaded) => {
  if (!loaded) {
    return;
  }

  self.postMessage({
    type: 'progress',
    status: 'loading',
    progress: 0,
    message: 'AI worker initialized, waiting for notes...',
  });

  self.addEventListener('message', async (event: MessageEvent) => {
    const { type, id, text } = event.data;

    if (type === 'embed') {
      try {
        const pipe = await PipelineSingleton.getInstance((data) => {
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

        const backend = PipelineSingleton.getBackend();
        self.postMessage({
          type: 'progress',
          status: 'ready',
          progress: 100,
          message:
            backend === 'webgpu'
              ? 'AI model ready (WebGPU)'
              : 'AI model ready (WASM)',
        });

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
});
