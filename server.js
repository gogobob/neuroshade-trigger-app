const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/trigger", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/threads",
      {
        messages: [
          {
            role: "user",
            content: `Title: ${title}\n\nDescription: ${description}\n\nTurn this into a 60-second narrated short with a cinematic, forward-facing tone. Include a powerful hook, visual cues, and end with a CTA.`
          }
        ],
        assistant_id: process.env.ASSISTANT_ID
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // You could enhance this section by running the thread or fetching completions — placeholder for now
    const threadData = response.data;

    res.status(200).json({
      message: "Trigger sent successfully",
      thread_id: threadData.id,
      raw: threadData
    });

  } catch (error) {
    console.error("❌ Error generating content:", (error.response && error.response.data) || error.message);
    res.status(500).json({
      error: "Failed to generate content",
      details: (error.response && error.response.data) || error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("🧠 Neuroshade Content Trigger is alive.");
});

app.listen(PORT, () => {
  console.log(`✅ Neuroshade is listening on port ${PORT}`);
});
