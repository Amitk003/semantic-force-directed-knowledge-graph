export function normalize(vector: number[]): number[] {
  const magnitude = Math.hypot(...vector);
  if (magnitude === 0) {
    return vector;
  }
  const normalized = new Array<number>(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / magnitude;
  }
  return normalized;
}

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  return dotProduct(a, b);
}
