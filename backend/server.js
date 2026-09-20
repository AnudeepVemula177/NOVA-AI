const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "NOVA AI",
    status: "online",
    message: "NOVA Brain is connected to Ollama."
  });
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

  try {
    const ollamaResponse = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen3:4b",
          messages: [
            {
              role: "user",
              content: message
            }
          ],
          stream: false,
          think: false
        })
      }
    );

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();

    let reply = data.message?.content || "";

    // Remove any hidden thinking content if the model returns it.
    reply = reply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    if (!reply) {
      reply = "NOVA could not generate a response.";
    }

    res.json({
      reply
    });

  } catch (error) {
    console.error("Ollama error:", error);

    res.status(500).json({
      error: "NOVA Brain is unavailable. Make sure Ollama is running."
    });
  }
});

app.listen(PORT, () => {
  console.log(`NOVA backend running on port ${PORT}`);
});
