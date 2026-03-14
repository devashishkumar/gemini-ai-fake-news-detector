const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Type for structured AI response
interface FakeNewsResult {
  verdict: 'FAKE' | 'REAL' | 'UNKNOWN';
  confidence: string;
  explanation: string;
}

/**
 * Detect fake news from a URL using Gemini AI
 */
async function detectFakeNewsFromURL(url: string): Promise<FakeNewsResult> {
  if (!url) throw new Error('URL is required');

  // 1️⃣ Fetch webpage
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  // 2️⃣ Extract readable text
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  const articleText: string = $('body').text().replace(/\s+/g, ' ').trim();

  if (!articleText) throw new Error('Could not extract article text');

  const trimmedText: string = articleText.substring(0, 12000); // Trim for token safety

  // 3️⃣ Gemini AI setup
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in your environment variables.');

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt: string = `
You are a professional fact-checker.

Analyze the news content below and return STRICT JSON:
{"verdict":"FAKE or REAL", "confidence":"0-100%", "explanation":"short explanation"}

Content:
${trimmedText}
  `;

  const result = await model.generateContent(prompt);
  const responseText: string = result.response.text();

  try {
    return JSON.parse(responseText) as FakeNewsResult;
  } catch {
    return {
      verdict: 'UNKNOWN',
      confidence: '0%',
      explanation: responseText,
    };
  }
}

// ----------------------
// Main execution
// ----------------------
(async () => {
  const url = process.argv[2]; // URL from command line
  if (!url) {
    console.log('Usage: npx ts-node ai-news-detector.ts <news-url>');
    process.exit(1);
  }

  try {
    const res = await detectFakeNewsFromURL(url);
    console.log('Result:', res);
  } catch (err: any) {
    console.error('Error:', err.message || err);
  }
})();