// AdMob Configuration for Test and Production Environments

const ADMOB_CONFIG = {
  // Test Environment - Google's official test ad units
  test: {
    appId: 'ca-app-pub-3940256099942544~3347511713', // Test App ID
    adUnits: {
      // App Open Ads
      appOpen: {
        id: 'ca-app-pub-3940256099942544/9257395921',
        name: 'App Open Test',
        description: 'Test app open ad unit'
      },
      
      // Banner Ads
      adaptiveBanner: {
        id: 'ca-app-pub-3940256099942544/9214589741',
        name: 'Adaptive Banner Test',
        description: 'Test adaptive banner ad unit'
      },
      fixedBanner: {
        id: 'ca-app-pub-3940256099942544/6300978111',
        name: 'Fixed Banner Test',
        description: 'Test fixed banner ad unit'
      },
      
      // Interstitial Ads
      interstitial: {
        id: 'ca-app-pub-3940256099942544/1033173712',
        name: 'Interstitial Test',
        description: 'Test interstitial ad unit'
      },
      
      // Rewarded Ads
      rewarded: {
        id: 'ca-app-pub-3940256099942544/5224354917',
        name: 'Rewarded Test',
        description: 'Test rewarded ad unit'
      },
      rewardedInterstitial: {
        id: 'ca-app-pub-3940256099942544/5354046379',
        name: 'Rewarded Interstitial Test',
        description: 'Test rewarded interstitial ad unit'
      },
      
      // Native Ads
      native: {
        id: 'ca-app-pub-3940256099942544/2247696110',
        name: 'Native Test',
        description: 'Test native ad unit'
      },
      nativeVideo: {
        id: 'ca-app-pub-3940256099942544/1044960115',
        name: 'Native Video Test',
        description: 'Test native video ad unit'
      }
    }
  },
  
  // Production Environment - Replace with your actual ad unit IDs
  production: {
    appId: 'YOUR_PRODUCTION_APP_ID_HERE', // Replace with your production App ID
    adUnits: {
      // App Open Ads
      appOpen: {
        id: 'YOUR_APP_OPEN_AD_UNIT_ID',
        name: 'App Open Production',
        description: 'Production app open ad unit'
      },
      
      // Banner Ads
      adaptiveBanner: {
        id: 'YOUR_ADAPTIVE_BANNER_AD_UNIT_ID',
        name: 'Adaptive Banner Production',
        description: 'Production adaptive banner ad unit'
      },
      fixedBanner: {
        id: 'YOUR_FIXED_BANNER_AD_UNIT_ID',
        name: 'Fixed Banner Production',
        description: 'Production fixed banner ad unit'
      },
      
      // Interstitial Ads
      interstitial: {
        id: 'YOUR_INTERSTITIAL_AD_UNIT_ID',
        name: 'Interstitial Production',
        description: 'Production interstitial ad unit'
      },
      
      // Rewarded Ads
      rewarded: {
        id: 'YOUR_REWARDED_AD_UNIT_ID',
        name: 'Rewarded Production',
        description: 'Production rewarded ad unit'
      },
      rewardedInterstitial: {
        id: 'YOUR_REWARDED_INTERSTITIAL_AD_UNIT_ID',
        name: 'Rewarded Interstitial Production',
        description: 'Production rewarded interstitial ad unit'
      },
      
      // Native Ads
      native: {
        id: 'YOUR_NATIVE_AD_UNIT_ID',
        name: 'Native Production',
        description: 'Production native ad unit'
      },
      nativeVideo: {
        id: 'YOUR_NATIVE_VIDEO_AD_UNIT_ID',
        name: 'Native Video Production',
        description: 'Production native video ad unit'
      }
    }
  }
};

// Helper functions
const getAdMobConfig = (environment = 'test') => {
  return ADMOB_CONFIG[environment] || ADMOB_CONFIG.test;
};

const getAdUnitId = (adType, environment = 'test') => {
  const config = getAdMobConfig(environment);
  return config.adUnits[adType]?.id || null;
};

const getAllAdUnits = (environment = 'test') => {
  const config = getAdMobConfig(environment);
  return config.adUnits;
};

const getAppId = (environment = 'test') => {
  const config = getAdMobConfig(environment);
  return config.appId;
};

// Ad type validation
const isValidAdType = (adType) => {
  const validTypes = [
    'appOpen',
    'adaptiveBanner',
    'fixedBanner',
    'interstitial',
    'rewarded',
    'rewardedInterstitial',
    'native',
    'nativeVideo'
  ];
  return validTypes.includes(adType);
};

// Environment validation
const isValidEnvironment = (environment) => {
  return ['test', 'production'].includes(environment);
};

module.exports = {
  ADMOB_CONFIG,
  getAdMobConfig,
  getAdUnitId,
  getAllAdUnits,
  getAppId,
  isValidAdType,
  isValidEnvironment
}; 