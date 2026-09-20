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
    message: "NOVA Brain backend is running."
  });
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required."
    });
  }

  res.json({
    reply: `NOVA received: ${message}`
  });
});

app.listen(PORT, () => {
  console.log(`NOVA backend running on port ${PORT}`);
});
