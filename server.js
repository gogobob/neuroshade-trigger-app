const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate', async (req, res) => {
  const { topic } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/assistants/YOUR_ASSISTANT_ID/runs',
      {
        input: {
          title: topic,
          description: `Generate a 60-second video script and caption for the topic: ${topic}`
        }
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error generating content:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Neuroshade app running at http://localhost:${PORT}`);
});
