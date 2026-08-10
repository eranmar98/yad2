import { GoogleGenAI } from "@google/genai";

// Vite only exposes env vars prefixed with VITE_ to client code.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Missing Gemini API Key in environment variables.");
}

// Initialize lazily so a missing key doesn't crash the whole app at import time.
let ai: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key in environment variables.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}