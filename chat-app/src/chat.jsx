import {
  AssistantRuntimeProvider,
  useLocalRuntime,
} from "@assistant-ui/react";

const OllamaAdapter = {
  async *run({ messages, abortSignal }) {
    console.log('Line no 8', messages);
    // 1. Convert assistant-ui messages into Ollama's expected format
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n"),
    }));

    // 2. Send request to your local Ollama server
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2", // Replace with your local Ollama model name
        messages: formattedMessages,
        stream: true,
      }),
      signal: abortSignal,
    });

    if (!response.body) {
      throw new Error("No response body from Ollama");
    }

    // 3. Read the ReadableStream chunk by chunk
    const decoder = new TextDecoder();
    let fullText = "";

    for await (const chunk of response.body) {
      const lines = decoder.decode(chunk, { stream: true }).split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        const json = JSON.parse(line);

        if (json.message?.content) {
          fullText += json.message.content;

          // 4. Yield the updated text to assistant-ui on every token
          yield {
            content: [{ type: "text", text: fullText }],
          };
        }
      }
    }
  },
};

export function OllamaRuntimeProvider({ children }) {
  const runtime = useLocalRuntime(OllamaAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
