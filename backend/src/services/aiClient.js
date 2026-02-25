import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();



if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️ GROQ_API_KEY is missing in .env");
}



const aiClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export default aiClient;