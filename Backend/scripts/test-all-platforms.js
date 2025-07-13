const axios = require('axios');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_QUERY = 'javascript';

// Test all platforms
const platforms = [
  { name: 'Google', endpoint: '/api/google/keywords' },
  { name: 'Bing', endpoint: '/api/bing/keywords' },
  { name: 'YouTube', endpoint: '/api/youtube/keywords' },
  { name: 'Play Store', endpoint: '/api/playstore/keywords' },
  { name: 'App Store', endpoint: '/api/appstore/keywords' }
];

async function testPlatform(platform) {
  try {
    console.log(`\n🔍 Testing ${platform.name}...`);
    
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}${platform.endpoint}`, {
      params: { query: TEST_QUERY },
      timeout: 30000 // 30 second timeout
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    const data = response.data;
    
    console.log(`✅ ${platform.name} - SUCCESS`);
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Keywords found: ${data.keywords?.length || data.data?.keywords?.length || 'N/A'}`);
    console.log(`   Questions found: ${data.questions?.length || data.data?.questions?.length || 'N/A'}`);
    console.log(`   Status: ${response.status}`);
    
    return { success: true, platform: platform.name, responseTime, data };
  } catch (error) {
    console.log(`❌ ${platform.name} - FAILED`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Response: ${error.response?.data?.error || error.response?.data?.message || 'N/A'}`);
    
    return { success: false, platform: platform.name, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting platform tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Query: ${TEST_QUERY}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Online Server: ${process.env.ONLINE_SERVER || 'false'}`);
  
  const results = [];
  
  for (const platform of platforms) {
    const result = await testPlatform(platform);
    results.push(result);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${platforms.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.platform}: ${r.responseTime}ms`);
  });
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${platforms.length}`);
    failed.forEach(r => {
      console.log(`   - ${r.platform}: ${r.error}`);
    });
  }
  
  console.log('\n🎯 Environment Configuration:');
  console.log('============================');
  console.log(`Production Mode: ${process.env.NODE_ENV === 'production' ? 'Yes' : 'No'}`);
  console.log(`Online Server: ${process.env.ONLINE_SERVER === 'true' ? 'Yes' : 'No'}`);
  console.log(`Max Alphabet Requests: ${process.env.NODE_ENV === 'production' || process.env.ONLINE_SERVER === 'true' ? '10' : '26'}`);
  console.log(`Max Question Requests: ${process.env.NODE_ENV === 'production' || process.env.ONLINE_SERVER === 'true' ? '10' : '28'}`);
  console.log(`Request Delay: ${process.env.NODE_ENV === 'production' || process.env.ONLINE_SERVER === 'true' ? '200ms' : '100ms'}`);
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      const successRate = results.filter(r => r.success).length / results.length;
      console.log(`\n🏁 Overall Success Rate: ${(successRate * 100).toFixed(1)}%`);
      
      if (successRate === 1) {
        console.log('🎉 All platforms are working correctly!');
        process.exit(0);
      } else {
        console.log('⚠️  Some platforms have issues. Check the logs above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testPlatform }; 