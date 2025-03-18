import axios from 'axios';

async function scrapeRawCode(url: string): Promise<string> {  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // GitHub allows this for basic scraping
      },
      timeout: 5000
    });
    
    const code = response.data as string;
    return code;
  } catch (error) {
    console.error('Scraping failed:', error);
    throw error;
  }
}

export default scrapeRawCode;