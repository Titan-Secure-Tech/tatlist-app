/**
 * Firecrawl AI-powered web scraping client
 * Used for extracting product data from Lucky Supply website
 */

import { FirecrawlAppV1 } from '@mendable/firecrawl-js';

if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error('FIRECRAWL_API_KEY environment variable is required');
}

export const firecrawlApp = new FirecrawlAppV1({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export default firecrawlApp;