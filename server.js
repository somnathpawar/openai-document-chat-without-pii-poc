const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const extractText = require("./extractText");
const redactPII = require("./redactPII");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const port = 3000;
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", upload.single("document"), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const file = req.file;
    const text = await extractText(file.path, file.mimetype);
    const redactedText = await redactPII(text);

    const fullPrompt = `Human: ${prompt}\nDocument:\n${redactedText}\n\nAssistant:`;

   const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4"
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: fullPrompt }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    fs.unlinkSync(file.path);
    res.send({ answer: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});