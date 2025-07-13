import 'package:flutter/material.dart';
import '../widgets/search_form.dart';
import '../models/search_response.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:keywordtools/pages/search_results_page.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  bool searchLoading = false;
  String? error;
  double progress = 0.0;
  String searchingText = "Searching...";

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

  void _startProgressAnimation() {
    if (searchLoading) {
      Future.delayed(const Duration(milliseconds: 200), () {
        if (mounted && searchLoading) {
          setState(() {
            if (progress < 90) {
              progress += 10;
            }
          });
          _startProgressAnimation();
        }
      });
    }
  }

  // Add pulsing animation for the progress bar
  bool _isPulsing = false;

  void _startPulsingAnimation() {
    if (searchLoading && progress > 0 && progress < 100) {
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted && searchLoading) {
          setState(() {
            _isPulsing = !_isPulsing;
          });
          _startPulsingAnimation();
        }
      });
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
      progress = 0.0;
      searchingText = "Searching...";
    });

    _startProgressAnimation();
    _startPulsingAnimation();

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
        // Bing expects 'mkt' as 'en-US', 'fr-FR', etc.
        final mkt = '${language ?? 'en'}-${(country ?? 'us').toUpperCase()}';
        queryParams['mkt'] = mkt;
      } else {
        if (language != null) queryParams['language'] = language;
        if (country != null) queryParams['country'] = country;
      }

      // Make API request with timeout
      final uri = Uri.http('keywords.nazaarabox.com', endpoint, queryParams);
      
      final response = await http.get(uri).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Request timeout. Please check your connection.');
        },
      );

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

      // Track view for this keyword search (don't wait for it)
      _trackView(query, platform);

      // Navigate to results page with the search results
      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => SearchResultsPage(
              initialResults: transformedResponse,
              initialQuery: query,
              initialPlatform: platform,
            ),
          ),
        );
      }

    } catch (e) {
      setState(() {
        error = e.toString();
      });
      
      // Show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Search failed: ${e.toString()}'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          searchLoading = false;
          progress = 100.0;
        });
        
        // Completion animation
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            setState(() {
              progress = 0.0;
              _isPulsing = false;
            });
          }
        });
      }
    }
  }

  Future<void> _trackView(String query, String platform) async {
    try {
      final uri = Uri.http('keywords.nazaarabox.com', '/api/view');
      await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'query': query,
          'platform': platform,
        }),
      ).timeout(const Duration(seconds: 5));
      print('✅ View tracked for $platform: $query');
    } catch (e) {
      print('Failed to track view: $e');
      // Don't show error to user for tracking failures
    }
  }

  Widget _buildStyledProgressBar() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: primaryPink.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Container(
        height: 12,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: primaryPink.withOpacity(_isPulsing ? 0.5 : 0.3),
              blurRadius: _isPulsing ? 12 : 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Background
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  colors: [
                    borderColor.withOpacity(0.1),
                    borderColor.withOpacity(0.2),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            // Progress bar
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              width: MediaQuery.of(context).size.width * (progress / 100) * 0.85, // Account for padding
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  colors: [
                    primaryPink,
                    Color(0xFFFF6B9D),
                    Color(0xFFFF8FA3),
                  ],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: primaryPink.withOpacity(_isPulsing ? 0.6 : 0.4),
                    blurRadius: _isPulsing ? 6 : 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
            // Shimmer effect
            if (progress > 0 && progress < 100)
              AnimatedPositioned(
                duration: const Duration(milliseconds: 300),
                left: MediaQuery.of(context).size.width * (progress / 100) * 0.85 - 20,
                child: Container(
                  width: 20,
                  height: 12,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.8),
                        Colors.white.withOpacity(0.2),
                        Colors.transparent,
                      ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                  ),
                ),
              ),
            // Progress text overlay
            Center(
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: progress > 50 ? Colors.white : darkText,
                  shadows: progress > 50 ? [
                    Shadow(
                      color: Colors.black.withOpacity(0.3),
                      offset: const Offset(0, 1),
                      blurRadius: 2,
                    ),
                  ] : null,
                ),
                child: Text('${progress.toInt()}%'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: backgroundPink,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Keyword Search',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: darkText,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Search for keywords, hashtags, questions, and prepositions',
                    style: TextStyle(
                      fontSize: 16,
                      color: lightText,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Search Form
              SearchForm(
                onSearch: handleSearch,
                loading: searchLoading,
              ),
              
              const SizedBox(height: 20),
              
              // Progress Indicator
              if (searchLoading) ...[
                Column(
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.trending_up,
                          color: primaryPink,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          searchingText,
                          style: TextStyle(
                            fontSize: 12,
                            color: mutedText,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildStyledProgressBar(),
                  ],
                ),
                const SizedBox(height: 20),
              ],
              
              // Error Display
              if (error != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: Colors.red.shade600,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          error!,
                          style: TextStyle(
                            color: Colors.red.shade700,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              
              // Help text at bottom
              if (!searchLoading && error == null) ...[
                const SizedBox(height: 40),
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
                    children: [
                      Icon(
                        Icons.search,
                        size: 48,
                        color: lightText.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Ready to Search',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: darkText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter your keyword above and select a platform to start searching for trending keywords, hashtags, and content ideas.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: lightText,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ],
          ),
        ),
      ),
    );
  }
} 