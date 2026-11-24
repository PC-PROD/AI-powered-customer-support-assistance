import { mCursor } from "./ingesionToDB.mjs";

export async function handleQueries(query) {
    let [client, cursor] = mCursor();
    try {
        // Fetch the top 5 relevant document from database to the LLM (Basic semantic search)
        // Get the embeded query vector from ollama
        let queryEmbeded = await fetch("http://localhost:11434/api/embed", {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                model: "embeddinggemma",
                input: query,
                dimensions: 768
            })
        })

        let res = await queryEmbeded.json();

        let embededQueryvector = res.embeddings[0];
        // Vector search
        let mQuery = [
            {
                $vectorSearch: {
                    "exact": false,
                    "index": "policy_index",
                    "numCandidates": 5,
                    "path": "embeded",
                    "queryVector": embededQueryvector,
                    "limit": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    text: 1
                }
            }
        ]

        // Putting this query into a aggregation pipeline
        let result_chunk = await cursor.aggregate(mQuery).toArray();
        return result_chunk;
    } catch (error) {
        console.log(error.message);
    } finally {
        await client.close();
    }
}

// handleQueries("What payment methods are accepted?").then(res => console.log(res)).catch(error => console.log(error.message));