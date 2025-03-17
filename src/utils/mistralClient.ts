import axios from "axios";
import { Mistral } from "@mistralai/mistralai";
import { Description, Job } from "../interfaces/job.interfaces";
import { raw } from "express";
import { describe } from "node:test";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/completions";

// const client = new Mistral({ apiKey: Mistral_API_KEY });

if (!MISTRAL_API_KEY) {
  throw new Error("Mistral API key is missing");
}

interface MistralResponse {
  choices: { text: string }[];
}

export const generateSummary = async (text: string): Promise<string> => {
  try {
    const prompt = `Summarize the following job description in 2-3 sentences:\n\n${text}`;
    const response = await axios.post<MistralResponse>(
      MISTRAL_API_URL,
      {
        model: "mistral-large-latest",
        prompt,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data.choices[0]?.text?.trim() || "";
    if (!summary) {
      throw new Error("No summary generated");
    }
    return summary;
  } catch (error) {
    console.error("Error generating summary", error);
    return text.length > 150 ? text.substring(0, 147) + "..." : text;
  }
};

export const extractJobDataFromUrl = async (
  url: string
): Promise<{
  job: Omit<Job, "jobId"> & { jobId?: string };
  description: Omit<Description, "descriptionId"> & { descriptionId?: string };
}> => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const rawContent = response.data;

    const prompt = `
      Extract the following job details from the raw webpage content below in a structured JSON format:
      - title: The job title
      - company: The company name
      - location: The job location (city, state, country, or "Remote")
      - posting_date: The date the job was posted (in YYYY-MM-DD format, estimate if not exact)
      - description: The full job description (exclude salary or application instructions if possible)
      - skills: A list of skills mentioned (format as an array of objects with "name" and optional "category", e.g., [{"name": "Python", "category": "Programming"}])
      - source: The source of the job posting (e.g., "LinkedIn", "Indeed", or domain of the URL)

      If any field is missing, provide a reasonable default or leave it as an empty string/array.

      Raw content:
      ${rawContent}

      Return the extracted data as a JSON object.
    `;
    const extractionResponse = await axios.post<MistralResponse>(
      MISTRAL_API_URL,
      {
        model: "mistral-large-latest",
        prompt,
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const extractedText = extractionResponse.data.choices[0]?.text?.trim();
    if (!extractedText) {
      throw new Error("No job data extracted");
    }

    const { job: rawJob, description: rawDescription } =
      JSON.parse(extractedText);

    const mappedJob: Omit<Job, "jobId" | "description"> & {
      jobId?: string;
      descriptionId?: string;
    } = {
      userId: "",
      title: rawJob.title || "",
      company: rawJob.company || "",
      location: rawJob.location || "Unknown",
      posting_date: new Date(
        rawJob.posting_date || new Date().toISOString().split("T")[0]
      ),
      archive_date: new Date(),
      skills: Array.isArray(rawJob.skills) ? rawJob.skills : [],
      source: rawJob.source || new URL(url).hostname,
      url: rawJob.url || url,
    };

    const mappedDescription: Omit<Description, "descriptionId"> & {
      descriptionId?: string;
    } = {
      jobId: "",
      userId: "",
      fullText:
        rawDescription.fullText ||
        (typeof rawContent === "string"
          ? rawContent.substring(0, 1000) + "..."
          : ""),
      summary: rawDescription.summary || "",
    };

    return { job: mappedJob, description: mappedDescription };
  } catch (error) {
    console.error("Error extracting job data from URL", error);
    return {
      job: {
        userId: "",
        title: "",
        company: "",
        location: "Unknown",
        posting_date: new Date(),
        archive_date: new Date(),
        skills: [],
        source: new URL(url).hostname,
        url,
      },
      description: {
        jobId: "",
        userId: "",
        fullText: "",
        summary: "",
      },
    };
  }
};
