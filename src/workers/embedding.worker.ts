import {
  pipeline,
  env,
  type FeatureExtractionPipeline,
} from '@huggingface/transformers';

env.allowLocalModels = false;

class PipelineSingleton {
  private static task = 'feature-extraction' as const;
  private static model = 'Xenova/all-MiniLM-L6-v2';
  private static instance: Promise<FeatureExtractionPipeline> | null = null;

  public static async getInstance(
    progress_callback?: (data: any) => void,
  ): Promise<FeatureExtractionPipeline> {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        progress_callback,
      }) as Promise<FeatureExtractionPipeline>;
    }
    return this.instance;
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
