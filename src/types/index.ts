export interface Note {
  id: string;
  text: string;
  embedding: Float32Array;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  similarity: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type EmbeddingProgress = {
  status: 'downloading' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
};

export type WorkerRequest = {
  type: 'embed';
  text: string;
};

export type WorkerResponse =
  | {
      type: 'embed-result';
      id: string;
      embedding: number[];
    }
  | {
      type: 'progress';
      status: string;
      progress: number;
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };
