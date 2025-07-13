import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:share_plus/share_plus.dart';
import '../models/trending_keyword.dart';
import '../widgets/trending_keywords_table.dart';
import '../widgets/filter_card.dart';

class TrendingKeywordsPage extends StatefulWidget {
  const TrendingKeywordsPage({super.key});

  @override
  State<TrendingKeywordsPage> createState() => _TrendingKeywordsPageState();
}

class _TrendingKeywordsPageState extends State<TrendingKeywordsPage> {
  List<TrendingKeyword> trendingKeywords = [];
  bool loading = false;
  bool exporting = false;
  String? error;
  
  // Filter states
  String searchTerm = '';
  String selectedFilter = 'trending';
  String selectedPlatform = 'all';
  String selectedType = 'all';
  String selectedSort = 'likes';
  
  // Debounce timer
  Timer? _debounceTimer;

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

  @override
  void initState() {
    super.initState();
    _fetchTrendingKeywords();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchTrendingKeywords() async {
    if (loading) return;
    
    setState(() {
      loading = true;
      error = null;
    });

    try {
      String endpoint = '/api/trending';
      
      // Choose endpoint based on filter
      if (selectedFilter == 'most-views') {
        endpoint = '/api/most-views';
      } else if (selectedFilter == 'most-likes') {
        endpoint = '/api/most-likes';
      }
      
      final uri = Uri.http('keywords.nazaarabox.com', endpoint, {
        if (searchTerm.isNotEmpty) 'query': searchTerm,
        if (selectedPlatform != 'all') 'platform': selectedPlatform,
        if (selectedType != 'all') 'search_type': selectedType,
        if (selectedSort.isNotEmpty && selectedFilter == 'trending') 'sort': selectedSort,
      });

      print('🔍 DEBUG: Fetching trending keywords from: $uri');
      
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      
      print('🔍 DEBUG: Response status: ${response.statusCode}');
      print('🔍 DEBUG: Response body: ${response.body}');

      if (response.statusCode != 200) {
        throw Exception('Failed to fetch trending keywords: ${response.statusCode}');
      }

      final data = json.decode(response.body);
      
      if (data['success'] != true) {
        throw Exception(data['message'] ?? 'API returned error');
      }

      final List<TrendingKeyword> keywords = (data['data'] as List)
          .map((item) {
            print('🔍 DEBUG: Processing item: $item');
            try {
              return TrendingKeyword.fromJson(item);
            } catch (e) {
              print('❌ DEBUG: Error parsing item: $e');
              return null;
            }
          })
          .where((item) => item != null)
          .cast<TrendingKeyword>()
          .toList();

      setState(() {
        trendingKeywords = keywords;
        loading = false;
      });

      print('✅ DEBUG: Fetched ${keywords.length} trending keywords');

    } catch (e) {
      print('❌ DEBUG: Error fetching trending keywords: $e');
      setState(() {
        error = e.toString();
        loading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to fetch trending keywords: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    }
  }

  void _onSearchChanged(String value) {
    searchTerm = value;
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _fetchTrendingKeywords();
    });
  }

  void _onFilterChanged(String? value) {
    if (value != null) {
      setState(() {
        selectedFilter = value;
      });
      _fetchTrendingKeywords();
    }
  }

  void _onPlatformChanged(String? value) {
    if (value != null) {
      setState(() {
        selectedPlatform = value;
      });
      _fetchTrendingKeywords();
    }
  }

  void _onTypeChanged(String? value) {
    if (value != null) {
      setState(() {
        selectedType = value;
      });
      _fetchTrendingKeywords();
    }
  }

  void _onSortChanged(String? value) {
    if (value != null) {
      setState(() {
        selectedSort = value;
      });
      _fetchTrendingKeywords();
    }
  }

  Future<void> _handleExportAll() async {
    if (trendingKeywords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
        content: const Text('No data to export'),
        backgroundColor: Colors.orange,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      );
      return;
    }

    setState(() {
      exporting = true;
    });

    try {
      // Create CSV content
      final csvRows = <List<String>>[
        ['Query', 'Platform', 'Type', 'Total Likes', 'Total Views', 'Last Updated'],
        ...trendingKeywords.map((k) => [
          k.query,
          k.platform,
          k.searchType,
          k.likes.toString(),
          (k.views ?? 0).toString(),
          DateTime.parse(k.createdAt).toLocal().toString().split('.')[0],
        ])
      ];

      final csvContent = csvRows
          .map((row) => row.map((cell) => '"${cell.replaceAll('"', '""')}"').join(','))
          .join('\n');

      // Create share text
      final shareText = '''
Trending Keywords Export
Filter: $selectedFilter
Platform: $selectedPlatform
Type: $selectedType
Sort: $selectedSort
Date: ${DateTime.now().toLocal().toString().split('.')[0]}

$csvContent
''';

      await Share.share(
        shareText,
        subject: 'Trending Keywords Export - ${DateTime.now().toLocal().toString().split(' ')[0]}',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Exported ${trendingKeywords.length} keywords successfully!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to export: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } finally {
      setState(() {
        exporting = false;
      });
    }
  }

  String _getFilterTitle() {
    switch (selectedFilter) {
      case 'most-views':
        return 'Most Viewed Keywords';
      case 'most-likes':
        return 'Most Liked Keywords';
      default:
        return 'Trending Keywords';
    }
  }

  String _getFilterDescription() {
    switch (selectedFilter) {
      case 'most-views':
        return 'See the most viewed keywords across all platforms (aggregated across all languages and countries)';
      case 'most-likes':
        return 'See the most liked keywords across all platforms (aggregated across all languages and countries)';
      default:
        return 'See the most liked, viewed, and recent keywords across all platforms (aggregated across all languages and countries)';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundPink,
      // Removed AppBar
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: white,
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
                  Text(
                    _getFilterTitle(),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: darkText,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _getFilterDescription(),
                    style: TextStyle(
                      fontSize: 14,
                      color: lightText,
                    ),
                  ),
                ],
              ),
            ),
            
            // Filters section
            FilterCard(
              searchTerm: searchTerm,
              selectedFilter: selectedFilter,
              selectedPlatform: selectedPlatform,
              selectedType: selectedType,
              selectedSort: selectedSort,
              onSearchChanged: _onSearchChanged,
              onFilterChanged: _onFilterChanged,
              onPlatformChanged: _onPlatformChanged,
              onTypeChanged: _onTypeChanged,
              onSortChanged: _onSortChanged,
            ),
            
            // Content section
            Builder(
              builder: (context) {
                print('🔍 DEBUG: Content section - loading: $loading, error: $error, keywords count: ${trendingKeywords.length}');
                
                if (loading) {
                  return _buildLoadingState();
                } else if (error != null) {
                  return _buildErrorState();
                } else if (trendingKeywords.isEmpty) {
                  return _buildEmptyState();
                } else {
                  return TrendingKeywordsTable(
                    keywords: trendingKeywords,
                    onRefresh: _fetchTrendingKeywords,
                  );
                }
              },
            ),
          ],
        ),
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
            'Loading trending keywords...',
            style: TextStyle(
              fontSize: 16,
              color: lightText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to load trending keywords',
            style: TextStyle(
              fontSize: 18,
              color: darkText,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error ?? 'Unknown error occurred',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: lightText,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _fetchTrendingKeywords,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryPink,
              foregroundColor: darkText,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Retry'),
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
            Icons.trending_up,
            size: 64,
            color: lightText.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No trending keywords found',
            style: TextStyle(
              fontSize: 18,
              color: darkText,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters or search terms',
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
} 