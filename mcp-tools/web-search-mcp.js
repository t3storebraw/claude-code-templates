const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

class WebSearchMCP {
  constructor() {
    this.name = 'web_search_mcp';
    this.description = 'Web search and information retrieval';
    this.version = '1.0.0';
    this.searchEngines = {
      google: 'https://www.google.com/search',
      bing: 'https://www.bing.com/search',
      duckduckgo: 'https://duckduckgo.com/'
    };
  }

  async initialize() {
    console.log(`Initializing ${this.name} MCP tool`);
    return { success: true, message: 'Web Search MCP initialized' };
  }

  async searchWeb(query, options = {}) {
    try {
      const {
        engine = 'google',
        maxResults = 10,
        language = 'en',
        region = 'us'
      } = options;

      // For demonstration, we'll simulate search results
      // In production, you'd integrate with actual search APIs
      const searchResults = await this.simulateSearch(query, maxResults);
      
      return {
        success: true,
        data: {
          query,
          engine,
          results: searchResults,
          totalResults: searchResults.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async simulateSearch(query, maxResults) {
    // Simulate search results for demonstration
    const results = [];
    const baseUrls = [
      'https://example.com',
      'https://wikipedia.org',
      'https://stackoverflow.com',
      'https://github.com',
      'https://medium.com'
    ];

    for (let i = 0; i < Math.min(maxResults, 5); i++) {
      results.push({
        title: `Search result for: ${query} - Result ${i + 1}`,
        url: `${baseUrls[i]}/search?q=${encodeURIComponent(query)}`,
        snippet: `This is a simulated search result for the query "${query}". It contains relevant information that would be found in a real search.`,
        rank: i + 1
      });
    }

    return results;
  }

  async scrapeWebpage(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extract key information
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const keywords = $('meta[name="keywords"]').attr('content') || '';
      
      // Extract main content
      const mainContent = $('main, article, .content, .main').text().trim() || $('body').text().trim();
      
      // Extract links
      const links = [];
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        if (href && text) {
          links.push({ url: href, text });
        }
      });

      // Extract images
      const images = [];
      $('img[src]').each((i, elem) => {
        const src = $(elem).attr('src');
        const alt = $(elem).attr('alt') || '';
        if (src) {
          images.push({ src, alt });
        }
      });

      return {
        success: true,
        data: {
          url,
          title,
          description,
          keywords,
          content: mainContent.substring(0, 5000), // Limit content size
          links: links.slice(0, 20), // Limit number of links
          images: images.slice(0, 10), // Limit number of images
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async extractStructuredData(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extract JSON-LD structured data
      const jsonLd = [];
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const data = JSON.parse($(elem).html());
          jsonLd.push(data);
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // Extract Open Graph data
      const openGraph = {};
      $('meta[property^="og:"]').each((i, elem) => {
        const property = $(elem).attr('property');
        const content = $(elem).attr('content');
        if (property && content) {
          openGraph[property] = content;
        }
      });

      // Extract Twitter Card data
      const twitterCard = {};
      $('meta[name^="twitter:"]').each((i, elem) => {
        const name = $(elem).attr('name');
        const content = $(elem).attr('content');
        if (name && content) {
          twitterCard[name] = content;
        }
      });

      return {
        success: true,
        data: {
          url,
          jsonLd,
          openGraph,
          twitterCard,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkWebsiteStatus(url) {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true // Don't throw on non-2xx status codes
      });
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          headers: {
            'content-type': response.headers['content-type'],
            'server': response.headers['server'],
            'content-length': response.headers['content-length']
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: true,
        data: {
          url,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async analyzeWebContent(url) {
    try {
      const scrapeResult = await this.scrapeWebpage(url);
      if (!scrapeResult.success) {
        return scrapeResult;
      }

      const content = scrapeResult.data.content;
      
      // Basic content analysis
      const analysis = {
        url,
        wordCount: content.split(/\s+/).length,
        characterCount: content.length,
        averageWordLength: content.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200), // Assuming 200 words per minute
        language: this.detectLanguage(content),
        sentiment: this.analyzeSentiment(content),
        topics: this.extractTopics(content)
      };

      return {
        success: true,
        data: {
          ...scrapeResult.data,
          analysis
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  detectLanguage(text) {
    // Simple language detection based on common words
    const languages = {
      en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'],
      es: ['el', 'la', 'y', 'o', 'pero', 'en', 'sobre', 'a', 'para', 'de'],
      fr: ['le', 'la', 'et', 'ou', 'mais', 'dans', 'sur', 'à', 'pour', 'de']
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    for (const [lang, commonWords] of Object.entries(languages)) {
      scores[lang] = commonWords.filter(word => words.includes(word)).length;
    }

    const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return detectedLang || 'en';
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'terrible', 'worst'];

    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = positiveWords.filter(word => words.includes(word)).length;
    const negativeCount = negativeWords.filter(word => words.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  extractTopics(text) {
    // Simple topic extraction based on frequency
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Skip short words
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ word, frequency: freq }));
  }

  async execute(operation, params) {
    switch (operation) {
      case 'search':
        return await this.searchWeb(params.query, params.options);
      case 'scrape':
        return await this.scrapeWebpage(params.url);
      case 'extract_structured':
        return await this.extractStructuredData(params.url);
      case 'check_status':
        return await this.checkWebsiteStatus(params.url);
      case 'analyze_content':
        return await this.analyzeWebContent(params.url);
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }
}

module.exports = WebSearchMCP;