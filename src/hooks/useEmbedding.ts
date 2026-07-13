import { useEffect, useRef, useState } from 'react';
import type {
  EmbeddingProgress,
  WorkerRequest,
  WorkerResponse,
} from '../types';

export function useEmbedding() {
  const [progress, setProgress] = useState<EmbeddingProgress>({
    status: 'loading',
    progress: 0,
    message: 'Initializing worker...',
  });

  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (embedding: number[]) => void>>(
    new Map(),
  );

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/embedding.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      if (response.type === 'progress') {
        setProgress({
          status: response.status as
            'downloading' | 'loading' | 'ready' | 'error',
          progress: response.progress,
          message: response.message,
        });
      } else if (response.type === 'embed-result') {
        const callback = callbacksRef.current.get(response.id);
        if (callback) {
          callback(response.embedding);
          callbacksRef.current.delete(response.id);
        }
      } else if (response.type === 'error') {
        setProgress((prev) => ({
          ...prev,
          status: 'error',
          message: response.message,
        }));
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const embedNote = (id: string, text: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker is not initialized'));
        return;
      }

      callbacksRef.current.set(id, resolve);

      const request: WorkerRequest = {
        type: 'embed',
        id,
        text,
      };
      workerRef.current.postMessage(request);
    });
  };

  return {
    progress,
    embedNote,
  };
}
export default useEmbedding;
