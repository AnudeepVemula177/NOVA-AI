const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// ========================================
// NOVA AI IDENTITY
// ========================================

const NOVA_SYSTEM_PROMPT = `
You are NOVA AI.

Your name is NOVA.

You are a personal AI workspace assistant.
You help the user think, plan, learn, create, research,
solve problems, write code, and work through tasks.

IDENTITY RULES:
- Your name is NOVA.
- When introducing yourself, say you are NOVA.
- Do not introduce yourself as Qwen.
- Do not introduce yourself as Qwen3.
- Do not introduce yourself as Ollama.
- Do not introduce yourself as Tongyi.
- Do not say you are ChatGPT.
- Do not mention the underlying model unless the user specifically asks about the technology behind NOVA.

LANGUAGE:
- Follow the language used by the user.
- English input -> English response.
- Telugu script input -> Telugu script response.
- Tanglish input -> natural Tanglish response.

STYLE:
- Be friendly and natural.
- Be clear and helpful.
- Answer directly.
- Avoid unnecessary long introductions.
- Do not reveal hidden reasoning or internal thinking.
`;


// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    name: "NOVA AI",
    status: "online",
    message: "NOVA Brain is connected."
  });
});


// ========================================
// NOVA CHAT API
// ========================================

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
              role: "system",
              content: NOVA_SYSTEM_PROMPT
            },
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
      throw new Error(
        "Ollama returned " + ollamaResponse.status
      );
    }


    const data = await ollamaResponse.json();

    let reply = data.message?.content || "";


    // ========================================
    // REMOVE THINKING / REASONING
    // ========================================

    if (reply.includes("</think>")) {
      reply = reply.split("</think>").pop();
    }

    reply = reply.trim();


    // ========================================
    // KEEP NOVA IDENTITY CLEAN
    // ========================================

    reply = reply
      .replaceAll("I am Qwen3", "I am NOVA")
      .replaceAll("I'm Qwen3", "I'm NOVA")
      .replaceAll("I am Qwen", "I am NOVA")
      .replaceAll("I'm Qwen", "I'm NOVA")
      .replaceAll("Qwen3", "NOVA")
      .replaceAll("Qwen", "NOVA")
      .replaceAll("Tongyi", "NOVA");


    // ========================================
    // FALLBACK
    // ========================================

    if (!reply) {
      reply =
        "I'm NOVA, but I couldn't generate a response right now.";
    }


    // ========================================
    // SEND RESPONSE TO FRONTEND
    // ========================================

    res.json({
      reply: reply
    });


  } catch (error) {

    console.error("NOVA Brain error:", error);

    res.status(500).json({
      error:
        "NOVA Brain is unavailable. Make sure Ollama is running."
    });

  }

});


// ========================================
// START NOVA BACKEND
// ========================================

app.listen(PORT, () => {
  console.log(
    "NOVA Brain running on http://localhost:" + PORT
  );
});
