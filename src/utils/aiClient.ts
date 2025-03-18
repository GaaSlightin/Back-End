// import { Mistral } from "@mistralai/mistralai";
import OpenAI from "openai";
import scrapeJobPage from "./webScrapper";
import { Job, Description } from "../interfaces/job.interfaces";
const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: API_KEY,
});

async function extractJobData(
  url: string
): Promise<{ job: Job; description: Description }> {
  const content = await scrapeJobPage(url);

  const prompt = `
    Extract job-related information from the provided input and return only a JSON object with the exact structure below. Do not include any explanations, comments, or extra text—only the raw JSON output. If a field is missing in the input, return an empty string ("") for string fields and an empty array ([]) for list fields. Maintain proper JSON formatting.

    STRICT OUTPUT FORMAT:
    {
      "job": {
        "title": "<Extracted Job Title>",
        "company": "<Extracted Company Name>",
        "archive_date": "<Extracted Archive Date>",
        "source": "<Extracted Source Name>",
        "url": "<Extracted Job Posting URL>"
      },
      "description": {
        "location": "<Extracted Job Location>",
        "posting_date": "<Extracted Posting Date as Date Type>",
        "skills": ["<Extracted Skill 1>", "<Extracted Skill 2>", "..."],
        "url": "<Extracted Job Description URL>",
        "fullText": "<Extracted Complete Job Description>"
      }
    }

    And that is the content:
    ${content}

    🚨 IMPORTANT: 🚨

    Return ONLY the JSON output. No additional words, summaries, or explanations.
    If a value is missing, return an empty string or empty array instead of null.
    Follow this format exactly. Any deviation will be considered incorrect.
  `;

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "" },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-4o-mini",
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
  });

  try {
    if (response.choices[0].message.content) {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return parsedResponse;
    } else {
      throw new Error("Response content is null");
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    throw error;
  }
}

export default extractJobData;
