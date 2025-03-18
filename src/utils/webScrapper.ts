import axios from "axios";
import * as cheerio from "cheerio";

function cleanScrape(text: string): string {
  return text
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\s+style=["'][^"']*["']/gi, "")
    .replace(/\s*on\w+="[^"]*"/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&[a-zA-Z]+;/g, " ")
    .replace(/@media[^{]+\{[^}]+\}/g, "")
    .replace(/(\.|#)[a-zA-Z0-9_-]+[{][^}]+[}]/g, "")
    .replace(/fill=["'][^"']*["']/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\.css-[^\s{]+[{][^}]+[}]/g, "")
    .replace(/@\w+\s?[^{]*{[^}]+}/g, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/&[a-zA-Z]+;/g, " ")
    .replace(/<a[^>]*>(.*?)<\/a>/gi, "")
    .replace(/<button[^>]*>(.*?)<\/button>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s/g, "")
    .trim();
}
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

    return cleanScrape(jobContent);
  } catch (error) {
    console.error("Scraping error", error);
    throw error;
  }
}

export default scrapeJobPage;
