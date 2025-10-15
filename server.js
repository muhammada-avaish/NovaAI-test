import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// --- SambaNova API setup ---
const SAMBANOVA_API_KEY = "ce80c012-b203-42dd-ade1-8fb54fe5cb54";
const SAMBANOVA_BASE_URL = "https://api.sambanova.ai/v1";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// --- Chat endpoint ---
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(`${SAMBANOVA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: false,
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: message,
              },
            ],
          },
        ],
      }),
    });

    // Parse response safely
    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    // SambaNova may return different formats depending on update
    let reply = "NovaAI: Sorry, I could not respond.";

    if (data.choices && data.choices.length > 0) {
      const msg = data.choices[0].message;
      if (typeof msg.content === "string") {
        reply = msg.content;
      } else if (Array.isArray(msg.content) && msg.content[0]?.text) {
        reply = msg.content[0].text;
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ reply: "NovaAI: Error processing your request." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ NovaAI server running at http://localhost:${PORT}`);
});

