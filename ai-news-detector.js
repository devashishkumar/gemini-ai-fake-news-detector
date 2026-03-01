require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Detect fake news from a URL using Gemini AI
 * @param {string} url
 * @returns {Promise<{verdict: string, confidence: string, explanation: string}>}
 */
async function detectFakeNewsFromURL(url) {
  if (!url) throw new Error("URL is required");

  // 1️⃣ Fetch webpage
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  // 2️⃣ Extract readable text
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();

  const articleText = $("body").text().replace(/\s+/g, " ").trim();

  if (!articleText) {
    throw new Error("Could not extract article text");
  }

  // Limit text length (Gemini token safety)
  const trimmedText = articleText.substring(0, 12000);

  // 3️⃣ Gemini setup
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
  You are a fact-checker.

  Analyze the following news article content and determine if it is FAKE or REAL.

  Return STRICT JSON only:
  {
    "verdict": "FAKE or REAL",
    "confidence": "0-100%",
    "explanation": "short explanation"
  }

  Article Content:
  ${trimmedText}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      verdict: "UNKNOWN",
      confidence: "0%",
      explanation: responseText,
    };
  }
}

(async () => {
  const analysis = await detectFakeNewsFromURL("https://example.com/news");
  console.log(analysis);
})();
