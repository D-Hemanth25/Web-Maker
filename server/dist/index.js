"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const prompt_1 = require("./prompt");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/template", async (req, res) => {
    const userPrompt = req.body.prompt;
    const basePrompt = "Return either node or react based on what do you think this project should be. Return only a single string either 'node' or 'react'. Do not return anything else";
    const prompt = basePrompt + "\n" + userPrompt;
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    if (answer.toString().trim() === "react") {
        res.json({
            prompts: [prompt_1.BASE_PROMPT, react_1.basePrompt],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (answer.toString().trim() === "node") {
        res.json({
            prompts: [node_1.basePrompt],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
    res.status(403).json({ message: "something went wrong" });
    return;
});
app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const prompt = messages + "\n" + (0, prompt_1.getSystemPrompt)();
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
});
