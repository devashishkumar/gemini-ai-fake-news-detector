# Gemini AI Fake News Detector

A Node.js application that uses Google's Gemini AI to detect fake news articles from URLs.

## Features

- 🔗 Fetches and extracts article content from URLs
- 🤖 Analyzes news using Google's Gemini 2.5 Flash model
- ✅ Returns verdict (FAKE/REAL) with confidence level and explanation
- 🧹 Cleans HTML and extracts readable text using Cheerio

## Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

Run the detector with a news URL:

```bash
node ai-news-detector.js <news-url>
```

### Example

```bash
node ai-news-detector.js https://example.com/news-article
```

### Output

```json
{
  "verdict": "REAL",
  "confidence": "85%",
  "explanation": "The article contains verified facts and credible sources."
}
```

## How It Works

1. **Fetch**: Downloads the webpage using Axios
2. **Extract**: Parses HTML and extracts clean text using Cheerio
3. **Analyze**: Sends content to Gemini AI for fact-checking
4. **Return**: Gets verdict with confidence and explanation

## Dependencies

- `@google/generative-ai` - Google Gemini AI API
- `axios` - HTTP client for fetching URLs
- `cheerio` - HTML parsing and text extraction
- `dotenv` - Environment variable management

## License

ISC