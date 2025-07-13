class SearchResponse {
  final SearchData data;
  final SearchMetadata metadata;

  const SearchResponse({
    required this.data,
    required this.metadata,
  });

  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    return SearchResponse(
      data: SearchData.fromJson(json['data'] ?? {}),
      metadata: SearchMetadata.fromJson(json['metadata'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'data': data.toJson(),
      'metadata': metadata.toJson(),
    };
  }
}

class SearchData {
  final String query;
  final List<String> keywords;
  final List<String> hashtags;
  final List<String> questions;
  final List<String> prepositions;
  final List<String> generatedHashtags;
  final int likes;
  final int views;

  const SearchData({
    required this.query,
    required this.keywords,
    required this.hashtags,
    required this.questions,
    required this.prepositions,
    required this.generatedHashtags,
    required this.likes,
    required this.views,
  });

  factory SearchData.fromJson(Map<String, dynamic> json) {
    return SearchData(
      query: json['query'] ?? '',
      keywords: List<String>.from(json['keywords'] ?? []),
      hashtags: List<String>.from(json['hashtags'] ?? []),
      questions: List<String>.from(json['questions'] ?? []),
      prepositions: List<String>.from(json['prepositions'] ?? []),
      generatedHashtags: List<String>.from(json['generatedHashtags'] ?? []),
      likes: json['likes'] ?? 0,
      views: json['views'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'query': query,
      'keywords': keywords,
      'hashtags': hashtags,
      'questions': questions,
      'prepositions': prepositions,
      'generatedHashtags': generatedHashtags,
      'likes': likes,
      'views': views,
    };
  }
}

class SearchMetadata {
  final String query;
  final String platform;
  final String searchType;
  final String timestamp;
  final String language;
  final String country;

  const SearchMetadata({
    required this.query,
    required this.platform,
    required this.searchType,
    required this.timestamp,
    required this.language,
    required this.country,
  });

  factory SearchMetadata.fromJson(Map<String, dynamic> json) {
    return SearchMetadata(
      query: json['query'] ?? '',
      platform: json['platform'] ?? '',
      searchType: json['searchType'] ?? '',
      timestamp: json['timestamp'] ?? '',
      language: json['language'] ?? '',
      country: json['country'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'query': query,
      'platform': platform,
      'searchType': searchType,
      'timestamp': timestamp,
      'language': language,
      'country': country,
    };
  }
} 