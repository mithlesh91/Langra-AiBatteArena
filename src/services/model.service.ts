import { ChatGoogle } from "@langchain/google";
import configs from "../config/config.js";
import { MistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";

export const Google_gemini = new ChatGoogle({
    model: "gemini-3.5-flash-lite",
    apiKey: configs.GOOGLE_API_KEY
});

export const Mistral_model = new MistralAI({
    model: "mistral-tiny",
    apiKey: configs.MISTRAL_API_KEY
});

export const Coheremodel = new ChatCohere({
    model: "command-r-08-2024",
    apiKey: configs.COHERE_API_KEY
});