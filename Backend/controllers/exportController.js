const { KeywordSearch, User } = require('../models');
const { Op, Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const csv = require('csv-writer').createObjectCsvWriter;

class ExportController {
  /**
   * Export KeywordSearch data to CSV
   * GET /api/export/keyword-searches/csv
   */
  async exportKeywordSearchesToCSV(req, res) {
    try {
      const {
        startDate,
        endDate,
        platform,
        searchType,
        status,
        country,
        language,
        userId,
        limit = 10000,
        includeMetadata = false
      } = req.query;

      // Build where clause
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.created_at = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.created_at = {
          [Op.lte]: new Date(endDate)
        };
      }

      if (platform) whereClause.platform = platform;
      if (searchType) whereClause.search_type = searchType;
      if (status) whereClause.status = status;
      if (country) whereClause.country = country;
      if (language) whereClause.language = language;
      if (userId) whereClause.user_id = userId;

      // Fetch data
      const searches = await KeywordSearch.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
      });

      if (searches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data found for the specified criteria'
        });
      }

      // Prepare CSV data
      const csvData = searches.map(search => {
        const baseData = {
          'Search ID': search.id,
          'User ID': search.user_id || 'Anonymous',
          'Username': search.user?.username || 'Anonymous',
          'Email': search.user?.email || 'N/A',
          'Query': search.query,
          'Platform': search.platform,
          'Search Type': search.search_type,
          'Country': search.country || 'N/A',
          'Language': search.language || 'N/A',
          'Status': search.status,
          'Response Time (ms)': search.response_time || 'N/A',
          'Keywords Count': Array.isArray(search.keywords) ? search.keywords.length : 0,
          'Questions Count': Array.isArray(search.questions) ? search.questions.length : 0,
          'Prepositions Count': Array.isArray(search.prepositions) ? search.prepositions.length : 0,
          'Hashtags Count': Array.isArray(search.hashtags) ? search.hashtags.length : 0,
          'Generated Hashtags Count': Array.isArray(search.generated_hashtags) ? search.generated_hashtags.length : 0,
          'Keywords': JSON.stringify(search.keywords),
          'Questions': JSON.stringify(search.questions),
          'Prepositions': JSON.stringify(search.prepositions),
          'Hashtags': JSON.stringify(search.hashtags),
          'Generated Hashtags': JSON.stringify(search.generated_hashtags),
          'All Data': JSON.stringify(search.all_data),
          'IP Address': search.ip_address || 'N/A',
          'User Agent': search.user_agent ? search.user_agent.substring(0, 100) + '...' : 'N/A',
          'Session ID': search.session_id || 'N/A',
          'Is Cached': search.is_cached ? 'Yes' : 'No',
          'Cache Hit': search.cache_hit ? 'Yes' : 'No',
          'Error Message': search.error_message || 'N/A',
          'Created At': search.created_at,
          'Updated At': search.updated_at
        };

        // Add metadata if requested
        if (includeMetadata === 'true' && search.metadata) {
          Object.keys(search.metadata).forEach(key => {
            baseData[`Metadata_${key}`] = JSON.stringify(search.metadata[key]);
          });
        }

        return baseData;
      });

      // Create CSV file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `keyword_searches_${timestamp}.csv`;
      const filepath = path.join(__dirname, '../exports', filename);

      // Ensure exports directory exists
      const exportsDir = path.dirname(filepath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const csvWriter = csv({
        path: filepath,
        header: Object.keys(csvData[0]).map(key => ({
          id: key,
          title: key
        }))
      });

      await csvWriter.writeRecords(csvData);

      // Send file
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }, 5000);
      });

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: error.message
      });
    }
  }

  /**
   * Get export statistics
   * GET /api/export/stats
   */
  async getExportStats(req, res) {
    try {
      const stats = await KeywordSearch.findAll({
        attributes: [
          'platform',
          'search_type',
          'status',
          'country',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('AVG', Sequelize.col('response_time')), 'avg_response_time'],
          [Sequelize.fn('MIN', Sequelize.col('created_at')), 'first_search'],
          [Sequelize.fn('MAX', Sequelize.col('created_at')), 'last_search']
        ],
        group: ['platform', 'search_type', 'status', 'country'],
        order: [['count', 'DESC']]
      });

      // Calculate totals for dashboard
      const totalSearches = await KeywordSearch.count();
      const totalAPI = await KeywordSearch.count({ where: { status: 'success' } });

      res.json({
        success: true,
        data: {
          stats,
          total_searches: totalSearches,
          total_api_calls: totalAPI
        }
      });

    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      });
    }
  }

  /**
   * Export detailed search data (JSON format)
   * GET /api/export/keyword-searches/json
   */
  async exportKeywordSearchesToJSON(req, res) {
    try {
      const {
        startDate,
        endDate,
        platform,
        searchType,
        status,
        country,
        language,
        userId,
        limit = 1000,
        includeFullData = false
      } = req.query;

      // Build where clause (same as CSV export)
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.created_at = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.created_at = {
          [Op.lte]: new Date(endDate)
        };
      }

      if (platform) whereClause.platform = platform;
      if (searchType) whereClause.search_type = searchType;
      if (status) whereClause.status = status;
      if (country) whereClause.country = country;
      if (language) whereClause.language = language;
      if (userId) whereClause.user_id = userId;

      // Fetch data
      const searches = await KeywordSearch.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
      });

      // Prepare response data
      const exportData = searches.map(search => {
        const baseData = {
          id: search.id,
          user_id: search.user_id,
          user: search.user ? {
            username: search.user.username,
            email: search.user.email,
            first_name: search.user.first_name,
            last_name: search.user.last_name
          } : null,
          query: search.query,
          platform: search.platform,
          search_type: search.search_type,
          country: search.country,
          language: search.language,
          status: search.status,
          response_time: search.response_time,
          error_message: search.error_message,
          ip_address: search.ip_address,
          user_agent: search.user_agent,
          session_id: search.session_id,
          is_cached: search.is_cached,
          cache_hit: search.cache_hit,
          created_at: search.created_at,
          updated_at: search.updated_at
        };

        // Include full data arrays if requested
        if (includeFullData === 'true') {
          baseData.keywords = search.keywords;
          baseData.questions = search.questions;
          baseData.prepositions = search.prepositions;
          baseData.hashtags = search.hashtags;
          baseData.generated_hashtags = search.generated_hashtags;
          baseData.all_data = search.all_data;
          baseData.metadata = search.metadata;
        } else {
          // Include counts only
          baseData.keywords_count = Array.isArray(search.keywords) ? search.keywords.length : 0;
          baseData.questions_count = Array.isArray(search.questions) ? search.questions.length : 0;
          baseData.prepositions_count = Array.isArray(search.prepositions) ? search.prepositions.length : 0;
          baseData.hashtags_count = Array.isArray(search.hashtags) ? search.hashtags.length : 0;
          baseData.generated_hashtags_count = Array.isArray(search.generated_hashtags) ? search.generated_hashtags.length : 0;
        }

        return baseData;
      });

      res.json({
        success: true,
        data: exportData,
        total: exportData.length,
        filters: {
          startDate,
          endDate,
          platform,
          searchType,
          status,
          country,
          language,
          userId,
          limit
        }
      });

    } catch (error) {
      console.error('JSON export error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: error.message
      });
    }
  }

  /**
   * Get recent searches for dashboard
   * GET /api/export/recent-searches
   */
  async getRecentSearches(req, res) {
    try {
      const { limit = 10 } = req.query;
      const user_id = req.user?.id || 1;

      const recentSearches = await KeywordSearch.findAll({
        where: { user_id },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        attributes: [
          'id', 'query', 'platform', 'search_type', 'country', 'language',
          'keywords', 'questions', 'prepositions', 'hashtags', 'created_at'
        ]
      });

      // Format the data for frontend
      const formattedSearches = recentSearches.map(search => ({
        id: search.id,
        query: search.query,
        platform: search.platform,
        searchType: search.search_type,
        country: search.country,
        language: search.language,
        keywords: search.keywords || [],
        questions: search.questions || [],
        prepositions: search.prepositions || [],
        hashtags: search.hashtags || [],
        totalResults: (search.keywords?.length || 0) + (search.questions?.length || 0) + 
                     (search.prepositions?.length || 0) + (search.hashtags?.length || 0),
        createdAt: search.created_at
      }));

      res.json({
        success: true,
        data: {
          searches: formattedSearches,
          total: formattedSearches.length
        }
      });

    } catch (error) {
      console.error('Recent searches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent searches',
        error: error.message
      });
    }
  }

  /**
   * Get popular keywords for dashboard
   * GET /api/export/popular-keywords
   */
  async getPopularKeywords(req, res) {
    try {
      const { limit = 10 } = req.query;
      const user_id = req.user?.id || 1;

      // Get keywords from recent searches and count their frequency
      const searches = await KeywordSearch.findAll({
        where: { user_id },
        attributes: ['keywords', 'questions', 'prepositions', 'hashtags'],
        order: [['created_at', 'DESC']],
        limit: 100 // Get more searches to analyze
      });

      // Count keyword frequency
      const keywordCounts = {};
      
      searches.forEach(search => {
        const allKeywords = [
          ...(search.keywords || []),
          ...(search.questions || []),
          ...(search.prepositions || []),
          ...(search.hashtags || [])
        ];

        allKeywords.forEach(keyword => {
          const normalizedKeyword = keyword.toLowerCase().trim();
          if (normalizedKeyword) {
            keywordCounts[normalizedKeyword] = (keywordCounts[normalizedKeyword] || 0) + 1;
          }
        });
      });

      // Sort by frequency and get top keywords
      const popularKeywords = Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, parseInt(limit))
        .map(([keyword, count]) => ({
          keyword,
          count
        }));

      res.json({
        success: true,
        data: {
          keywords: popularKeywords,
          total: popularKeywords.length
        }
      });

    } catch (error) {
      console.error('Popular keywords error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popular keywords',
        error: error.message
      });
    }
  }

  /**
   * Get search history for dashboard
   * GET /api/export/search-history
   */
  async getSearchHistory(req, res) {
    try {
      const { limit = 10, days = 30 } = req.query;
      const user_id = req.user?.id || 1;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const searchHistory = await KeywordSearch.findAll({
        where: {
          user_id,
          created_at: {
            [Op.gte]: startDate
          }
        },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        attributes: [
          'id', 'query', 'platform', 'search_type', 'created_at',
          'keywords', 'questions', 'prepositions', 'hashtags', 'generated_hashtags',
          [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date']
        ]
      });

      // Group by date
      const groupedHistory = {};
      searchHistory.forEach(search => {
        const date = search.getDataValue('date');
        if (!groupedHistory[date]) {
          groupedHistory[date] = [];
        }
        groupedHistory[date].push({
          id: search.id,
          query: search.query,
          platform: search.platform,
          searchType: search.search_type,
          createdAt: search.created_at,
          keywords: search.keywords,
          questions: search.questions,
          prepositions: search.prepositions,
          hashtags: search.hashtags,
          generated_hashtags: search.generated_hashtags
        });
      });

      res.json({
        success: true,
        data: {
          history: groupedHistory,
          total: searchHistory.length
        }
      });

    } catch (error) {
      console.error('Search history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search history',
        error: error.message
      });
    }
  }
}

module.exports = new ExportController(); 