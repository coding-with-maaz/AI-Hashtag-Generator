// Environment-based scraping configuration
const isProduction = process.env.NODE_ENV === 'production';
const isOnlineServer = process.env.ONLINE_SERVER === 'true';

// Configuration based on environment
const SCRAPING_CONFIG = {
  // Production/Online server settings (more conservative)
  production: {
    maxAlphabetRequests: 10, // Reduced from 26
    maxQuestionRequests: 10, // Reduced from 28
    requestDelay: 200, // Increased delay
    timeout: 10000, // Reduced timeout
    maxRetries: 2, // Reduced retries
    enableFallback: true
  },
  // Development settings (full scraping)
  development: {
    maxAlphabetRequests: 26,
    maxQuestionRequests: 28,
    requestDelay: 100,
    timeout: 15000,
    maxRetries: 3,
    enableFallback: true
  }
};

// Get current configuration
const getScrapingConfig = () => {
  if (isProduction || isOnlineServer) {
    return SCRAPING_CONFIG.production;
  }
  return SCRAPING_CONFIG.development;
};

// Helper function to get environment info
const getEnvironmentInfo = () => {
  return {
    isProduction,
    isOnlineServer,
    environment: isProduction ? 'production' : 'development',
    config: getScrapingConfig()
  };
};

module.exports = {
  getScrapingConfig,
  getEnvironmentInfo,
  isProduction,
  isOnlineServer,
  SCRAPING_CONFIG
}; 