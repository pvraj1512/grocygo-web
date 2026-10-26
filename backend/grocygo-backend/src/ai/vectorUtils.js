// Simple vector utilities for ingredient matching (Node.js)
// This is a placeholder for real embedding logic

function encodeIngredients(ingredients) {
  // Simple bag-of-words vector (object)
  const vec = {};
  for (const ing of ingredients) {
    vec[ing] = (vec[ing] || 0) + 1;
  }
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  // Compute cosine similarity between two bag-of-words vectors
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, normA = 0, normB = 0;
  for (const k of allKeys) {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { encodeIngredients, cosineSimilarity };
