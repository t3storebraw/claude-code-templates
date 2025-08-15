const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const robotsParser = require('robots-parser');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3003;

// Configuration
const config = {
  userAgent: process.env.USER_AGENT || 'n8n-ai-agent/1.0',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
  followRedirects: process.env.FOLLOW_REDIRECTS !== 'false',
  maxRedirects: parseInt(process.env.MAX_REDIRECTS || '5'),
  enableCookies: process.env.ENABLE_COOKIES !== 'false',
  enableJavaScript: process.env.ENABLE_JAVASCRIPT === 'true',
  respectRobotsTxt: process.env.RESPECT_ROBOTS_TXT !== 'false',
  cacheResponses: process.env.CACHE_RESPONSES !== 'false',
  cacheTtl: parseInt(process.env.CACHE_TTL || '900'),
  maxFileSize: process.env.MAX_FILE_SIZE || '50MB'
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Cache for responses
const cache = new Map();
const robotsCache = new Map();

// Active request tracking
const activeRequests = new Set();

// Browser instance for JavaScript-enabled scraping
let browser = null;

// Utility functions
function getCacheKey(method, url, params = {}) {
  return `${method}:${url}:${JSON.stringify(params)}`;
}

function setCache(key, data, ttl = config.cacheTtl) {
  if (config.cacheResponses) {
    cache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    });
  }
}

function getCache(key) {
  if (!config.cacheResponses) return null;
  
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  if (cached) {
    cache.delete(key);
  }
  
  return null;
}

function isBlockedDomain(url) {
  const blockedDomains = (process.env.BLOCKED_DOMAINS || 'localhost,127.0.0.1,0.0.0.0').split(',');
  const hostname = new URL(url).hostname;
  return blockedDomains.some(blocked => hostname.includes(blocked));
}

async function checkRobotsTxt(url) {
  if (!config.respectRobotsTxt) return true;
  
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    
    if (robotsCache.has(robotsUrl)) {
      const robots = robotsCache.get(robotsUrl);
      return robots.isAllowed(url, config.userAgent);
    }
    
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: { 'User-Agent': config.userAgent }
    });
    
    const robots = robotsParser(robotsUrl, response.data);
    robotsCache.set(robotsUrl, robots);
    
    return robots.isAllowed(url, config.userAgent);
  } catch (error) {
    // If robots.txt is not accessible, assume allowed
    return true;
  }
}

async function initBrowser() {
  if (config.enableJavaScript && !browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }
}

// MCP Tool Implementations
const tools = {
  async fetch_url(params) {
    const { url, method = 'GET', headers = {}, timeout = config.requestTimeout } = params;
    
    if (isBlockedDomain(url)) {
      throw new Error('Domain is blocked');
    }
    
    if (!(await checkRobotsTxt(url))) {
      throw new Error('Blocked by robots.txt');
    }
    
    const cacheKey = getCacheKey(method, url, { headers });
    const cached = getCache(cacheKey);
    if (cached && method === 'GET') {
      return { ...cached, cached: true };
    }
    
    if (activeRequests.size >= config.maxConcurrentRequests) {
      throw new Error('Too many concurrent requests');
    }
    
    const requestId = `${Date.now()}-${Math.random()}`;
    activeRequests.add(requestId);
    
    try {
      const response = await axios({
        method,
        url,
        headers: {
          'User-Agent': config.userAgent,
          ...headers
        },
        timeout,
        maxRedirects: config.maxRedirects,
        validateStatus: () => true // Don't throw on HTTP error status
      });
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        url: response.config.url,
        redirected: response.request.res.responseUrl !== url
      };
      
      if (method === 'GET') {
        setCache(cacheKey, result);
      }
      
      return { ...result, cached: false };
    } finally {
      activeRequests.delete(requestId);
    }
  },

  async scrape_page(params) {
    const { url, selectors = {}, extractText = true, extractLinks = false, extractImages = false } = params;
    
    if (isBlockedDomain(url)) {
      throw new Error('Domain is blocked');
    }
    
    if (!(await checkRobotsTxt(url))) {
      throw new Error('Blocked by robots.txt');
    }
    
    const cacheKey = getCacheKey('scrape', url, { selectors, extractText, extractLinks, extractImages });
    const cached = getCache(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    let html;
    
    if (config.enableJavaScript) {
      await initBrowser();
      const page = await browser.newPage();
      
      try {
        await page.setUserAgent(config.userAgent);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: config.requestTimeout });
        html = await page.content();
      } finally {
        await page.close();
      }
    } else {
      const response = await tools.fetch_url({ url });
      html = response.data;
    }
    
    const $ = cheerio.load(html);
    const result = {
      url,
      title: $('title').text().trim(),
      meta: {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || ''
      }
    };
    
    // Extract custom selectors
    if (Object.keys(selectors).length > 0) {
      result.extracted = {};
      for (const [key, selector] of Object.entries(selectors)) {
        const elements = $(selector);
        result.extracted[key] = elements.map((i, el) => {
          const $el = $(el);
          return {
            text: $el.text().trim(),
            html: $el.html(),
            attributes: el.attribs || {}
          };
        }).get();
      }
    }
    
    // Extract text content
    if (extractText) {
      result.text = $('body').text().replace(/\s+/g, ' ').trim();
    }
    
    // Extract links
    if (extractLinks) {
      result.links = $('a[href]').map((i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        return {
          url: new URL(href, url).href,
          text: $el.text().trim(),
          title: $el.attr('title') || ''
        };
      }).get();
    }
    
    // Extract images
    if (extractImages) {
      result.images = $('img[src]').map((i, el) => {
        const $el = $(el);
        const src = $el.attr('src');
        return {
          url: new URL(src, url).href,
          alt: $el.attr('alt') || '',
          title: $el.attr('title') || ''
        };
      }).get();
    }
    
    setCache(cacheKey, result);
    return { ...result, cached: false };
  },

  async extract_links(params) {
    const { url, filter = null, internal = false } = params;
    
    const scrapeResult = await tools.scrape_page({ url, extractLinks: true });
    let links = scrapeResult.links || [];
    
    if (internal) {
      const urlObj = new URL(url);
      links = links.filter(link => new URL(link.url).hostname === urlObj.hostname);
    }
    
    if (filter) {
      const regex = new RegExp(filter, 'i');
      links = links.filter(link => regex.test(link.url) || regex.test(link.text));
    }
    
    return {
      url,
      links,
      count: links.length,
      filtered: !!filter,
      internalOnly: internal
    };
  },

  async download_file(params) {
    const { url, destination = null } = params;
    
    if (isBlockedDomain(url)) {
      throw new Error('Domain is blocked');
    }
    
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      headers: { 'User-Agent': config.userAgent },
      timeout: config.requestTimeout
    });
    
    const filename = destination || path.basename(new URL(url).pathname) || 'download';
    const filepath = path.join('/tmp', filename);
    
    const writer = require('fs').createWriteStream(filepath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve({
          success: true,
          filename,
          filepath,
          size: require('fs').statSync(filepath).size,
          contentType: response.headers['content-type']
        });
      });
      writer.on('error', reject);
    });
  },

  async post_request(params) {
    const { url, data, headers = {}, contentType = 'application/json' } = params;
    
    const requestHeaders = {
      'User-Agent': config.userAgent,
      'Content-Type': contentType,
      ...headers
    };
    
    return await tools.fetch_url({
      url,
      method: 'POST',
      headers: requestHeaders,
      data
    });
  },

  async put_request(params) {
    const { url, data, headers = {} } = params;
    
    return await tools.fetch_url({
      url,
      method: 'PUT',
      headers: {
        'User-Agent': config.userAgent,
        'Content-Type': 'application/json',
        ...headers
      },
      data
    });
  },

  async delete_request(params) {
    const { url, headers = {} } = params;
    
    return await tools.fetch_url({
      url,
      method: 'DELETE',
      headers: {
        'User-Agent': config.userAgent,
        ...headers
      }
    });
  },

  async parse_html(params) {
    const { html, selectors = {} } = params;
    
    const $ = cheerio.load(html);
    const result = {
      title: $('title').text().trim(),
      headings: {
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2: $('h2').map((i, el) => $(el).text().trim()).get(),
        h3: $('h3').map((i, el) => $(el).text().trim()).get()
      },
      paragraphs: $('p').map((i, el) => $(el).text().trim()).get(),
      links: $('a[href]').map((i, el) => ({
        url: $(el).attr('href'),
        text: $(el).text().trim()
      })).get(),
      images: $('img[src]').map((i, el) => ({
        src: $(el).attr('src'),
        alt: $(el).attr('alt') || ''
      })).get()
    };
    
    // Custom selectors
    if (Object.keys(selectors).length > 0) {
      result.custom = {};
      for (const [key, selector] of Object.entries(selectors)) {
        result.custom[key] = $(selector).map((i, el) => ({
          text: $(el).text().trim(),
          html: $(el).html()
        })).get();
      }
    }
    
    return result;
  },

  async parse_json(params) {
    const { data, jsonPath = null } = params;
    
    let parsed;
    if (typeof data === 'string') {
      parsed = JSON.parse(data);
    } else {
      parsed = data;
    }
    
    if (jsonPath) {
      // Simple JSONPath implementation
      const keys = jsonPath.replace(/^\$\./, '').split('.');
      let result = parsed;
      for (const key of keys) {
        if (result && typeof result === 'object') {
          result = result[key];
        } else {
          result = undefined;
          break;
        }
      }
      return { result, path: jsonPath };
    }
    
    return { result: parsed };
  },

  async get_page_screenshot(params) {
    const { url, width = 1920, height = 1080, fullPage = false } = params;
    
    if (!config.enableJavaScript) {
      throw new Error('JavaScript/browser support is disabled');
    }
    
    if (isBlockedDomain(url)) {
      throw new Error('Domain is blocked');
    }
    
    await initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width, height });
      await page.setUserAgent(config.userAgent);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: config.requestTimeout });
      
      const screenshot = await page.screenshot({
        fullPage,
        type: 'png',
        encoding: 'base64'
      });
      
      return {
        success: true,
        screenshot: `data:image/png;base64,${screenshot}`,
        dimensions: { width, height },
        fullPage,
        url
      };
    } finally {
      await page.close();
    }
  }
};

// Auto-detect and execute appropriate tool
async function autoDetectAndExecute(context, aiResponse) {
  const combinedText = `${context} ${aiResponse}`.toLowerCase();
  
  // URL extraction
  const urlMatch = context.match(/https?:\/\/[^\s]+/) || aiResponse.match(/https?:\/\/[^\s]+/);
  
  if (urlMatch) {
    const url = urlMatch[0];
    
    if (combinedText.includes('scrape') || combinedText.includes('extract')) {
      return await tools.scrape_page({
        url,
        extractText: true,
        extractLinks: true,
        extractImages: true
      });
    }
    
    if (combinedText.includes('fetch') || combinedText.includes('get')) {
      return await tools.fetch_url({ url });
    }
    
    if (combinedText.includes('screenshot')) {
      return await tools.get_page_screenshot({ url });
    }
  }
  
  return { message: 'No specific web operation detected' };
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MCP Web Server',
    version: '1.0.0',
    uptime: process.uptime(),
    cache: {
      size: cache.size,
      enabled: config.cacheResponses
    },
    activeRequests: activeRequests.size,
    browserEnabled: config.enableJavaScript,
    config: {
      respectRobotsTxt: config.respectRobotsTxt,
      maxConcurrentRequests: config.maxConcurrentRequests
    }
  });
});

app.get('/capabilities', (req, res) => {
  res.json({
    tools: Object.keys(tools),
    config: {
      enableJavaScript: config.enableJavaScript,
      respectRobotsTxt: config.respectRobotsTxt,
      maxConcurrentRequests: config.maxConcurrentRequests,
      cacheResponses: config.cacheResponses
    }
  });
});

app.post('/execute', async (req, res) => {
  try {
    const { tool, action, context, ai_response, ...params } = req.body;
    
    let result;
    
    if (action === 'auto_detect') {
      result = await autoDetectAndExecute(context, ai_response);
    } else if (tools[action]) {
      result = await tools[action](params);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    res.json({
      success: true,
      result,
      tool: 'web',
      action: action || 'auto_detect',
      execution_time: Date.now() - req.startTime
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      tool: 'web',
      execution_time: Date.now() - req.startTime
    });
  }
});

// Middleware to track execution time
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down web server...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`MCP Web Server running on port ${PORT}`);
  console.log(`JavaScript support: ${config.enableJavaScript}`);
  console.log(`Robots.txt respect: ${config.respectRobotsTxt}`);
  console.log(`Max concurrent requests: ${config.maxConcurrentRequests}`);
  
  if (config.enableJavaScript) {
    await initBrowser();
    console.log('Browser initialized for JavaScript support');
  }
});