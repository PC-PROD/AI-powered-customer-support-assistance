export default function chunkText(text, chunkSize = 300, chunkOverlap = 20) {
  if (chunkOverlap >= chunkSize) {
    throw new Error("chunkOverlap must be smaller than chunkSize");
  }

  // Clean up extra whitespace/newlines
  const cleanText = text.replace(/\s+\n+/g, " ").trim();
  const chunks = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;

    // If we haven't reached the end of the text, try to break cleanly at a sentence or word boundary
    if (end < cleanText.length) {
      const slice = cleanText.slice(start, end);
      
      // 1. Prefer breaking at the end of a sentence (period + space)
      let breakPoint = slice.lastIndexOf(". ");
      if (breakPoint !== -1 && breakPoint > chunkSize * 0.5) {
        end = start + breakPoint + 1; // Include the period
      } else {
        // 2. Otherwise, fall back to the last space so we don't slice a word in half
        breakPoint = slice.lastIndexOf(" ");
        if (breakPoint > 0) {
          end = start + breakPoint;
        }
      }
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    // Move the window forward, stepping back by chunkOverlap
    start = end - chunkOverlap;

    // Safety check to prevent an infinite loop on very long words
    if (start <= end - chunkSize) {
      start = end;
    }
  }

  return chunks;
}

// // --- Example Usage ---
// const sampleText = `
//   LangChain is an open-source framework designed to simplify the creation of applications using large language models. 
//   When building a RAG pipeline, splitting your documents into smaller chunks is crucial. 
//   If chunks are too large, they might exceed the model's context window or dilute the meaning of the embedding. 
//   If they are too small, they might lose important surrounding context.
// `;

// const result = chunkText(sampleText, 150, 30);
// console.log(`Created ${result.length} chunks:\n`, result);
