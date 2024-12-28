import dotenv from "dotenv";
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { BASE_PROMPT, getSystemPrompt } from "./prompt";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(express.json());

app.post("/template", async (req: any, res: any) => {
    const userPrompt = req.body.prompt;
    const basePrompt = "Return either node or react based on what do you think this project should be. Return only a single string either 'node' or 'react'. Do not return anything else";

    const prompt = basePrompt + "\n" + userPrompt;
    const result = await model.generateContent(prompt);

    const answer = result.response.text();

    if (answer.toString().trim() === "react") {
        res.json({
            prompts: [BASE_PROMPT, reactBasePrompt],
            uiPrompts: [reactBasePrompt]
        });
        return;
    }
    
    if (answer.toString().trim() === "node") {
        res.json({
            prompts: [nodeBasePrompt],
            uiPrompts: [nodeBasePrompt]
        });
        return;
    }

    res.status(403).json({ message: "something went wrong" });
    return;
})


app.post("/chat", async (req: any, res: any) => {
    const messages = req.body.messages;
    const prompt = messages + "\n" + getSystemPrompt();

    const result = await model.generateContent(prompt);

    console.log(result.response.text());
    
    res.json({});
    return;
});
// async function generateResponse() {
//     const prompt = "Write a story about a magic backpack.";
//     const result = await model.generateContentStream(prompt);

    // for await (const chunk of result.stream) {
    //     const chunkText = chunk.text();
    //     process.stdout.write(chunkText);
    // }
// };

// generateResponse();

app.listen(3000, () => {
    console.log("app is running on port: 3000");
})

