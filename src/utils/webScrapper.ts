import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeJobPage(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const html = response.data as string;
    const $ = cheerio.load(html);
    const jobContent = $("body").text();

    return jobContent;
  } catch (error) {
    console.error("Scraping error", error);
    throw error;
  }
}

export default scrapeJobPage;
