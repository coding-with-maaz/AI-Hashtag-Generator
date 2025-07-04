# AdMob Integration for AI Hashtag Generator

This module provides a comprehensive AdMob management system for both test and production environments, supporting all major ad formats including App Open, Banner, Interstitial, Rewarded, and Native ads.

## 🚀 Features

- **Complete AdMob Configuration**: Test and production environments
- **All Ad Types Support**: App Open, Adaptive Banner, Fixed Banner, Interstitial, Rewarded, Rewarded Interstitial, Native, and Native Video
- **Environment Management**: Easy switching between test and production
- **Validation System**: Built-in configuration validation
- **RESTful API**: Clean endpoints for ad unit management
- **Google's Official Test IDs**: Pre-configured with Google's test ad unit IDs

## 📋 Supported Ad Types

| Ad Type | Test ID | Description |
|---------|---------|-------------|
| App Open | `ca-app-pub-3940256099942544/9257395921` | App launch ads |
| Adaptive Banner | `ca-app-pub-3940256099942544/9214589741` | Responsive banner ads |
| Fixed Banner | `ca-app-pub-3940256099942544/6300978111` | Standard banner ads |
| Interstitial | `ca-app-pub-3940256099942544/1033173712` | Full-screen ads |
| Rewarded | `ca-app-pub-3940256099942544/5224354917` | Video reward ads |
| Rewarded Interstitial | `ca-app-pub-3940256099942544/5354046379` | Hybrid reward ads |
| Native | `ca-app-pub-3940256099942544/2247696110` | Custom native ads |
| Native Video | `ca-app-pub-3940256099942544/1044960115` | Video native ads |

## 🔧 Configuration

### Test Environment
The test environment is pre-configured with Google's official test ad unit IDs. No additional setup required.

### Production Environment
To configure production ad units:

1. **Update App ID**: Replace `YOUR_PRODUCTION_APP_ID_HERE` in `config/admob.js`
2. **Update Ad Unit IDs**: Replace placeholder IDs with your actual production ad unit IDs
3. **Validate Configuration**: Use the validation endpoint to check your setup

## 📡 API Endpoints

### Configuration Endpoints

#### Get Complete Configuration
```http
GET /api/admob/config?environment=test
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "test",
    "appId": "ca-app-pub-3940256099942544~3347511713",
    "adUnits": {
      "appOpen": {
        "id": "ca-app-pub-3940256099942544/9257395921",
        "name": "App Open Test",
        "description": "Test app open ad unit"
      },
      // ... other ad units
    },
    "metadata": {
      "totalAdUnits": 8,
      "adTypes": ["appOpen", "adaptiveBanner", "fixedBanner", "interstitial", "rewarded", "rewardedInterstitial", "native", "nativeVideo"],
      "retrievedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get App ID
```http
GET /api/admob/app-id?environment=test
```

#### Get All Ad Units
```http
GET /api/admob/ad-units?environment=test
```

### Specific Ad Unit Endpoints

#### Get Specific Ad Unit
```http
GET /api/admob/ad-units/interstitial?environment=test
```

#### Get Ad Unit ID Only
```http
GET /api/admob/ad-units/interstitial/id?environment=test
```

### Quick Access Endpoints

#### Get All Test IDs
```http
GET /api/admob/test-ids
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "test",
    "appId": "ca-app-pub-3940256099942544~3347511713",
    "adUnitIds": {
      "appOpen": "ca-app-pub-3940256099942544/9257395921",
      "adaptiveBanner": "ca-app-pub-3940256099942544/9214589741",
      "fixedBanner": "ca-app-pub-3940256099942544/6300978111",
      "interstitial": "ca-app-pub-3940256099942544/1033173712",
      "rewarded": "ca-app-pub-3940256099942544/5224354917",
      "rewardedInterstitial": "ca-app-pub-3940256099942544/5354046379",
      "native": "ca-app-pub-3940256099942544/2247696110",
      "nativeVideo": "ca-app-pub-3940256099942544/1044960115"
    },
    "metadata": {
      "totalAdUnits": 8,
      "adTypes": ["appOpen", "adaptiveBanner", "fixedBanner", "interstitial", "rewarded", "rewardedInterstitial", "native", "nativeVideo"],
      "retrievedAt": "2024-01-01T00:00:00.000Z",
      "note": "These are Google's official test ad unit IDs"
    }
  }
}
```

#### Get All Production IDs
```http
GET /api/admob/production-ids
```

#### Validate Configuration
```http
GET /api/admob/validate?environment=production
```

**Response:**
```json
{
  "success": true,
  "data": {
    "environment": "production",
    "isValid": false,
    "issues": [
      "App ID is missing or not configured"
    ],
    "warnings": [
      "Ad unit \"appOpen\" uses placeholder ID: YOUR_APP_OPEN_AD_UNIT_ID"
    ],
    "summary": {
      "appOpen": {
        "adType": "appOpen",
        "hasId": true,
        "isPlaceholder": true,
        "id": "YOUR_APP_OPEN_AD_UNIT_ID"
      }
    },
    "metadata": {
      "totalAdUnits": 8,
      "validAdUnits": 0,
      "placeholderAdUnits": 8,
      "missingAdUnits": 0,
      "validatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🛠️ Usage Examples

### Frontend Integration (JavaScript)

```javascript
// Get test ad unit ID for interstitial
const response = await fetch('/api/admob/ad-units/interstitial/id?environment=test');
const data = await response.json();
const adUnitId = data.data.adUnitId;

// Get all test IDs for development
const testResponse = await fetch('/api/admob/test-ids');
const testData = await testResponse.json();
const testIds = testData.data.adUnitIds;

// Validate production configuration
const validationResponse = await fetch('/api/admob/validate?environment=production');
const validationData = await validationResponse.json();
console.log('Configuration valid:', validationData.data.isValid);
```

### React Native Integration

```javascript
import { AdMobInterstitial } from 'react-native-google-mobile-ads';

// Get ad unit ID from API
const getAdUnitId = async (adType, environment = 'test') => {
  const response = await fetch(`/api/admob/ad-units/${adType}/id?environment=${environment}`);
  const data = await response.json();
  return data.data.adUnitId;
};

// Load and show interstitial
const showInterstitial = async () => {
  const adUnitId = await getAdUnitId('interstitial', 'test');
  
  await AdMobInterstitial.setAdUnitID(adUnitId);
  await AdMobInterstitial.requestAd();
  await AdMobInterstitial.showAd();
};
```

### Flutter Integration

```dart
import 'package:google_mobile_ads/google_mobile_ads.dart';

// Get ad unit ID from API
Future<String> getAdUnitId(String adType, {String environment = 'test'}) async {
  final response = await http.get(
    Uri.parse('/api/admob/ad-units/$adType/id?environment=$environment')
  );
  final data = jsonDecode(response.body);
  return data['data']['adUnitId'];
}

// Load and show interstitial
Future<void> showInterstitial() async {
  final adUnitId = await getAdUnitId('interstitial', environment: 'test');
  
  await InterstitialAd.load(
    adUnitId: adUnitId,
    request: AdRequest(),
    adLoadCallback: InterstitialAdLoadCallback(
      onAdLoaded: (InterstitialAd ad) {
        ad.show();
      },
      onAdFailedToLoad: (LoadAdError error) {
        print('Interstitial ad failed to load: $error');
      },
    ),
  );
}
```

## 🔍 Environment Variables

You can set the default environment using environment variables:

```bash
# Set default environment
export ADMOB_DEFAULT_ENVIRONMENT=production

# Set custom configuration path
export ADMOB_CONFIG_PATH=./custom-admob-config.js
```

## 🧪 Testing

### Test the API Endpoints

```bash
# Test configuration endpoint
curl "http://localhost:3000/api/admob/config?environment=test"

# Test specific ad unit
curl "http://localhost:3000/api/admob/ad-units/interstitial?environment=test"

# Test validation
curl "http://localhost:3000/api/admob/validate?environment=production"

# Get all test IDs
curl "http://localhost:3000/api/admob/test-ids"
```

### Validation Checklist

- [ ] App ID is configured
- [ ] All ad unit IDs are set (not placeholders)
- [ ] Environment parameter is valid
- [ ] Ad type parameter is valid
- [ ] API responses include proper metadata

## 🔧 Customization

### Adding Custom Ad Types

1. Update `config/admob.js`:
```javascript
// Add to validTypes array
const validTypes = [
  'appOpen',
  'adaptiveBanner',
  'fixedBanner',
  'interstitial',
  'rewarded',
  'rewardedInterstitial',
  'native',
  'nativeVideo',
  'customAdType' // Add your custom type
];

// Add to configuration
adUnits: {
  // ... existing ad units
  customAdType: {
    id: 'YOUR_CUSTOM_AD_UNIT_ID',
    name: 'Custom Ad Type',
    description: 'Custom ad unit description'
  }
}
```

2. Update validation middleware in `routes/admobRoutes.js`

### Environment-Specific Configuration

You can add more environments by extending the configuration:

```javascript
const ADMOB_CONFIG = {
  test: { /* test config */ },
  production: { /* production config */ },
  staging: { /* staging config */ },
  development: { /* development config */ }
};
```

## 📚 Additional Resources

- [Google AdMob Documentation](https://developers.google.com/admob)
- [Test Ad Unit IDs](https://developers.google.com/admob/android/test-ads)
- [AdMob Best Practices](https://developers.google.com/admob/android/best-practices)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 