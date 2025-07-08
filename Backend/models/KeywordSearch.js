const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KeywordSearch = sequelize.define('KeywordSearch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  query: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  platform: {
    type: DataTypes.ENUM('google', 'youtube', 'bing', 'facebook', 'amazon', 'appstore', 'playstore'),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'US'
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'en'
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  prepositions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  hashtags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  generated_hashtags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  all_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  search_type: {
    type: DataTypes.ENUM('keywords', 'questions', 'prepositions', 'hashtags', 'all'),
    allowNull: false,
    defaultValue: 'all'
  },
  response_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Response time in milliseconds'
  },
  status: {
    type: DataTypes.ENUM('success', 'error', 'partial'),
    allowNull: false,
    defaultValue: 'success'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IPv4 or IPv6 address'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_cached: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  cache_hit: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Anonymous like count for this keyword search'
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Anonymous view count for this keyword search'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'keyword_searches',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['query']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['search_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['platform', 'query']
    }
  ],
  hooks: {
    beforeCreate: (search) => {
      if (search.keywords === null) search.keywords = [];
      if (search.questions === null) search.questions = [];
      if (search.prepositions === null) search.prepositions = [];
      if (search.hashtags === null) search.hashtags = [];
      if (search.generated_hashtags === null) search.generated_hashtags = [];
      if (search.all_data === null) search.all_data = {};
      if (search.metadata === null) search.metadata = {};
    },
    beforeUpdate: (search) => {
      if (search.keywords === null) search.keywords = [];
      if (search.questions === null) search.questions = [];
      if (search.prepositions === null) search.prepositions = [];
      if (search.hashtags === null) search.hashtags = [];
      if (search.generated_hashtags === null) search.generated_hashtags = [];
      if (search.all_data === null) search.all_data = {};
      if (search.metadata === null) search.metadata = {};
    }
  }
});

module.exports = KeywordSearch; 