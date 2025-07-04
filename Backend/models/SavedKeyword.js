const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SavedKeyword = sequelize.define('SavedKeyword', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  original_search_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'keyword_searches',
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
    allowNull: false,
    defaultValue: 'google'
  },
  search_type: {
    type: DataTypes.ENUM('keywords', 'questions', 'prepositions', 'hashtags', 'all'),
    allowNull: false,
    defaultValue: 'all'
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
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Geographic location for the search'
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'User-defined tags for organization'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'User-defined category'
  },
  is_favorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this saved keyword is publicly shareable'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  share_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  last_accessed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time user accessed this saved keyword'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'saved_keywords',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'query', 'platform', 'country', 'language']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['search_type']
    },
    {
      fields: ['is_favorite']
    },
    {
      fields: ['category']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'is_favorite']
    },
    {
      fields: ['user_id', 'category']
    }
  ],
  hooks: {
    beforeCreate: (savedKeyword) => {
      if (savedKeyword.keywords === null) savedKeyword.keywords = [];
      if (savedKeyword.questions === null) savedKeyword.questions = [];
      if (savedKeyword.prepositions === null) savedKeyword.prepositions = [];
      if (savedKeyword.hashtags === null) savedKeyword.hashtags = [];
      if (savedKeyword.generated_hashtags === null) savedKeyword.generated_hashtags = [];
      if (savedKeyword.all_data === null) savedKeyword.all_data = {};
      if (savedKeyword.tags === null) savedKeyword.tags = [];
      if (savedKeyword.metadata === null) savedKeyword.metadata = {};
    },
    beforeUpdate: (savedKeyword) => {
      if (savedKeyword.keywords === null) savedKeyword.keywords = [];
      if (savedKeyword.questions === null) savedKeyword.questions = [];
      if (savedKeyword.prepositions === null) savedKeyword.prepositions = [];
      if (savedKeyword.hashtags === null) savedKeyword.hashtags = [];
      if (savedKeyword.generated_hashtags === null) savedKeyword.generated_hashtags = [];
      if (savedKeyword.all_data === null) savedKeyword.all_data = {};
      if (savedKeyword.tags === null) savedKeyword.tags = [];
      if (savedKeyword.metadata === null) savedKeyword.metadata = {};
    }
  }
});

module.exports = SavedKeyword; 