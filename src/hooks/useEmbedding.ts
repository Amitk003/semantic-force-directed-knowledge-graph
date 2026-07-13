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
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      if (!timedOut) {
        timedOut = true;
        setProgress({
          status: 'error',
          progress: 0,
          message: 'Timed out waiting for AI worker to start. Check browser console for errors.',
        });
      }
    }, 15000);

    let worker: Worker;

    try {
      worker = new Worker(
        new URL('../workers/embedding.worker.ts', import.meta.url),
        { type: 'module' },
      );
    } catch (err) {
      clearTimeout(timeoutId);
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Failed to create AI worker: ' + (err instanceof Error ? err.message : 'Unknown error'),
      });
      return;
    }

    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      if (!timedOut) {
        timedOut = true;
        clearTimeout(timeoutId);
      }

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

    worker.onerror = (err) => {
      if (!timedOut) {
        timedOut = true;
        clearTimeout(timeoutId);
      }
      setProgress({
        status: 'error',
        progress: 0,
        message: 'AI worker error: ' + err.message,
      });
    };

    return () => {
      clearTimeout(timeoutId);
      timedOut = true;
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
