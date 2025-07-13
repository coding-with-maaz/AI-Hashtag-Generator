const { sequelize } = require('../config/database');
const User = require('./User');
const KeywordSearch = require('./KeywordSearch');
const AdMobConfig = require('./AdMobConfig');
const SavedKeyword = require('./SavedKeyword');

// Define associations
User.hasMany(KeywordSearch, {
  foreignKey: 'user_id',
  as: 'searches',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

KeywordSearch.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Only keep the created_by association for AdMobConfig
AdMobConfig.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// SavedKeyword associations
User.hasMany(SavedKeyword, {
  foreignKey: 'user_id',
  as: 'savedKeywords',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

SavedKeyword.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

KeywordSearch.hasMany(SavedKeyword, {
  foreignKey: 'original_search_id',
  as: 'savedVersions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

SavedKeyword.belongsTo(KeywordSearch, {
  foreignKey: 'original_search_id',
  as: 'originalSearch',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  KeywordSearch,
  AdMobConfig,
  SavedKeyword
}; 