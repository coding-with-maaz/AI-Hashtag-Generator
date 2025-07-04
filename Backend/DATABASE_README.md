# Database Setup for AI Hashtag Generator

This document provides comprehensive information about the MySQL database setup using Sequelize ORM for the AI Hashtag Generator backend.

## 🗄️ Database Overview

The application uses **MySQL** with **Sequelize ORM** for data persistence, featuring three main models:

### 📊 Database Models

#### 1. **Users** Table
- **Purpose**: User management and authentication
- **Key Features**: 
  - Comprehensive user profiles
  - API usage tracking
  - Premium user management
  - Email verification system

#### 2. **KeywordSearches** Table
- **Purpose**: Store search history and results
- **Key Features**:
  - Multi-platform search tracking
  - Country and language-specific results
  - Performance metrics
  - Caching information

#### 3. **AdMobConfigs** Table
- **Purpose**: AdMob configuration management
- **Key Features**:
  - Environment-specific configurations
  - Usage statistics tracking
  - Performance metrics
  - Multi-platform support

## 🚀 Quick Setup

### 1. **Install Dependencies**
```bash
cd backend
npm install
```

### 2. **Configure Environment**
```bash
# Copy example environment file
cp env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_hashtag_generator
```

### 3. **Create Database**
```sql
CREATE DATABASE ai_hashtag_generator;
CREATE DATABASE ai_hashtag_generator_test;
```

### 4. **Initialize Database**
```bash
# Initialize database with tables and seed data
npm run db:init

# Or run individual commands:
npm run db:sync    # Sync models only
npm run db:seed    # Seed data only
```

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
  country VARCHAR(100),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  login_count INT DEFAULT 0,
  preferences JSON,
  api_usage_count INT DEFAULT 0,
  api_limit INT DEFAULT 1000,
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  email_verification_token VARCHAR(255),
  email_verification_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### KeywordSearches Table
```sql
CREATE TABLE keyword_searches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  query VARCHAR(255) NOT NULL,
  platform ENUM('google', 'youtube', 'bing', 'facebook', 'amazon', 'appstore', 'playstore') NOT NULL,
  country VARCHAR(10) DEFAULT 'US',
  language VARCHAR(10) DEFAULT 'en',
  keywords JSON,
  questions JSON,
  prepositions JSON,
  hashtags JSON,
  generated_hashtags JSON,
  all_data JSON,
  search_type ENUM('keywords', 'questions', 'prepositions', 'hashtags', 'all') DEFAULT 'all',
  response_time INT,
  status ENUM('success', 'error', 'partial') DEFAULT 'success',
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  is_cached BOOLEAN DEFAULT FALSE,
  cache_hit BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### AdMobConfigs Table
```sql
CREATE TABLE admob_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  environment ENUM('test', 'production', 'staging') DEFAULT 'test',
  app_id VARCHAR(255) NOT NULL,
  ad_type ENUM('appOpen', 'adaptiveBanner', 'fixedBanner', 'interstitial', 'rewarded', 'rewardedInterstitial', 'native', 'nativeVideo') NOT NULL,
  ad_unit_id VARCHAR(255) NOT NULL,
  ad_unit_name VARCHAR(100),
  ad_unit_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_test BOOLEAN DEFAULT TRUE,
  platform ENUM('android', 'ios', 'web', 'unity', 'flutter'),
  version VARCHAR(20) DEFAULT '1.0.0',
  config_data JSON,
  usage_stats JSON,
  performance_metrics JSON,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  notes TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_env_ad_user (environment, ad_type, user_id)
);
```

## 🔧 Available Scripts

### Database Management
```bash
# Initialize database (creates tables and seeds data)
npm run db:init

# Sync models with database (creates/updates tables)
npm run db:sync

# Reset database (drops and recreates all tables)
npm run db:reset

# Seed default data
npm run db:seed
```

### Development
```bash
# Start development server with database
npm run dev

# Start production server
npm start
```

## 📊 Data Types Used

### Sequelize DataTypes
- **INTEGER**: Primary keys, counts, limits
- **STRING(n)**: Usernames, emails, names, tokens
- **TEXT**: Long text content (bio, descriptions)
- **DATE**: Date only values
- **DATETIME**: Timestamp values
- **BOOLEAN**: True/false flags
- **ENUM**: Predefined value sets
- **JSON**: Complex data structures
- **DECIMAL**: Precise numeric values (if needed)

### Validation Rules
- **Email validation**: Proper email format
- **Length constraints**: String length limits
- **Regex patterns**: Username, phone validation
- **Date validation**: Past dates for birth dates
- **URL validation**: Avatar and external links

## 🔍 Indexes and Performance

### Primary Indexes
- All primary keys (id fields)
- Unique constraints (email, username)
- Foreign keys (user_id references)

### Performance Indexes
- **Users**: email, username, is_active, created_at
- **KeywordSearches**: user_id, query, platform, country, language, search_type, status, created_at
- **AdMobConfigs**: user_id, environment, ad_type, is_active, is_test, platform, created_at

### Composite Indexes
- `(user_id, created_at)` for user search history
- `(platform, query)` for search optimization
- `(environment, ad_type, user_id)` for unique AdMob configs

## 🛡️ Security Features

### Data Protection
- **Password hashing**: Bcrypt with configurable rounds
- **Token expiration**: Time-limited reset tokens
- **Input validation**: Comprehensive field validation
- **SQL injection protection**: Sequelize parameterized queries

### Access Control
- **User verification**: Email verification system
- **Premium features**: User tier management
- **API limits**: Usage tracking and rate limiting
- **Session management**: Secure session handling

## 📈 Monitoring and Analytics

### Usage Tracking
- **API usage count**: Per-user request tracking
- **Login statistics**: Login count and last login
- **Search analytics**: Platform, query, and performance metrics
- **AdMob performance**: Impressions, clicks, revenue tracking

### Performance Metrics
- **Response times**: API performance monitoring
- **Cache hit rates**: Caching effectiveness
- **Error tracking**: Failed requests and error messages
- **Database performance**: Query optimization insights

## 🔄 Database Migrations

### Automatic Migrations
The application uses Sequelize's `sync()` method for automatic schema management:

```javascript
// Development: Alter tables safely
await sequelize.sync({ force: false, alter: true });

// Production: No automatic changes
await sequelize.sync({ force: false, alter: false });
```

### Manual Migrations
For production environments, use Sequelize CLI:

```bash
# Generate migration
npx sequelize-cli migration:generate --name add_new_field

# Run migrations
npx sequelize-cli db:migrate

# Undo migrations
npx sequelize-cli db:migrate:undo
```

## 🧪 Testing

### Test Database
```bash
# Use separate test database
DB_NAME_TEST=ai_hashtag_generator_test

# Reset test database
npm run db:reset
```

### Sample Queries
```javascript
// Find user with searches
const user = await User.findOne({
  include: [{
    model: KeywordSearch,
    as: 'searches',
    where: { platform: 'google' }
  }]
});

// Get search statistics
const stats = await KeywordSearch.findAll({
  attributes: [
    'platform',
    [sequelize.fn('COUNT', sequelize.col('id')), 'total_searches'],
    [sequelize.fn('AVG', sequelize.col('response_time')), 'avg_response_time']
  ],
  group: ['platform']
});
```

## 🚨 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check MySQL service
sudo service mysql status

# Verify credentials
mysql -u root -p

# Test connection
npm run db:init
```

#### Permission Errors
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON ai_hashtag_generator.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

#### Character Set Issues
```sql
-- Set proper character set
ALTER DATABASE ai_hashtag_generator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Performance Optimization
```sql
-- Analyze table performance
ANALYZE TABLE users, keyword_searches, admob_configs;

-- Check index usage
SHOW INDEX FROM users;
SHOW INDEX FROM keyword_searches;
SHOW INDEX FROM admob_configs;
```

## 📚 Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js MySQL2](https://github.com/sidorares/node-mysql2)
- [Database Design Best Practices](https://www.mysql.com/why-mysql/white-papers/)

## 🤝 Contributing

1. **Database Changes**: Always create migrations for schema changes
2. **Data Types**: Use appropriate Sequelize DataTypes
3. **Indexes**: Add indexes for frequently queried fields
4. **Validation**: Implement comprehensive field validation
5. **Testing**: Test with both development and test databases 