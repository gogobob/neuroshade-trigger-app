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

    // Step 1: Create a new thread
    const threadRes = await axios.post(
      "https://api.openai.com/v1/threads",
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        }
      }
    );

    const thread_id = threadRes.data.id;
    console.log("🧵 Thread created:", thread_id);

    // Step 2: Add user message
    await axios.post(
      `https://api.openai.com/v1/threads/${thread_id}/messages`,
      {
        role: "user",
        content: `Title: ${title}\n\nDescription: ${description}\n\nTurn this into a 60-second narrated short with cinematic tone.`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        }
      }
    );

    console.log("✉️ Message added to thread");

    // Step 3: Run the Assistant
    const runRes = await axios.post(
      `https://api.openai.com/v1/threads/${thread_id}/runs`,
      {
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

    console.log("🏃‍♂️ Assistant run started:", runRes.data.id);

    res.status(200).json({
      message: "Trigger sent successfully",
      thread_id,
      run_id: runRes.data.id
    });

  } catch (error) {
    console.error("❌ Trigger error:", (error.response && error.response.data) || error.message);
    res.status(500).json({
      error: "Failed to trigger assistant",
      details: (error.response && error.response.data) || error.message
    });
  }
});
app.listen(1988, () => {
  console.log("✅ Neuroshade is listening on port 1988");
});
// GET status route to fetch assistant content
app.get('/status/:thread_id/:run_id', async (req, res) => {
    const { thread_id, run_id } = req.params;

    try {
        // Call OpenAI API to fetch assistant's status using thread_id and run_id
        const response = await axios.get(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}/runs/${run_id}`, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2', // Ensure the correct header
            }
        });

        res.status(200).json({
            status: 'completed',
            script: response.data.result // Assuming the result is in the 'result' field
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
