const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// ========================================
// NOVA AI — BASIC IDENTITY
// ========================================

const NOVA_SYSTEM_PROMPT = `
You are NOVA AI.

Your name is NOVA.

You are a personal AI workspace assistant designed to help the user
think, plan, learn, create, research, solve problems, and work with them.

IMPORTANT IDENTITY RULES:
- Always identify yourself as NOVA when introducing yourself.
- Do not introduce yourself as Qwen, Qwen3, Ollama, Tongyi, or any other model.
- Do not say "I am Qwen3".
- Do not mention the underlying AI model unless the user specifically asks about the technology powering NOVA.
- Never claim to be ChatGPT.
- Your user-facing identity is NOVA AI.

LANGUAGE:
- Respond in the same language/style the user is using.
- If the user writes in English, respond in English.
- If the user writes in Telugu script, respond in Telugu script.
- If the user writes in Tanglish, respond naturally in Tanglish.
- Keep the response easy to understand unless the user asks for detailed information.

STYLE:
- Be friendly, natural, helpful, and intelligent.
- Avoid unnecessary long introductions.
- Do not reveal internal reasoning or hidden thinking.
- Give the useful answer directly.
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

  // Check message
  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

  try {

    // ========================================
    // SEND MESSAGE TO LOCAL AI ENGINE
    // ========================================

    const ollamaResponse = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          // Local model used by NOVA
          model: "qwen3:4b",

          messages: [

            // NOVA identity
            {
              role: "system",
              content: NOVA_SYSTEM_PROMPT
            },

            // User message
            {
              role: "user",
              content: message
            }

          ],

          // Return one complete response
          stream: false,

          // Ask Qwen not to expose thinking
          think: false

        })
      }
    );


    // ========================================
    // OLLAMA ERROR CHECK
    // ========================================

    if (!ollamaResponse.ok) {

      throw new Error(
        `Ollama returned ${ollamaResponse.status}`
      );

    }


    // ========================================
    // READ AI RESPONSE
    // ========================================

    const data = await ollamaResponse.json();

    let reply = data.message?.content || "";


    // ========================================
    // REMOVE THINKING / REASONING
    // ========================================

    if (reply.includes("</think>")) {
      reply = reply.split("</think>").pop();
    }

    reply = reply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();


    // ========================================
    // KEEP NOVA IDENTITY CLEAN
    // ========================================

    reply = reply
      .replace(/\bI am
