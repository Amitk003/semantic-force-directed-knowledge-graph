import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from '@huggingface/transformers';

env.allowLocalModels = false;

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
  private static instance: Promise<FeatureExtractionPipeline> | null = null;
  private static backend: string = 'wasm';

  public static async getInstance(
    progress_callback?: (data: any) => void,
  ): Promise<FeatureExtractionPipeline> {
    if (this.instance === null) {
      this.instance = this.initPipeline(progress_callback);
    }
    return this.instance;
  }

  private static async initPipeline(
    progress_callback?: (data: any) => void,
  ): Promise<FeatureExtractionPipeline> {
    const hasWebGPU = await detectWebGPU();
    const options: Record<string, any> = {
      progress_callback,
    };

    if (hasWebGPU) {
      options.device = 'webgpu';
      this.backend = 'webgpu';
      try {
        const pipe = await pipeline(this.task, this.model, options);
        return pipe as FeatureExtractionPipeline;
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
    const pipe = await pipeline(this.task, this.model, options);
    return pipe as FeatureExtractionPipeline;
  }

  public static getBackend(): string {
    return this.backend;
  }
}

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
