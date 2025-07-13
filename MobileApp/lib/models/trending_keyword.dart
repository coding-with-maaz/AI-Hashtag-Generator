class TrendingKeyword {
  final String id;
  final String query;
  final String platform;
  final String searchType;
  final int likes;
  final int? views;
  final String createdAt;
  final String? language;
  final String? country;

  const TrendingKeyword({
    required this.id,
    required this.query,
    required this.platform,
    required this.searchType,
    required this.likes,
    this.views,
    required this.createdAt,
    this.language,
    this.country,
  });

  factory TrendingKeyword.fromJson(Map<String, dynamic> json) {
    print('🔍 DEBUG: Parsing TrendingKeyword from JSON: $json');
    
    // Handle different possible field names
    final id = json['id']?.toString() ?? json['record_id']?.toString() ?? '';
    final query = json['query'] ?? '';
    final platform = json['platform'] ?? '';
    final searchType = json['search_type'] ?? json['type'] ?? 'all';
    final likes = json['likes'] ?? json['total_likes'] ?? 0;
    final views = json['views'] ?? json['total_views'];
    final createdAt = json['created_at'] ?? json['timestamp'] ?? DateTime.now().toIso8601String();
    final language = json['language'] ?? json['lang'];
    final country = json['country'] ?? json['country_code'];
    
    print('🔍 DEBUG: Parsed values - id: $id, query: $query, platform: $platform, likes: $likes, views: $views');
    
    return TrendingKeyword(
      id: id,
      query: query,
      platform: platform,
      searchType: searchType,
      likes: likes is int ? likes : int.tryParse(likes.toString()) ?? 0,
      views: views is int ? views : views != null ? int.tryParse(views.toString()) : null,
      createdAt: createdAt,
      language: language,
      country: country,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'query': query,
      'platform': platform,
      'search_type': searchType,
      'likes': likes,
      'views': views,
      'created_at': createdAt,
      'language': language,
      'country': country,
    };
  }

  @override
  String toString() {
    return 'TrendingKeyword(id: $id, query: $query, platform: $platform, likes: $likes, views: $views)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TrendingKeyword && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 