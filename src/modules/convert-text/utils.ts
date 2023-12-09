export function splitArrayIntoSubarrays(arr, chunkSize = 2) {
  if (!Array.isArray(arr)) {
    throw new Error('Input is not an array');
  }

  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('Invalid chunk size');
  }

  const result = [];
  const totalLength = arr.length;

  for (let i = 0; i < totalLength; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
}

export function splitIntoChunks(str, chunkSize = 1000) {
  const chars = Array.from(str);
  const chunks = [];
  let currentChunk = '';
  let currentChunkSize = 0;
  for (const char of chars) {
    currentChunk += char;
    currentChunkSize++;
    if (currentChunkSize >= chunkSize) {
      chunks.push(currentChunk);
      currentChunk = '';
      currentChunkSize = 0;
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  return chunks;
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
