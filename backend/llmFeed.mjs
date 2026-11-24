import { handleQueries } from "./handleQueries.mjs";

async function llmFeed(query) {

    try {

        // First feed the query into the handle query and get the semantic text from the DB
        let semanticText = await handleQueries(query);
        semanticText = semanticText[0]['text'];

        // Creating prompt
        let genPrompt = `SYSTEM:

        You are a customer support assistant.

        Answer questions using only the provided context.

        If the answer is not available in the context,
        tell the user that you don't have sufficient information.

        CONTEXT:

        ${semanticText}

        USER QUESTION:

            ${query}
        please answer to the user`;

        console.log(genPrompt);

        // Feed the semantic text into LLM for response
        let response = await fetch('http://localhost:11434/api/generate', {
            method: "POST",
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                model: "llama3.2",
                prompt: genPrompt,
                stream: false
            })
        })

        let res = await response.json();

        return res.response;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

llmFeed("What payment methods are accepted?").then(response => console.log(response)).catch(error => console.log(error));