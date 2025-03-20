// import { Mistral } from "@mistralai/mistralai";
import OpenAI from "openai";
import scrapeJobPage from "./webScrapper";
import { Job, Description } from "../interfaces/job.interfaces";
const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
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
        "skills": ["<Extracted Skill 1>", "<Extracted Skill 2>", "..."],
        "archive_date": "<Extracted Archive Date>",
        "source": "<Extracted Source Name>",
        "url": "<Extracted Job Posting URL>"
      },
      "description": {
        "location": "<Extracted Job Location>",
        "posting_date": "<Extracted Posting Date> or generate a new date if not found",
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

async function chooseFilesToBeCalculated(
  filePathes: string[]
): Promise<string[]> {
  const prompt = `
I have a list of files from a code repository, and I want to analyze the complexity of the top 5 most logic-heavy files. Based on typical software engineering patterns, file naming conventions, and inferred roles, determine which files are likely to contain the most complex business logic. Prioritize:
  Controllers, services, or business logic layers
  Large utility/helper functions
  Core algorithmic implementations
  Configuration files or static assets should be deprioritized
Here is the list of files:
${filePathes}

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
    const content = response.choices[0].message.content;

    if (
      content &&
      (content.trim().startsWith("{") || content.trim().startsWith("["))
    ) {
      const parsedResponse = JSON.parse(content);
      return parsedResponse;
    } else {
      throw new Error("Response is not valid JSON");
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    throw error;
  }
}

async function calculateComplexity(code: string): Promise<number> {
  const prompt = `
  I will provide you with a combined code snippet that includes multiple files from a code repository. Each file's content is prefixed with its file path for context. Analyze the overall complexity of the combined code on a scale of 5.5 to 10. Consider the following factors:

- The number of logical branches (if-else, loops, recursion) across all files.
- The depth of nested structures and their impact on readability.
- The use of advanced patterns (e.g., functional programming, design patterns).
- The number of dependencies or external calls present in the code.
- The overall readability, maintainability, and modularity of the combined code.

Provide a single numeric score for the complexity (5.5 = moderately complex, 10 = highly complex). Additionally, provide a brief explanation for the rating, focusing on the combined logic and structure of the code.

Here is the combined code:
${code}

🚨 IMPORTANT: 🚨
Return ONLY the numeric score (between 5.5 and 10) and a brief explanation. Do NOT include any additional text, summaries, or comments.
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
    const content = response.choices[0].message.content;

    // Log the raw response for debugging
    //console.log("Raw Response:", content);

    if (content) {
      // Extract the numeric score from the response
      const match = content.match(/\b([1-9]|10)\b/); // Match a number between 1 and 10
      if (match) {
        return parseInt(match[0], 10); // Return the matched number as an integer
      } else {
        throw new Error(
          "Could not extract a valid complexity score from the response"
        );
      }
    } else {
      throw new Error("Response content is null or undefined");
    }
  } catch (error) {
    console.error("Error parsing response:", error);
    throw error;
  }
}
export { extractJobData, chooseFilesToBeCalculated, calculateComplexity };
