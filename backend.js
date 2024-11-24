const axios = require('axios');
const cheerio = require('cheerio');
const natural = require('natural');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const summary = require('node-summary'); // Alternative summarizer

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
classifier.addDocument('cybersecurity incident report', 'relevant');
classifier.addDocument('security breach', 'relevant');
classifier.addDocument('vulnerability', 'relevant');
classifier.addDocument('security threats', 'relevant');
classifier.addDocument('general news', 'irrelevant');
classifier.addDocument('health news', 'irrelevant');
classifier.addDocument('sports news', 'irrelevant');
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

  const keywords = ['breach', 'malware', 'cybersecurity', 'vulnerability', 'threat'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Summarize text using node-summary
async function summarizeText(text) {
  return new Promise((resolve, reject) => {
    summary.summarize('', text, (err, summarizedText) => {
      if (err) reject(err);
      else resolve(summarizedText || text);
    });
  });
}

// Classify the scraped text
function classifyText(text) {
  const classification = classifier.classify(text);
  return classification === 'relevant';
}

// Function to store relevant data in PostgreSQL
async function storeInDatabase(url, text) {
  const summarizedText = await summarizeText(text); // Summarize before storing
  const query = `
    INSERT INTO incidents (url, text, timestamp)
    VALUES ($1, $2, NOW())
  `;
  try {
    await db.query(query, [url, summarizedText]);
    console.log(`Stored summarized incident from ${url} in database.`);
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

    if (isMeaningfulText(cleanedContent) && classifyText(cleanedContent)) {
      await storeInDatabase(url, cleanedContent);
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
  const query = 'cyber threats incidents site:nciipc.gov.in OR site:gov.in';
  await scrapeLinks(query);
  await generateInsights();
  db.end();
})();
