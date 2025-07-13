#!/usr/bin/env node

/**
 * Test script to check API connectivity
 * Run this to test if the production server is accessible
 */

const API_BASE_URL = 'https://keywords.nazaarabox.com';

async function testAPI() {
  console.log('🧪 Testing API connectivity...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed');
      console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
    } else {
      console.log('   ❌ Health check failed');
    }
  } catch (error) {
    console.log(`   ❌ Health check error: ${error.message}`);
  }
  
  console.log('\n2️⃣ Testing Google API...');
  try {
    const googleResponse = await fetch(`${API_BASE_URL}/api/google/all?query=test`);
    console.log(`   Status: ${googleResponse.status} ${googleResponse.statusText}`);
    
    if (googleResponse.ok) {
      const googleData = await googleResponse.json();
      console.log('   ✅ Google API working');
      console.log(`   Keywords found: ${googleData.data?.keywords?.length || 0}`);
    } else {
      const errorText = await googleResponse.text();
      console.log(`   ❌ Google API failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Google API error: ${error.message}`);
  }
  
  console.log('\n3️⃣ Testing Bing API...');
  try {
    const bingResponse = await fetch(`${API_BASE_URL}/api/bing/all?query=test&mkt=en-US`);
    console.log(`   Status: ${bingResponse.status} ${bingResponse.statusText}`);
    
    if (bingResponse.ok) {
      const bingData = await bingResponse.json();
      console.log('   ✅ Bing API working');
      console.log(`   Keywords found: ${bingData.data?.keywords?.length || 0}`);
    } else {
      const errorText = await bingResponse.text();
      console.log(`   ❌ Bing API failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Bing API error: ${error.message}`);
  }
  
  console.log('\n4️⃣ Testing YouTube API...');
  try {
    const youtubeResponse = await fetch(`${API_BASE_URL}/api/youtube/all?query=test`);
    console.log(`   Status: ${youtubeResponse.status} ${youtubeResponse.statusText}`);
    
    if (youtubeResponse.ok) {
      const youtubeData = await youtubeResponse.json();
      console.log('   ✅ YouTube API working');
      console.log(`   Keywords found: ${youtubeData.data?.keywords?.length || 0}`);
    } else {
      const errorText = await youtubeResponse.text();
      console.log(`   ❌ YouTube API failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ YouTube API error: ${error.message}`);
  }
  
  console.log('\n📊 Summary:');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('If all tests pass, the server is working correctly.');
  console.log('If tests fail, check:');
  console.log('  - Server is running');
  console.log('  - Database connection');
  console.log('  - Environment configuration');
  console.log('  - Network connectivity');
}

// Run the test
testAPI().catch(console.error); 