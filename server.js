const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1988;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🧠 Neuroshade is live");
});

app.post("/trigger", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  try {
    console.log("✅ Trigger received:", title);

    const response = await axios.post(
      "https://api.openai.com/v1/threads",
      {
        messages: [
          {
            role: "user",
            content: `Title: ${title}\n\nDescription: ${description}\n\nTurn this into a 60-second narrated short with cinematic tone.`
          }
        ],
        assistant_id: process.env.ASSISTANT_ID
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        }
      }
    );

    console.log("✅ Assistant thread created:", response.data);

    res.status(200).json({
      message: "Trigger sent to Assistant",
      thread_id: response.data.id
    });

  } catch (error) {
    console.error("❌ Trigger error:", (error.response && error.response.data) || error.message);
    res.status(500).json({
      error: "Failed to generate content",
      details: (error.response && error.response.data) || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Neuroshade is listening on port ${PORT}`);
});
