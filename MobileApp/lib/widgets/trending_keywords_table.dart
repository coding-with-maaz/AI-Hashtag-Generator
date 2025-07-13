import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/trending_keyword.dart';

class TrendingKeywordsTable extends StatefulWidget {
  final List<TrendingKeyword> keywords;
  final VoidCallback onRefresh;

  const TrendingKeywordsTable({
    super.key,
    required this.keywords,
    required this.onRefresh,
  });

  @override
  State<TrendingKeywordsTable> createState() => _TrendingKeywordsTableState();
}

class _TrendingKeywordsTableState extends State<TrendingKeywordsTable> {
  Map<String, bool> likeLoading = {};
  Map<String, int> likeCounts = {};

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
    // Initialize like counts from keywords
    for (final keyword in widget.keywords) {
      likeCounts[keyword.id] = keyword.likes;
    }
  }

  @override
  void didUpdateWidget(TrendingKeywordsTable oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Update like counts when keywords change
    for (final keyword in widget.keywords) {
      if (!likeCounts.containsKey(keyword.id)) {
        likeCounts[keyword.id] = keyword.likes;
      }
    }
  }

  Future<void> _handleLike(TrendingKeyword keyword) async {
    if (likeLoading[keyword.id] == true) return;

    setState(() {
      likeLoading[keyword.id] = true;
    });

    try {
      print('🔍 DEBUG: Liking keyword: ${keyword.query} (${keyword.platform})');
      
      final uri = Uri.http('keywords.nazaarabox.com', '/api/like', {
        'query': keyword.query,
        'platform': keyword.platform,
      });

      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      print('🔍 DEBUG: Like response status: ${response.statusCode}');
      print('🔍 DEBUG: Like response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final newLikeCount = data['likes'] ?? (likeCounts[keyword.id] ?? 0) + 1;
        
        setState(() {
          likeCounts[keyword.id] = newLikeCount;
        });

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
      } else {
        throw Exception('Failed to like keyword');
      }
    } catch (e) {
      print('❌ DEBUG: Error liking keyword: $e');
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
      setState(() {
        likeLoading[keyword.id] = false;
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

  String _getPlatformIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'google':
        return '🔍';
      case 'youtube':
        return '📺';
      case 'bing':
        return '🔎';
      case 'playstore':
        return '📱';
      case 'appstore':
        return '🍎';
      default:
        return '📊';
    }
  }

  Color _getPlatformColor(String platform) {
    switch (platform.toLowerCase()) {
      case 'google':
        return Colors.blue;
      case 'youtube':
        return Colors.red;
      case 'bing':
        return Colors.blue;
      case 'playstore':
        return Colors.green;
      case 'appstore':
        return Colors.black;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    print('🔍 DEBUG: Building TrendingKeywordsTable with ${widget.keywords.length} keywords');
    for (final keyword in widget.keywords) {
      print('🔍 DEBUG: Keyword - ID: ${keyword.id}, Query: ${keyword.query}, Platform: ${keyword.platform}, Likes: ${keyword.likes}');
    }
    
    return Container(
      margin: const EdgeInsets.all(20),
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
      child: ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: widget.keywords.length,
        itemBuilder: (context, index) {
          final keyword = widget.keywords[index];
          final currentLikes = likeCounts[keyword.id] ?? keyword.likes;
          final isLoading = likeLoading[keyword.id] ?? false;
          
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row
                Row(
                  children: [
                    // Platform icon and name
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getPlatformColor(keyword.platform).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _getPlatformIcon(keyword.platform),
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            keyword.platform.toUpperCase(),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: _getPlatformColor(keyword.platform),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    
                    // Type badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.purple.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        keyword.searchType.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.purple,
                        ),
                      ),
                    ),
                    const Spacer(),
                    
                    // Like button
                    InkWell(
                      onTap: isLoading ? null : () => _handleLike(keyword),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: currentLikes > 0 ? Colors.red : Colors.grey.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (isLoading)
                              const SizedBox(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            else
                              Icon(
                                currentLikes > 0 ? Icons.favorite : Icons.favorite_border,
                                size: 16,
                                color: currentLikes > 0 ? Colors.white : Colors.grey,
                              ),
                            const SizedBox(width: 4),
                            Text(
                              currentLikes.toString(),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: currentLikes > 0 ? Colors.white : Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Query text
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        keyword.query,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: darkText,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => _copyToClipboard(keyword.query),
                      icon: Icon(Icons.copy, size: 16, color: lightText),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                
                const SizedBox(height: 8),
                
                // Stats row
                Row(
                  children: [
                    if (keyword.views != null && keyword.views! > 0) ...[
                      Icon(Icons.visibility, size: 14, color: lightText),
                      const SizedBox(width: 4),
                      Text(
                        '${keyword.views} views',
                        style: TextStyle(
                          fontSize: 12,
                          color: lightText,
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Icon(Icons.schedule, size: 14, color: lightText),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(keyword.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: lightText,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);
      
      if (difference.inDays > 0) {
        return '${difference.inDays}d ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}h ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return 'Unknown';
    }
  }
} 