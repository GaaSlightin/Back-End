import { Mistral } from "@mistralai/mistralai";
import scrapeJobPage from "./webScrapper";
import { Job, Description } from "../interfaces/job.interfaces";

const API_KEY = process.env.MISTRAL_API_KEY;

if (!API_KEY) {
  throw new Error("Missing Mistral API key in environment variables");
}

// Initialize Mistral client
const client = new Mistral({ apiKey: API_KEY });

// Function to extract job data
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
        "posting_date": "<Extracted Posting Date> or generate a new date if not found",
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

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from Mistral API");
    }

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Message content is not a string");
    }

    return JSON.parse(content.trim());
  } catch (error: any) {
    console.error("Error making request to Mistral API:", error.message);
    throw error;
  }
}

// Function to choose files to be calculated
async function chooseFilesToBeCalculated(
  filePaths: string[]
): Promise<string[]> {
  const prompt = `
I have a list of files from a code repository, and I want to analyze the complexity of the top 5 most logic-heavy files. Based on typical software engineering patterns, file naming conventions, and inferred roles, determine which files are likely to contain the most complex business logic. Prioritize:
  Controllers, services, or business logic layers
  Large utility/helper functions
  Core algorithmic implementations
  Configuration files or static assets should be deprioritized
Here is the list of files:
${filePaths}

🚨 IMPORTANT: 🚨
Return ONLY a JSON array of the top 5 file paths. Do NOT include any explanations, comments, or additional text. The JSON format should look like this:
[
  "file1.js",
  "file2.js",
  "file3.js",
  "file4.js",
  "file5.js"
]

If you cannot determine the top 5 files, return an empty JSON array: []
`;

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from Mistral API");
    }

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Message content is not a string");
    }

    return JSON.parse(content.trim());
  } catch (error: any) {
    console.error("Error making request to Mistral API:", error.message);
    throw error;
  }
}

// Function to calculate complexity
async function calculateComplexity(code: string): Promise<number> {
  const prompt = `
  I will provide you with a **sample** of combined code from 5 separate files in a code repository. Each file is separated by a comment like "/* File: <fileUrl> */". This is not the full codebase but a representative sample of the repository's logic. Analyze the complexity of this sample on a scale of 1 to 10. Consider factors such as:

  - The number of logical branches (if-else, loops, recursion)
  - The depth of nested structures
  - The use of advanced patterns (e.g., functional programming, design patterns)
  - The number of dependencies or external calls
  - The readability and maintainability of the code

  Score the overall complexity from 1 (very simple) to 10 (highly complex), keeping in mind that this is a partial sample and not the entire codebase.

  Here is the combined code:
  ${code}
  `;

  try {
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from Mistral API");
    }

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Message content is not a string");
    }

    const match = content.trim().match(/\b([1-9]|10)\b/); // Match a number between 1 and 10
    if (match) {
      return parseInt(match[0], 10); // Return the matched number as an integer
    } else {
      throw new Error("Could not extract a valid complexity score from the response");
    }
  } catch (error: any) {
    console.error("Error making request to Mistral API:", error.message);
    throw error;
  }
}

export { extractJobData, chooseFilesToBeCalculated, calculateComplexity };