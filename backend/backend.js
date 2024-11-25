const axios = require('axios');
const cheerio = require('cheerio');
const natural = require('natural');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const summary = require('node-summary'); 

// Configure PostgreSQL connection
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'cyber_incidents',
  password: 'root123',
  port: 5432,
});
db.connect();

// Set up the Naive Bayes classifier with the natural library
const classifier = new natural.BayesClassifier();

// Relevant keywords
const relevantKeywords = [
  'cybersecurity', 'incident', 'breach', 'vulnerability', 'malware', 
  'threat', 'ransomware', 'phishing', 'zero-day', 'exploit',
  'DDoS', 'hacker', 'encryption', 'data breach', 'unauthorized access',
  'security flaw', 'password leak', 'network compromise', 'cyberattack',
  'state-sponsored attack', 'cyber threat', 'patch', 'critical vulnerability',
  'attack surface', 'botnet', 'keylogger', 'spyware', 'worm', 'rootkit',
  'trojan', 'denial of service', 'identity theft', 'cyber crime',
  'firewall breach', 'security alert', 'authentication bypass', 'backdoor',
  'cyber espionage', 'security audit', 'data leak', 'zero-trust', 
  'threat intelligence', 'SOC', 'endpoint protection', 'SIEM', 'APT', 
  'mitigation', 'patch management', 'cyber hygiene', 'red team', 'blue team',
  'ethical hacking', 'CVE', 'CISO', 'cyber defense', 'forensics',
  'penetration testing', 'social engineering', 'business email compromise',
  'attack vector', 'threat landscape', 'ransom demand', 'supply chain attack',
  'privilege escalation', 'payload', 'buffer overflow', 'data exfiltration',
  'cybersecurity framework', 'sensitive data', 'breach response',
  'incident management', 'cyber resilience', 'digital forensics',
  'threat actor', 'hacking campaign', 'insider threat', 'privileged account',
  'network intrusion', 'threat modeling', 'honeypot', 'penetration test',
  'security assessment', 'threat mitigation', 'vulnerability assessment',
  'cyber risk', 'patch deployment', 'code injection', 'API attack', 'DNS attack'
];

// Add relevant keywords
relevantKeywords.forEach(keyword => classifier.addDocument(keyword, 'relevant'));

// Irrelevant keywords
const irrelevantKeywords = [
  'sports', 'entertainment', 'movies', 'celebrity', 'weather', 
  'politics', 'economy', 'fashion', 'travel', 'music', 'art',
  'technology trends', 'book review', 'festival', 'food', 
  'wildlife', 'community', 'education', 'shopping', 'gadgets', 
  'fitness', 'health','error','ERROR','service', 'unavilable', 
  'local news', 'international news','academic','adventure',
  'culture', 'dining', 'architecture', 'nature', 'camping',
  'fishing', 'hiking', 'dance', 'photography', 'gardening',
  'home improvement', 'beauty tips', 'family', 'parenting',
  'crafts', 'vehicles', 'real estate', , 'business news',
  'personal finance', 'stock market', 'investments', 'taxation',
  'law', 'religion', 'history', 'space exploration', 'literature',
  'new restaurant', 'festival guide', 'travel guide', 'weather update',
  'sports tournament', 'fashion', 'music concert', 'art gallery',
  'dog training', 'cat breeds', 'bird watching', 'nature walks',
  'movie release', 'film festival', 'TV series', 'book fair',
  'music awards', 'food festival', 'cycling', 'yoga', 'meditation',
  'local market', 'community events', 'stock analysis',
  'real estate trends', 'political debates', 'weather forecast',
  'celebrity gossip', 'new video game', 'gaming', 'comic books'
];

// Add irrelevant keywords
irrelevantKeywords.forEach(keyword => classifier.addDocument(keyword, 'irrelevant'));

// Train the classifier
classifier.train();


// Function to cleanse text by removing problematic characters
function cleanseText(text) {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '');
}

// Check if text is meaningful
function isMeaningfulText(text) {
  if (text.length < 50) return false;
  const words = text.split(/\s+/);
  if (words.length < 10) return false;

  return true;
}

// Summarize text using node-summary
async function summarizeText(text, maxLength = 300) {
  return new Promise((resolve, reject) => {
    summary.summarize('', text, (err, summarizedText) => {
      if (err) {
        reject(err);
      } else {
        let result = summarizedText || text;
        if (result.length > maxLength) {
          // Truncate to the nearest word within maxLength
          result = result.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
        }
        resolve(result);
      }
    });
  });
}

// Classify the scraped text
function classifyText(text) {
  const classification = classifier.classify(text);
  return classification === 'relevant';
}

// Function to store relevant data in PostgreSQL
async function storeInDatabase(url, title, text) {
  const summarizedText = await summarizeText(text); // Summarize only for storage, not classification
  const query = `
    INSERT INTO incidents (url, title, text, timestamp)
    VALUES ($1, $2, $3, NOW())
  `;
  try {
    await db.query(query, [url, title, summarizedText]);
    console.log(`Stored summarized incident from ${url} in database with title "${title}".`);
  } catch (error) {
    console.error(`Error storing data in database:`, error.message);
  }
}

// Function to scrape data from each link
async function scrapeDataFromLink(driver, url) {
  try {
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('body')), 10000);

    let title = await driver.getTitle();
    let content = await driver.findElement(By.css('body')).getText();
    const cleanedContent = cleanseText(content);

    // First classify using the full text before summarizing
    if (isMeaningfulText(cleanedContent) && classifyText(cleanedContent)) {
      // If classified as relevant, store it in the database
      await storeInDatabase(url, title, cleanedContent);
    } else {
      console.log(`URL ${url} classified as irrelevant or non-meaningful.`);
    }
  } catch (error) {
    console.error(`Error scraping data from ${url}:`, error);
  }
}


// Function to perform the Link Extraction
async function scrapeLinks(query) {
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

  try {
    let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await driver.get(searchUrl);

    await driver.wait(until.elementLocated(By.css('div#search')), 10000);

    let links = await driver.findElements(By.css('div#search a'));
    let urls = [];

    for (let link of links) {
      let url = await link.getAttribute('href');
      urls.push(url);
    }

    console.log(`Links for the query "${query}":`);
    urls.forEach(url => console.log(url));

    // Process each link
    for (let url of urls) {
      await scrapeDataFromLink(driver, url);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await driver.quit();
  }
}

// Function to generate insights from the database
async function generateInsights() {
  const query = `
    SELECT date_trunc('day', timestamp) AS day, COUNT(*) AS incident_count
    FROM incidents
    WHERE timestamp > NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day
  `;

  try {
    const result = await db.query(query);
    const data = result.rows.map(row => ({ date: row.day, count: row.incident_count }));
    fs.writeFileSync(path.join(__dirname, 'incident_trends.json'), JSON.stringify(data, null, 2));
    console.log('Analytics saved to "incident_trends.json".');
  } catch (error) {
    console.error('Error generating insights:', error.message);
  }
}

// Run the main functions
(async () => {
  const query = 'cyber incidents site:gov.in';
  await scrapeLinks(query);
  await generateInsights();
  db.end();
})();
