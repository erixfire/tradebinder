/**
 * Script to fetch card images from Scryfall API
 * Run with: node scripts/fetch-card-images.js
 * 
 * This will update all cards in the database with image URLs from Scryfall
 */

const fetch = require('node-fetch');

// Your D1 database ID
const DB_ID = '1d61e5ce-fd5a-4f29-92fb-cf449238baa0';
const SCRYFALL_API = 'https://api.scryfall.com';

// Delay between API calls (Scryfall rate limit: 10 requests per second)
const DELAY_MS = 150;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCardImage(scryfallId) {
  try {
    const response = await fetch(`${SCRYFALL_API}/cards/${scryfallId}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch card ${scryfallId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Get image URL (prefer normal, fallback to small)
    const imageUrl = data.image_uris?.normal || data.image_uris?.small || null;
    
    return imageUrl;
  } catch (error) {
    console.error(`Error fetching card ${scryfallId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🖼️  Fetching card images from Scryfall...');
  console.log('⚠️  Note: This script requires wrangler CLI and access to D1 database');
  console.log('');
  
  // Get all cards without images from D1
  // You'll need to run this with wrangler d1 execute
  console.log('Step 1: Export cards from D1 database');
  console.log('Run this command:');
  console.log('');
  console.log(`  npx wrangler d1 execute tradebinder-db --remote --command="SELECT scryfall_id, name FROM cards WHERE image_url IS NULL OR image_url = '' LIMIT 100"`);
  console.log('');
  console.log('Step 2: For each scryfall_id returned, we\'ll fetch the image');
  console.log('');
  
  // Example: Fetch a single card
  const exampleScryfallId = 'test-123'; // Replace with actual ID
  const imageUrl = await fetchCardImage(exampleScryfallId);
  
  if (imageUrl) {
    console.log(`Found image: ${imageUrl}`);
    console.log('');
    console.log('Step 3: Update the database:');
    console.log('');
    console.log(`  npx wrangler d1 execute tradebinder-db --remote --command="UPDATE cards SET image_url = '${imageUrl}' WHERE scryfall_id = '${exampleScryfallId}'"`);
  }
  
  console.log('');
  console.log('📝 Full automation coming soon!');
  console.log('For now, use the CSV Import with image URLs included.');
}

main().catch(console.error);
