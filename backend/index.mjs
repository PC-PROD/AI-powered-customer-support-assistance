import express from "express";
import { handleQueries } from "./handleQueries.mjs";
import { llmFeed, mergeHistory, reStructureUserQuery } from "./llmFeed.mjs";
import cors from "cors";


const app = express();

app.use(cors({
    credentials: false
}));
app.use(express.json());

app.get('/', (_, res) => {
    return res.json({ "success": true });
})


app.post("/api/chat", async (req, res) => {
    // Handle query from user
    let query = req.body.messages; // This data contains an array of chat history
    if (query.length === 0) {
        throw new Error("query", { cause: "Query was not provided!" });
    }

    // get the latest message from the chat array to send it to find the semantic match
    // let latestQuery = query.at(query.length - 1)['content'][0]['text'];
    let latestQuery = query.pop();
    latestQuery = latestQuery['content'];
    
    // Reconstructing the quer query
    latestQuery = await reStructureUserQuery(query, latestQuery);
    
    if (!latestQuery) {
        throw new Error("latestQuery", { cause: "Latest query was not a text!" });
    }


    // semantic search chunks
    let semanticChunks = await handleQueries(latestQuery); // Array of text with similarity score

    if (semanticChunks.length === 0) {
        throw new Error("semantic search", { cause: "No search result is found" });
    }

    // Combine all text received from semantic search
    let mergedChunk = semanticChunks.sort((a, b) => b.score - a.score).map(files => (
        `${files.filename} says ` + '/n' + files.text + '/n' + ' in page no ' + files.pageno
    )).join("/n");

    // Feed it to the LLM and send the LLM result back to the client
    let mergedHistory =  mergeHistory(query);

    // Get LLM result from llm feed
    let llmChat = llmFeed(latestQuery, mergedHistory, mergedChunk);

    if (!llmChat) {
        throw new Error("llmResult", { cause: "Unable to generate prompt" });
    }

    // Changing the structure before sending to the LLM chat api
    let llmFeedChat = query.reduce((acc, text) => {
        acc.push({ role: text.role, content: text.content })
        return acc;
    }, []);

    llmFeedChat.push({ role: "user", content: llmChat })


    // Feed the semantic text into LLM for response
    let response = await fetch('http://localhost:11434/api/chat', {
        method: "POST",
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            model: "llama3.2",
            messages: llmFeedChat,
            stream: true
        })
    });


    if (!response.ok) {
        throw new Error("LLM", { cause: "AI was unable to understand, please give more context" });
    }


    // res.setHeader({ "Content-type": "text/event-stream" });
    // res.setHeader({ "cache-Control": "no-cache" });
    // res.setHeader({ "connection": "keep-alive" });


    let reader = response.body.getReader();

    while (true) {
        try {
            let { done, value } = await reader.read();

            if (done) {
                console.log('Streaming done');
                break;
            }

            res.write(value);
        } catch (error) {
            console.log(error.messages);
            throw new Error('streaming', { cause: "Encountered error while streaming the response" })
        }
    }
    res.status(200).end();
});

function errorhandle(err, req, res, next) {
    try {
        if (err) return res.status(500).json({ "Success": false, "Reason": err.cause });
    } catch (error) {
        console.log(error.messages);
    }
}

app.use(errorhandle);

app.listen(5000, () => {
    console.log(`App is running from 5000 port`);
})