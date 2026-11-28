import { handleQueries } from "./handleQueries.mjs";

export function llmFeed(query, mergedHistory, mergedChunk) {

    try {
        if (!query) {
            throw new Error("query", { cause: "Latest query not found" });
        }
        // if (!mergedHistory){
        //     throw new Error("chat history", {cause: "Chat history not found"});
        // }
        if (!mergedChunk) {
            throw new Error("No document", { cause: "No similar document found" });
        }

        // Creating prompt
        let genPrompt = `SYSTEM:
        You are a customer support assistant.
        Answer questions using only the provided context.
        If the answer is not available in the context,
        tell the user that you don't have sufficient information.

        PREVIOUS CHAT HISTORY (this might be empty initially):
        ${mergedHistory}

        MATCHING RECORDS FROM DATABASE:
        ${mergedChunk}

        USER QUESTION:
        ${query}

        please answer FORMALLY to the user`;

        return genPrompt;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

export function mergeHistory(query) {
    let mergedHistory = query.map(hist => {
        let verb;
        if (hist.role === 'assistant') verb = 'generated';
        if (hist.role === 'user') verb = 'asked';
        return hist.role + " " + verb + " " + hist.content;
    }).join("/n");

    return mergedHistory;
}


export async function reStructureUserQuery(history, userQuestion) {
    try{

        if (history.length === 0) return userQuestion;
        
        if (!userQuestion) {
            throw new Error("latestQuery", { cause: "Latest query was not a text!" });
        }
        
        let chatHistory = mergeHistory(history);
        
        if (!chatHistory) return userQuestion;
        
        let prompt = `
        Given the chat history below, rewrite the user's latest question into a standalone search query after gathering information from the chat history. Do not answer it.
        
        CHAT HISTORY: 
        ${chatHistory}
        
        USER question: 
        ${userQuestion}
        
        Re-structure the user's question and return the new query only
        `        
        let response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: prompt,
                stream: false
            })
        })
        
        if (!response.ok) {
            throw new Error('generate chat', { cause: "Unable to restructure user query" });
        }
        
        let res = await response.json();        
        return res['response'];
    }catch(error){
        console.log(error.message);
        throw error;
    }
}

// llmFeed("What payment methods are accepted?").then(response => console.log(response)).catch(error => console.log(error));