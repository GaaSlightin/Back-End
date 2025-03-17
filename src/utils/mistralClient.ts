import { Mistral } from "@mistralai/mistralai";
import scrapeJobPage from "./webScrapper";
import { Job, Description } from "../interfaces/job.interfaces";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: MISTRAL_API_KEY });

async function extractJobData(
  url: string
): Promise<{ job: Job; description: Description }> {
  const content = await scrapeJobPage(url);

  const prompt = `Given the following scraped content from a job listing webpage, extract the job data and return it as a JSON object with two main properties: "job" and "description". The "job" object should follow this structure:
  - jobId (string, optional): Unique job identifier, extract from URL or content if present
  - userId (string): Set as "default-user" since no user context is provided
  - title (string): Job title from the content
  - company (string): Company name from the content
  - archive_date (Date, ISO string): Use today's date (March 17, 2025) as a placeholder
  - source (string): Set as "Incorta Careers"
  - url (string): The provided URL

  The "description" object should follow this structure:
  - descriptionId (string, optional): Leave undefined if not present
  - location (string): Extract from content, default to "Unknown" if not found
  - userId (string): Set as "default-user"
  - posting_date (Date, ISO string): Extract from content if present, otherwise use today's date (March 17, 2025)
  - skills (array of { name: string }): List skills mentioned in the content
  - url (string): The provided URL
  - fullText (string): The full scraped text
  - summary (string, optional): A brief summary of the job, if derivable

  Here's the scraped content:
  ${content}

  Return the result in this JSON format:
  {
    "job": { ... },
    "description": { ... }
  }
  If any field is missing, use reasonable defaults or leave optional fields undefined.
  `;
  const result = await client.chat.complete({
    model: "mistral-large-latest",
    stream: false,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  let rawResponse =
    result.choices && result.choices[0]
      ? result.choices[0].message.content
      : "";

  if (typeof rawResponse === "string") {
    rawResponse = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } else {
    rawResponse = "";
  }

  try {
    const extractedData = JSON.parse(rawResponse);
    extractedData.job.archive_date = new Date(extractedData.job.archive_date);
    extractedData.description.posting_date = new Date(
      extractedData.description.posting_date
    );
    return extractedData;
  } catch (error) {
    console.error("Raw response causing JSON parse error:", rawResponse);
    throw new Error(
      `Failed to parse Mistral response as JSON: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// async function test() {
//   const url =
//     "https://www.incorta.com/careers/job-detail?lv_jid=cd2c2b3a-44af-4d99-bdd7-53d6b002eaf5&_gl=1*1lz300l*_gcl_au*MTI5Mzk4NjI5MC4xNzQyMTE2Njk5";
//   const data = await extractJobData(url);
//   console.log(data);
// }

// test().catch(console.error);
export default extractJobData;
