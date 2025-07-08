const { SavedKeyword, KeywordSearch, User } = require('../models');
const { Op } = require('sequelize');

// Helper function to merge arrays and remove duplicates
function mergeArraysWithoutDuplicates(existingArray = [], newArray = []) {
  const existingSet = new Set(existingArray.map(item => item.toLowerCase().trim()));
  const merged = [...existingArray];
  
  for (const item of newArray) {
    const normalizedItem = item.toLowerCase().trim();
    if (!existingSet.has(normalizedItem)) {
      merged.push(item);
      existingSet.add(normalizedItem);
    }
  }
  
  return merged;
}

// Helper function to check and merge saved keyword data
async function checkAndMergeSavedKeywordData(user_id, query, platform, country, language, newData) {
  try {
    // Find existing saved keyword
    const existingSaved = await SavedKeyword.findOne({
      where: {
        user_id,
        query,
        platform,
        country,
        language
      }
    });

    if (existingSaved) {
      console.log(`Found existing saved keyword for ${query}, merging new data`);
      
      // Merge arrays without duplicates
      const mergedKeywords = mergeArraysWithoutDuplicates(existingSaved.keywords, newData.keywords || []);
      const mergedQuestions = mergeArraysWithoutDuplicates(existingSaved.questions, newData.questions || []);
      const mergedPrepositions = mergeArraysWithoutDuplicates(existingSaved.prepositions, newData.prepositions || []);
      const mergedHashtags = mergeArraysWithoutDuplicates(existingSaved.hashtags, newData.hashtags || []);
      const mergedGeneratedHashtags = mergeArraysWithoutDuplicates(existingSaved.generated_hashtags, newData.generated_hashtags || []);
      
      // Calculate new items added
      const newKeywords = (newData.keywords || []).filter(item => 
        !existingSaved.keywords.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newQuestions = (newData.questions || []).filter(item => 
        !existingSaved.questions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newPrepositions = (newData.prepositions || []).filter(item => 
        !existingSaved.prepositions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newHashtags = (newData.hashtags || []).filter(item => 
        !existingSaved.hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newGeneratedHashtags = (newData.generated_hashtags || []).filter(item => 
        !existingSaved.generated_hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      
      // Update the existing record
      await existingSaved.update({
        keywords: mergedKeywords,
        questions: mergedQuestions,
        prepositions: mergedPrepositions,
        hashtags: mergedHashtags,
        generated_hashtags: mergedGeneratedHashtags,
        all_data: {
          ...existingSaved.all_data,
          ...newData,
          last_merged: new Date().toISOString(),
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        },
        last_accessed: new Date(),
        metadata: {
          ...existingSaved.metadata,
          last_merge: new Date().toISOString(),
          total_merges: (existingSaved.metadata?.total_merges || 0) + 1,
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        }
      });
      
      return {
        action: 'merged',
        existingRecord: existingSaved,
        newItemsAdded: {
          keywords: newKeywords,
          questions: newQuestions,
          prepositions: newPrepositions,
          hashtags: newHashtags,
          generated_hashtags: newGeneratedHashtags
        },
        counts: {
          total_keywords: mergedKeywords.length,
          total_questions: mergedQuestions.length,
          total_prepositions: mergedPrepositions.length,
          total_hashtags: mergedHashtags.length,
          total_generated_hashtags: mergedGeneratedHashtags.length,
          new_keywords: newKeywords.length,
          new_questions: newQuestions.length,
          new_prepositions: newPrepositions.length,
          new_hashtags: newHashtags.length,
          new_generated_hashtags: newGeneratedHashtags.length
        }
      };
    } else {
      console.log(`No existing saved keyword found for ${query}, creating new record`);
      return {
        action: 'create_new',
        existingRecord: null,
        newItemsAdded: null,
        counts: null
      };
    }
  } catch (error) {
    console.error('Error checking and merging saved keyword data:', error);
    throw error;
  }
}

const savedKeywordController = {
  // POST /api/saved-keywords/save
  async saveKeyword(req, res) {
    try {
      const {
        query,
        platform = 'google',
        search_type = 'all',
        country = 'US',
        language = 'en',
        location,
        title,
        description,
        tags = [],
        category,
        is_favorite = false,
        is_public = false
      } = req.body;

      // For now, use a default user ID (1) - in production, get from authentication
      const user_id = req.user?.id || 1;

      // Get the latest search data for this query
      const latestSearch = await KeywordSearch.findOne({
        where: {
          query,
          platform,
          country,
          language
        },
        order: [['created_at', 'DESC']]
      });

      // Prepare new data from latest search
      const newData = {
        keywords: latestSearch?.keywords || [],
        questions: latestSearch?.questions || [],
        prepositions: latestSearch?.prepositions || [],
        hashtags: latestSearch?.hashtags || [],
        generated_hashtags: latestSearch?.generated_hashtags || [],
        all_data: latestSearch?.all_data || {}
      };

      // Check for existing saved keyword and merge if found
      const mergeResult = await checkAndMergeSavedKeywordData(
        user_id, 
        query, 
        platform, 
        country, 
        language, 
        newData
      );

      let savedKeyword;
      if (mergeResult.action === 'merged') {
        // Data was merged with existing record
        savedKeyword = mergeResult.existingRecord;
        console.log(`Merged data with existing saved keyword. New items added:`, mergeResult.counts);
      } else {
        // Create new saved keyword
        savedKeyword = await SavedKeyword.create({
          user_id,
          original_search_id: latestSearch?.id,
          query,
          platform,
          search_type,
          country,
          language,
          location,
          title: title || `${query} - ${platform} keywords`,
          description,
          tags,
          category,
          is_favorite,
          is_public,
          keywords: newData.keywords,
          questions: newData.questions,
          prepositions: newData.prepositions,
          hashtags: newData.hashtags,
          generated_hashtags: newData.generated_hashtags,
          all_data: newData.all_data,
          last_accessed: new Date(),
          metadata: {
            saved_from: 'api',
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            total_merges: 0
          }
        });
        console.log(`Created new saved keyword for: ${query}`);
      }

      res.status(201).json({
        success: true,
        message: mergeResult.action === 'merged' ? 'Keyword data merged successfully' : 'Keyword saved successfully',
        data: {
          savedKeyword: {
            id: savedKeyword.id,
            query: savedKeyword.query,
            platform: savedKeyword.platform,
            title: savedKeyword.title,
            location: savedKeyword.location,
            is_favorite: savedKeyword.is_favorite,
            category: savedKeyword.category,
            created_at: savedKeyword.created_at,
            last_updated: savedKeyword.updated_at,
            action: mergeResult.action,
            merge_info: mergeResult.action === 'merged' ? {
              new_items_added: mergeResult.counts,
              total_items: {
                keywords: mergeResult.counts.total_keywords,
                questions: mergeResult.counts.total_questions,
                prepositions: mergeResult.counts.total_prepositions,
                hashtags: mergeResult.counts.total_hashtags,
                generated_hashtags: mergeResult.counts.total_generated_hashtags
              }
            } : null
          }
        }
      });

    } catch (error) {
      console.error('Error saving keyword:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // DELETE /api/saved-keywords/:id/unsave
  async unsaveKeyword(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user?.id || 1;

      const savedKeyword = await SavedKeyword.findOne({
        where: { id, user_id }
      });

      if (!savedKeyword) {
        return res.status(404).json({
          success: false,
          error: 'Saved keyword not found',
          message: 'The saved keyword does not exist or you do not have permission to delete it'
        });
      }

      await savedKeyword.destroy();

      res.json({
        success: true,
        message: 'Keyword unsaved successfully',
        data: {
          unsavedKeyword: {
            id: savedKeyword.id,
            query: savedKeyword.query,
            platform: savedKeyword.platform
          }
        }
      });

    } catch (error) {
      console.error('Error unsaving keyword:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/saved-keywords
  async getSavedKeywords(req, res) {
    try {
      const user_id = req.user?.id || 1;
      const {
        page = 1,
        limit = 20,
        platform,
        category,
        is_favorite,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { user_id };

      // Add filters
      if (platform) whereClause.platform = platform;
      if (category) whereClause.category = category;
      if (is_favorite !== undefined) whereClause.is_favorite = is_favorite === 'true';
      if (search) {
        whereClause[Op.or] = [
          { query: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { tags: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: savedKeywords } = await SavedKeyword.findAndCountAll({
        where: whereClause,
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'query', 'platform', 'search_type', 'country', 'language',
          'location', 'title', 'description', 'tags', 'category',
          'is_favorite', 'is_public', 'view_count', 'share_count',
          'created_at', 'updated_at', 'last_accessed',
          'keywords', 'questions', 'prepositions', 'hashtags', 'generated_hashtags'
        ]
      });

      // Update last_accessed for viewed items
      if (savedKeywords.length > 0) {
        await SavedKeyword.update(
          { last_accessed: new Date() },
          { where: { id: { [Op.in]: savedKeywords.map(sk => sk.id) } } }
        );
      }

      res.json({
        success: true,
        data: {
          savedKeywords,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit),
            has_next: page * limit < count,
            has_prev: page > 1
          },
          filters: {
            platform,
            category,
            is_favorite,
            search
          },
          sort: {
            by: sort_by,
            order: sort_order
          }
        }
      });

    } catch (error) {
      console.error('Error getting saved keywords:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/saved-keywords/:id
  async getSavedKeyword(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user?.id || 1;

      const savedKeyword = await SavedKeyword.findOne({
        where: { id, user_id },
        include: [
          {
            model: KeywordSearch,
            as: 'originalSearch',
            attributes: ['id', 'response_time', 'status', 'created_at']
          }
        ]
      });

      if (!savedKeyword) {
        return res.status(404).json({
          success: false,
          error: 'Saved keyword not found',
          message: 'The saved keyword does not exist or you do not have permission to view it'
        });
      }

      // Update view count and last accessed
      await savedKeyword.update({
        view_count: savedKeyword.view_count + 1,
        last_accessed: new Date()
      });

      res.json({
        success: true,
        data: {
          savedKeyword: {
            ...savedKeyword.toJSON(),
            keywords_count: savedKeyword.keywords?.length || 0,
            questions_count: savedKeyword.questions?.length || 0,
            prepositions_count: savedKeyword.prepositions?.length || 0,
            hashtags_count: savedKeyword.hashtags?.length || 0,
            generated_hashtags_count: savedKeyword.generated_hashtags?.length || 0
          }
        }
      });

    } catch (error) {
      console.error('Error getting saved keyword:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT /api/saved-keywords/:id
  async updateSavedKeyword(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user?.id || 1;
      const {
        title,
        description,
        tags,
        category,
        is_favorite,
        is_public
      } = req.body;

      const savedKeyword = await SavedKeyword.findOne({
        where: { id, user_id }
      });

      if (!savedKeyword) {
        return res.status(404).json({
          success: false,
          error: 'Saved keyword not found',
          message: 'The saved keyword does not exist or you do not have permission to update it'
        });
      }

      // Update fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (category !== undefined) updateData.category = category;
      if (is_favorite !== undefined) updateData.is_favorite = is_favorite;
      if (is_public !== undefined) updateData.is_public = is_public;

      await savedKeyword.update(updateData);

      res.json({
        success: true,
        message: 'Saved keyword updated successfully',
        data: {
          savedKeyword: {
            id: savedKeyword.id,
            query: savedKeyword.query,
            platform: savedKeyword.platform,
            title: savedKeyword.title,
            description: savedKeyword.description,
            tags: savedKeyword.tags,
            category: savedKeyword.category,
            is_favorite: savedKeyword.is_favorite,
            is_public: savedKeyword.is_public,
            last_updated: savedKeyword.updated_at
          }
        }
      });

    } catch (error) {
      console.error('Error updating saved keyword:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/saved-keywords/stats
  async getSavedKeywordsStats(req, res) {
    try {
      const user_id = req.user?.id || 1;

      const stats = await SavedKeyword.findAll({
        where: { user_id },
        attributes: [
          'platform',
          'category',
          'is_favorite',
          [SavedKeyword.sequelize.fn('COUNT', SavedKeyword.sequelize.col('id')), 'count']
        ],
        group: ['platform', 'category', 'is_favorite'],
        raw: true
      });

      // Calculate totals
      const totalSaved = await SavedKeyword.count({ where: { user_id } });
      const totalFavorites = await SavedKeyword.count({ where: { user_id, is_favorite: true } });
      const totalPublic = await SavedKeyword.count({ where: { user_id, is_public: true } });

      // Group by platform
      const platformStats = {};
      const categoryStats = {};

      stats.forEach(stat => {
        // Platform stats
        if (!platformStats[stat.platform]) {
          platformStats[stat.platform] = 0;
        }
        platformStats[stat.platform] += parseInt(stat.count);

        // Category stats
        if (stat.category) {
          if (!categoryStats[stat.category]) {
            categoryStats[stat.category] = 0;
          }
          categoryStats[stat.category] += parseInt(stat.count);
        }
      });

      res.json({
        success: true,
        data: {
          total_saved: totalSaved,
          total_favorites: totalFavorites,
          total_public: totalPublic,
          platform_stats: platformStats,
          category_stats: categoryStats,
          recent_saves: await SavedKeyword.findAll({
            where: { user_id },
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['id', 'query', 'platform', 'title', 'created_at']
          })
        }
      });

    } catch (error) {
      console.error('Error getting saved keywords stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/saved-keywords/:id/toggle-favorite
  async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user?.id || 1;

      const savedKeyword = await SavedKeyword.findOne({
        where: { id, user_id }
      });

      if (!savedKeyword) {
        return res.status(404).json({
          success: false,
          error: 'Saved keyword not found'
        });
      }

      const newFavoriteStatus = !savedKeyword.is_favorite;
      await savedKeyword.update({ is_favorite: newFavoriteStatus });

      res.json({
        success: true,
        message: `Keyword ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
        data: {
          savedKeyword: {
            id: savedKeyword.id,
            query: savedKeyword.query,
            is_favorite: newFavoriteStatus
          }
        }
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/saved-keywords/:id/merge-data
  async mergeData(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user?.id || 1;
      const {
        keywords = [],
        questions = [],
        prepositions = [],
        hashtags = [],
        generated_hashtags = [],
        all_data = {}
      } = req.body;

      const savedKeyword = await SavedKeyword.findOne({
        where: { id, user_id }
      });

      if (!savedKeyword) {
        return res.status(404).json({
          success: false,
          error: 'Saved keyword not found',
          message: 'The saved keyword does not exist or you do not have permission to update it'
        });
      }

      // Prepare new data
      const newData = {
        keywords,
        questions,
        prepositions,
        hashtags,
        generated_hashtags,
        all_data
      };

      // Merge arrays without duplicates
      const mergedKeywords = mergeArraysWithoutDuplicates(savedKeyword.keywords, keywords);
      const mergedQuestions = mergeArraysWithoutDuplicates(savedKeyword.questions, questions);
      const mergedPrepositions = mergeArraysWithoutDuplicates(savedKeyword.prepositions, prepositions);
      const mergedHashtags = mergeArraysWithoutDuplicates(savedKeyword.hashtags, hashtags);
      const mergedGeneratedHashtags = mergeArraysWithoutDuplicates(savedKeyword.generated_hashtags, generated_hashtags);
      
      // Calculate new items added
      const newKeywords = keywords.filter(item => 
        !savedKeyword.keywords.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newQuestions = questions.filter(item => 
        !savedKeyword.questions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newPrepositions = prepositions.filter(item => 
        !savedKeyword.prepositions.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newHashtags = hashtags.filter(item => 
        !savedKeyword.hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      const newGeneratedHashtags = generated_hashtags.filter(item => 
        !savedKeyword.generated_hashtags.some(existing => existing.toLowerCase().trim() === item.toLowerCase().trim())
      );
      
      // Update the saved keyword
      await savedKeyword.update({
        keywords: mergedKeywords,
        questions: mergedQuestions,
        prepositions: mergedPrepositions,
        hashtags: mergedHashtags,
        generated_hashtags: mergedGeneratedHashtags,
        all_data: {
          ...savedKeyword.all_data,
          ...all_data,
          last_merged: new Date().toISOString(),
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        },
        last_accessed: new Date(),
        metadata: {
          ...savedKeyword.metadata,
          last_merge: new Date().toISOString(),
          total_merges: (savedKeyword.metadata?.total_merges || 0) + 1,
          new_items_added: {
            keywords: newKeywords.length,
            questions: newQuestions.length,
            prepositions: newPrepositions.length,
            hashtags: newHashtags.length,
            generated_hashtags: newGeneratedHashtags.length
          }
        }
      });

      res.json({
        success: true,
        message: 'Data merged successfully',
        data: {
          savedKeyword: {
            id: savedKeyword.id,
            query: savedKeyword.query,
            platform: savedKeyword.platform,
            title: savedKeyword.title,
            last_updated: savedKeyword.updated_at,
            merge_info: {
              new_items_added: {
                keywords: newKeywords.length,
                questions: newQuestions.length,
                prepositions: newPrepositions.length,
                hashtags: newHashtags.length,
                generated_hashtags: newGeneratedHashtags.length
              },
              total_items: {
                keywords: mergedKeywords.length,
                questions: mergedQuestions.length,
                prepositions: mergedPrepositions.length,
                hashtags: mergedHashtags.length,
                generated_hashtags: mergedGeneratedHashtags.length
              },
              new_items: {
                keywords: newKeywords,
                questions: newQuestions,
                prepositions: newPrepositions,
                hashtags: newHashtags,
                generated_hashtags: newGeneratedHashtags
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('Error merging data:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = savedKeywordController; 