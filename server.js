const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 1988;

app.use(express.json());

// GET /status route to fetch assistant content
app.get('/status/:thread_id/:run_id', async (req, res) => {
    const { thread_id, run_id } = req.params;
    console.log(`🧠 Fetching status for thread: ${thread_id} and run: ${run_id}`);

    try {
        // Call OpenAI API to fetch assistant's status using thread_id and run_id
        const response = await axios.get(`https://api.openai.com/v1/assistants/${process.env.ASSISTANT_ID}/runs/${run_id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2', // Ensure the correct header
            }
        });

        console.log("🧠 Assistant Response:", response.data);

        // Check if the result is ready
        if (response.data.result) {
            res.status(200).json({
                status: 'completed',
                script: response.data.result // Assuming the result is in the 'result' field
            });
        } else {
            res.status(400).json({ error: 'No result found for this run.' });
        }
    } catch (error) {
        console.error("❌ Error fetching assistant status:", error.message);
        res.status(500).json({
            error: 'Failed to fetch content',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
  console.log(`✅ Neuroshade is listening on port ${PORT}`);
});
