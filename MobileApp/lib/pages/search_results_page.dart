import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/search_response.dart';
import '../widgets/results_filter_tabs.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class SearchResultsPage extends StatefulWidget {
  final SearchResponse? initialResults;
  final String? initialQuery;
  final String? initialPlatform;

  const SearchResultsPage({
    super.key,
    this.initialResults,
    this.initialQuery,
    this.initialPlatform,
  });

  @override
  State<SearchResultsPage> createState() => _SearchResultsPageState();
}

class _SearchResultsPageState extends State<SearchResultsPage> with TickerProviderStateMixin {
  SearchResponse? searchResults;
  bool searchLoading = false;
  String? error;
  String currentQuery = '';
  String currentPlatform = 'google';
  String selectedFilter = 'Keywords'; // Default selected filter
  Set<String> selectedItems = <String>{};
  bool isSelectionMode = false;
  
  // Like and views state
  int likeCount = 0;
  bool likeLoading = false;
  int viewCount = 0;
  
  // Animation controllers for sticky like button
  AnimationController? _likeButtonController;
  AnimationController? _pulseController;
  AnimationController? _scaleController;
  Animation<double>? _pulseAnimation;
  Animation<double>? _scaleAnimation;

  // App Color Constants
  static const Color primaryPink = Color(0xFFFCEEEE);
  static const Color backgroundPink = Color(0xFFFFF7F4);
  static const Color lightPink = Color(0xFFFEF2F2);
  static const Color darkText = Color(0xFF1A1A1A);
  static const Color mediumText = Color(0xFF3C3C43);
  static const Color lightText = Color(0xFF666666);
  static const Color mutedText = Color(0xFF999999);
  static const Color borderColor = Color(0xFFE5E5E5);
  static const Color white = Color(0xFFFFFFFF);

  // Platform endpoints mapping
  static const Map<String, String> platformEndpoints = {
    'google': '/api/google/all',
    'youtube': '/api/youtube/all',
    'bing': '/api/bing/all',
    'playstore': '/api/playstore/all',
    'appstore': '/api/appstore/all',
  };

  @override
  void initState() {
    super.initState();
    
    // Initialize animation controllers
    _likeButtonController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController!,
      curve: Curves.easeInOut,
    ));
    
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.9,
    ).animate(CurvedAnimation(
      parent: _scaleController!,
      curve: Curves.easeInOut,
    ));
    
    // Start pulse animation if there are likes
    if (widget.initialResults?.data.likes != null && widget.initialResults!.data.likes! > 0) {
      _pulseController?.repeat(reverse: true);
    }
    
    // Initialize with passed results or defaults
    if (widget.initialResults != null) {
      searchResults = widget.initialResults;
      likeCount = widget.initialResults!.data.likes ?? 0;
      viewCount = widget.initialResults!.data.views ?? 0;
      
      // Track view when results are loaded
      _trackView(searchResults!.data.query, currentPlatform);
    }
    if (widget.initialQuery != null) {
      currentQuery = widget.initialQuery!;
    }
    if (widget.initialPlatform != null) {
      currentPlatform = widget.initialPlatform!;
    }
  }
  
  @override
  void dispose() {
    _likeButtonController?.dispose();
    _pulseController?.dispose();
    _scaleController?.dispose();
    super.dispose();
  }

  Map<String, int> get _sectionCounts {
    if (searchResults == null) return {};
    
    return {
      'Keywords': searchResults!.data.keywords.length,
      'Hashtags': searchResults!.data.generatedHashtags.length, // Count generated hashtags instead of regular hashtags
      'Questions': searchResults!.data.questions.length,
      'Prepositions': searchResults!.data.prepositions.length,
    };
  }

  void _onFilterChanged(String filter) {
    setState(() {
      selectedFilter = filter;
    });
  }

  List<String> _getFilteredItems() {
    if (searchResults == null) return [];
    
    switch (selectedFilter) {
      case 'Keywords':
        return searchResults!.data.keywords;
      case 'Hashtags':
        return searchResults!.data.generatedHashtags; // Show generated hashtags instead of regular hashtags
      case 'Questions':
        return searchResults!.data.questions;
      case 'Prepositions':
        return searchResults!.data.prepositions;
      default:
        return searchResults!.data.keywords;
    }
  }

  IconData _getFilterIcon() {
    switch (selectedFilter) {
      case 'Keywords':
        return Icons.key;
      case 'Hashtags':
        return Icons.tag;
      case 'Questions':
        return Icons.question_mark;
      case 'Prepositions':
        return Icons.link;
      default:
        return Icons.list;
    }
  }

  Color _getFilterColor() {
    switch (selectedFilter) {
      case 'Keywords':
        return Colors.blue;
      case 'Hashtags':
        return Colors.purple;
      case 'Questions':
        return Colors.orange;
      case 'Prepositions':
        return Colors.green;
      default:
        return primaryPink;
    }
  }

  Future<void> handleSearch({
    required String platform,
    required String query,
    String? language,
    String? country,
  }) async {
    setState(() {
      searchLoading = true;
      error = null;
      searchResults = null;
      currentQuery = query;
      currentPlatform = platform;
    });

    try {
      final endpoint = platformEndpoints[platform];
      if (endpoint == null) {
        throw Exception("Unsupported platform");
      }

      // Build query parameters
      final queryParams = <String, String>{
        'query': query,
      };

      if (platform == 'bing') {
        final mkt = '${language ?? 'en'}-${(country ?? 'us').toUpperCase()}';
        queryParams['mkt'] = mkt;
      } else {
        if (language != null) queryParams['language'] = language;
        if (country != null) queryParams['country'] = country;
      }

      // Make API request
      final uri = Uri.http('keywords.nazaarabox.com', endpoint, queryParams);
      final response = await http.get(uri);

      if (response.statusCode != 200) {
        throw Exception('API error: ${response.statusCode}');
      }

      final data = json.decode(response.body);
      
      if (data['success'] != true) {
        throw Exception(data['message'] ?? 'API returned error');
      }

      // Transform response to SearchResponse format
      final transformedResponse = SearchResponse(
        data: SearchData(
          query: data['data']['query'] ?? query,
          keywords: List<String>.from(data['data']['keywords'] ?? []),
          hashtags: List<String>.from(data['data']['hashtags'] ?? []),
          questions: List<String>.from(data['data']['questions'] ?? []),
          prepositions: List<String>.from(data['data']['prepositions'] ?? []),
          generatedHashtags: List<String>.from(data['data']['generatedHashtags'] ?? []),
          likes: data['data']['likes'] ?? 0,
          views: data['data']['views'] ?? 0,
        ),
        metadata: SearchMetadata(
          query: query,
          platform: platform,
          searchType: 'all',
          timestamp: DateTime.now().toIso8601String(),
          language: language ?? 'en',
          country: country ?? 'us',
        ),
      );

      setState(() {
        searchResults = transformedResponse;
        likeCount = transformedResponse.data.likes ?? 0;
        viewCount = transformedResponse.data.views ?? 0;
      });

      // Track view for this keyword search
      await _trackView(query, platform);

    } catch (e) {
      setState(() {
        error = e.toString();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Search failed: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    } finally {
      setState(() {
        searchLoading = false;
      });
    }
  }

  Future<void> _trackView(String query, String platform) async {
    try {
      final uri = Uri.http('keywords.nazaarabox.com', '/api/view');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'query': query,
          'platform': platform,
        }),
      );
      print('✅ View tracked for $platform: $query');
      
      // Update view count if successful
      if (response.statusCode == 200) {
        setState(() {
          viewCount++;
        });
      }
    } catch (e) {
      print('Failed to track view: $e');
    }
  }

  void handleSaveResults() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Search results saved successfully!'),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  // Share functionality
  void _shareResults() async {
    if (searchResults == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No results to share.'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    try {
      // Create share text
      String shareText = _createShareText();
      
      // Share the results
      await Share.share(
        shareText,
        subject: 'Keyword Search Results - ${searchResults!.data.query}',
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Results shared successfully!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to share: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }

  // Create share text with all results
  String _createShareText() {
    if (searchResults == null) return '';
    
    StringBuffer buffer = StringBuffer();
    buffer.writeln('🔍 Keyword Search Results');
    buffer.writeln('Query: ${searchResults!.data.query}');
    buffer.writeln('Platform: ${currentPlatform.toUpperCase()}');
    buffer.writeln('Date: ${DateTime.now().toString().split('.')[0]}');
    buffer.writeln('');
    
    // Add keywords
    if (searchResults!.data.keywords.isNotEmpty) {
      buffer.writeln('📝 Keywords:');
      for (String keyword in searchResults!.data.keywords) {
        buffer.writeln('• $keyword');
      }
      buffer.writeln('');
    }
    
    // Add hashtags
    if (searchResults!.data.generatedHashtags.isNotEmpty) {
      buffer.writeln('🏷️ Hashtags:');
      for (String hashtag in searchResults!.data.generatedHashtags) {
        buffer.writeln('• $hashtag');
      }
      buffer.writeln('');
    }
    
    // Add questions
    if (searchResults!.data.questions.isNotEmpty) {
      buffer.writeln('❓ Questions:');
      for (String question in searchResults!.data.questions) {
        buffer.writeln('• $question');
      }
      buffer.writeln('');
    }
    
    // Add prepositions
    if (searchResults!.data.prepositions.isNotEmpty) {
      buffer.writeln('🔗 Prepositions:');
      for (String preposition in searchResults!.data.prepositions) {
        buffer.writeln('• $preposition');
      }
      buffer.writeln('');
    }
    
    buffer.writeln('Generated by AI Hashtag Generator');
    
    return buffer.toString();
  }

  // Save results to file
  void _saveResultsToFile() async {
    if (searchResults == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No results to save.'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    try {
      // Get documents directory
      Directory? documentsDirectory;
      if (Platform.isAndroid || Platform.isIOS) {
        documentsDirectory = await getApplicationDocumentsDirectory();
      } else {
        documentsDirectory = await getDownloadsDirectory();
      }
      
      if (documentsDirectory == null) {
        throw Exception('Could not access documents directory');
      }

      // Create filename with timestamp
      String timestamp = DateTime.now().millisecondsSinceEpoch.toString();
      String filename = 'keyword_results_${searchResults!.data.query}_$timestamp.txt';
      File file = File('${documentsDirectory.path}/$filename');

      // Create file content
      String fileContent = _createShareText();
      
      // Write to file
      await file.writeAsString(fileContent);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Results saved to: ${file.path}'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }

  // Like functionality
  void _handleLike() async {
    print('🔍 DEBUG: _handleLike() called');
    
    if (searchResults == null) {
      print('❌ DEBUG: searchResults is null');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No results to like.'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    print('✅ DEBUG: searchResults exists, setting likeLoading to true');
    setState(() {
      likeLoading = true;
    });

    try {
      // Extract metadata from search results
      String query = searchResults!.data.query;
      String platform = currentPlatform;
      
      print('🔍 DEBUG: Query: $query, Platform: $platform');
      print('🔍 DEBUG: Current likeCount: $likeCount');
      
      // Make API request to like the search
      final uri = Uri.http('keywords.nazaarabox.com', '/api/like', {
        'query': query,
        'platform': platform,
      });
      print('🔍 DEBUG: Making API request to: $uri');
      
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('🔍 DEBUG: Response status code: ${response.statusCode}');
      print('🔍 DEBUG: Response body: ${response.body}');

      if (response.statusCode != 200) {
        print('❌ DEBUG: API returned non-200 status: ${response.statusCode}');
        throw Exception('Failed to like - Status: ${response.statusCode}');
      }

      final data = json.decode(response.body);
      print('🔍 DEBUG: Parsed response data: $data');
      
      final newLikeCount = data['likes'] ?? (likeCount + 1);
      print('🔍 DEBUG: New like count: $newLikeCount');
      
      setState(() {
        likeCount = newLikeCount;
      });
      
      // Trigger animations
      _scaleController?.forward().then((_) => _scaleController?.reverse());
      if (newLikeCount > 0) {
        _pulseController?.repeat(reverse: true);
      }

      print('✅ DEBUG: Like successful, showing success message');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Thanks for liking!'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    } catch (e) {
      print('❌ DEBUG: Error in _handleLike: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to like: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    } finally {
      print('🔍 DEBUG: Setting likeLoading to false');
      setState(() {
        likeLoading = false;
      });
    }
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Copied "$text" to clipboard'),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  void _copyAllItems() {
    final items = _getFilteredItems();
    if (items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No items to copy.'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    final String allItemsText = items.join('\n');
    Clipboard.setData(ClipboardData(text: allItemsText));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Copied ${items.length} items to clipboard'),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  void _toggleSelectionMode() {
    setState(() {
      isSelectionMode = !isSelectionMode;
      if (!isSelectionMode) {
        selectedItems.clear();
      }
    });
  }

  void _toggleItemSelection(String item) {
    setState(() {
      if (selectedItems.contains(item)) {
        selectedItems.remove(item);
      } else {
        selectedItems.add(item);
      }
    });
  }

  void _copySelectedItems() {
    if (selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No items selected.'),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
      return;
    }

    final String selectedItemsText = selectedItems.join('\n');
    Clipboard.setData(ClipboardData(text: selectedItemsText));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Copied ${selectedItems.length} selected items to clipboard'),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
    
    // Exit selection mode after copying
    setState(() {
      isSelectionMode = false;
      selectedItems.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundPink,
      appBar: AppBar(
        backgroundColor: white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: darkText),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Search Results',
          style: TextStyle(
            color: darkText,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (searchResults != null)
            IconButton(
              icon: Icon(Icons.share, color: darkText),
              onPressed: _shareResults,
            ),
        ],
      ),
      body: Stack(
        children: [
          searchLoading
              ? _buildLoadingState()
              : searchResults != null
                  ? _buildResultsContent()
                  : _buildEmptyState(),
          // Sticky like button
          if (searchResults != null) _buildStickyLikeButton(),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(primaryPink),
          ),
          const SizedBox(height: 16),
          Text(
            'Searching...',
            style: TextStyle(
              fontSize: 16,
              color: lightText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 64,
            color: lightText.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No search results',
            style: TextStyle(
              fontSize: 18,
              color: lightText,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Go back to search page to perform a new search',
            style: TextStyle(
              fontSize: 14,
              color: mutedText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Results Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with title and platform info
                Row(
                  children: [
                    Icon(
                      Icons.search,
                      color: primaryPink,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Results for "${searchResults!.data.query}"',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: darkText,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Platform: ${currentPlatform.toUpperCase()}',
                            style: TextStyle(
                              fontSize: 14,
                              color: lightText,
                            ),
                          ),
                          if (likeCount > 0 || viewCount > 0) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                if (likeCount > 0) ...[
                                  Icon(Icons.favorite, size: 12, color: Colors.red),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$likeCount likes',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: lightText,
                                    ),
                                  ),
                                ],
                                if (likeCount > 0 && viewCount > 0) ...[
                                  const SizedBox(width: 8),
                                  Text('•', style: TextStyle(fontSize: 12, color: lightText)),
                                  const SizedBox(width: 8),
                                ],
                                if (viewCount > 0) ...[
                                  Icon(Icons.visibility, size: 12, color: lightText),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$viewCount views',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: lightText,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Buttons in a separate row that can wrap
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _saveResultsToFile,
                      icon: const Icon(Icons.save, size: 14),
                      label: const Text('Save', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryPink,
                        foregroundColor: darkText,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: _shareResults,
                      icon: const Icon(Icons.share, size: 14),
                      label: const Text('Share', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                    ),

                    ElevatedButton.icon(
                      onPressed: isSelectionMode ? _copySelectedItems : _toggleSelectionMode,
                      icon: Icon(isSelectionMode ? Icons.copy : Icons.select_all, size: 14),
                      label: Text(
                        isSelectionMode ? 'Copy Selected' : 'Select',
                        style: const TextStyle(fontSize: 12),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isSelectionMode ? Colors.green : Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                    ),
                    if (isSelectionMode)
                      ElevatedButton.icon(
                        onPressed: _toggleSelectionMode,
                        icon: const Icon(Icons.close, size: 14),
                        label: const Text('Cancel', style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        ),
                      ),
                    ElevatedButton.icon(
                      onPressed: () => _copyAllItems(),
                      icon: const Icon(Icons.copy, size: 14),
                      label: const Text('Copy All', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Filter Tabs
          ResultsFilterTabs(
            sectionCounts: _sectionCounts,
            selectedTab: selectedFilter,
            onTabChanged: _onFilterChanged,
          ),
          
          const SizedBox(height: 20),
          
          // Filtered Results
          _buildFilteredResults(),
        ],
      ),
    );
  }

  Widget _buildFilteredResults() {
    final items = _getFilteredItems();
    
    if (items.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(
              _getFilterIcon(),
              size: 48,
              color: _getFilterColor().withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No $selectedFilter Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: darkText,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try selecting a different filter or perform a new search',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: lightText,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(_getFilterIcon(), color: _getFilterColor(), size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  selectedFilter,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: darkText,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getFilterColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isSelectionMode 
                      ? '${selectedItems.length} selected'
                      : '${items.length} items',
                  style: TextStyle(
                    fontSize: 12,
                    color: _getFilterColor(),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items.map((item) => _buildResultChip(item, _getFilterColor())).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildResultChip(String text, Color color) {
    final bool isSelected = selectedItems.contains(text);
    
    return InkWell(
      onTap: isSelectionMode 
          ? () => _toggleItemSelection(text)
          : () => _copyToClipboard(text),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        constraints: const BoxConstraints(
          maxWidth: 200,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected 
              ? color.withOpacity(0.3)
              : color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected 
                ? color
                : color.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isSelectionMode) ...[
              Icon(
                isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 16,
                color: isSelected ? color : color.withOpacity(0.5),
              ),
              const SizedBox(width: 6),
            ],
            Flexible(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 14,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            if (!isSelectionMode) ...[
              const SizedBox(width: 6),
              Icon(
                Icons.copy,
                size: 14,
                color: color,
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildStickyLikeButton() {
    // Check if animations are initialized
    if (_pulseAnimation == null || _scaleAnimation == null) {
      return const SizedBox.shrink();
    }
    
    return Positioned(
      bottom: 20,
      right: 20,
      child: AnimatedBuilder(
        animation: Listenable.merge([_pulseAnimation!, _scaleAnimation!]),
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation!.value * _scaleAnimation!.value,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: likeCount > 0 
                        ? Colors.red.withOpacity(0.3)
                        : Colors.grey.withOpacity(0.3),
                    blurRadius: 12,
                    spreadRadius: 2,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: FloatingActionButton(
                onPressed: likeLoading ? null : () {
                  print('🔍 DEBUG: Sticky like button pressed!');
                  _scaleController?.forward().then((_) => _scaleController?.reverse());
                  _handleLike();
                },
                backgroundColor: likeCount > 0 
                    ? Colors.red 
                    : Colors.grey,
                foregroundColor: Colors.white,
                elevation: 8,
                child: likeLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Icon(
                        likeCount > 0 ? Icons.favorite : Icons.favorite_border,
                        size: 24,
                      ),
              ),
            ),
          );
        },
      ),
    );
  }
}