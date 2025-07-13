export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image: string | null;
  created_at: string;
}

export interface KeywordSearch {
  id: string;
  user_id: string;
  query: string;
  platform: string;
  search_type: string;
  search_params: {
    language: string;
    country: string;
    location: string;
  };
  created_at: string;
  results_count: {
    keywords: number;
    hashtags: number;
    questions: number;
    prepositions: number;
  };
}

export interface SavedKeyword {
  id: string;
  user_id: string;
  query: string;
  platform: string;
  search_type: string;
  created_at: string;
  is_favorite: boolean;
  title?: string;
}

export interface AdMobAdConfig {
  enabled: boolean;
  adUnitId: string;
  position?: string;
  refreshInterval?: number;
  adaptive?: boolean;
  smartBanner?: boolean;
  minInterval?: number;
  showOnJobView?: boolean;
  showOnCompanyView?: boolean;
  showOnCategoryView?: boolean;
  showOnSearch?: boolean;
  showOnProfile?: boolean;
  rewardType?: string;
  rewardAmount?: number;
  showOnJobApply?: boolean;
  style?: string;
  layout?: string;
  showInFeed?: boolean;
  showInDetail?: boolean;
  showOnResume?: boolean;
  maxShowsPerDay?: number;
  showOnAppStart?: boolean;
  showOnAppReturn?: boolean;
  cooldownPeriod?: number;
  showDelay?: number;
  skipAfter?: number;
  showOnFirstLaunch?: boolean;
  showOnAppUpdate?: boolean;
  customConfig?: Record<string, any>;
  targeting?: Record<string, any>;
  keywords?: string[];
}

export interface AdMobGlobalConfig {
  testMode: boolean;
  debugMode: boolean;
  ageRestriction: number;
  cooldownPeriod: number;
  maxAdsPerSession: number;
  userConsentRequired: boolean;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  maxAdRequestsPerMinute: number;
  adLoadTimeout: number;
}

export interface AdMobEnvironmentConfig {
  id?: number;
  environment: 'test' | 'production' | 'staging';
  banner: AdMobAdConfig;
  interstitial: AdMobAdConfig;
  rewarded: AdMobAdConfig;
  native: AdMobAdConfig;
  appOpen: AdMobAdConfig;
  splash: AdMobAdConfig;
  custom: AdMobAdConfig;
  globalConfig: AdMobGlobalConfig;
  rewardedInterstitial: AdMobAdConfig;
  created_by?: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AdMobConfig {
  test: AdMobEnvironmentConfig;
  production: AdMobEnvironmentConfig;
  staging?: AdMobEnvironmentConfig;
}

export interface LegacyAdMobConfig {
  app_id: string;
  app_open_id: string;
  adaptive_banner_id: string;
  fixed_banner_id: string;
  interstitial_id: string;
  rewarded_id: string;
  rewarded_interstitial_id: string;
  native_id: string;
  native_video_id: string;
  is_active: boolean;
}

export interface SearchResponseData {
  keywords: string[];
  hashtags: string[];
  questions: string[];
  prepositions: string[];
  generatedHashtags?: string[];
  likes?: number;
}

export interface SearchResponseMetadata {
  query: string;
  platform: string;
  search_type: string;
  timestamp: string;
  language?: string;
  country?: string;
}

export interface SearchResponse {
  data: SearchResponseData;
  metadata: SearchResponseMetadata;
  likes?: number;
}

export interface TrendingKeyword {
  id: number | string;
  query: string;
  platform: string;
  search_type: string;
  created_at: string;
  likes: number;
  views?: number;
  title?: string;
}