import 'package:flutter/material.dart';

class FilterCard extends StatelessWidget {
  final String searchTerm;
  final String selectedFilter;
  final String selectedPlatform;
  final String selectedType;
  final String selectedSort;
  final Function(String) onSearchChanged;
  final Function(String?) onFilterChanged;
  final Function(String?) onPlatformChanged;
  final Function(String?) onTypeChanged;
  final Function(String?) onSortChanged;

  const FilterCard({
    super.key,
    required this.searchTerm,
    required this.selectedFilter,
    required this.selectedPlatform,
    required this.selectedType,
    required this.selectedSort,
    required this.onSearchChanged,
    required this.onFilterChanged,
    required this.onPlatformChanged,
    required this.onTypeChanged,
    required this.onSortChanged,
  });

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
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
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
          Text(
            'Filters',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: darkText,
            ),
          ),
          const SizedBox(height: 12),
          
          // Search input
          Container(
            decoration: BoxDecoration(
              color: lightPink,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: borderColor),
            ),
            child: TextField(
              onChanged: onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search keywords...',
                hintStyle: TextStyle(color: lightText),
                prefixIcon: Icon(Icons.search, color: lightText),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Filter dropdowns in a grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2.8,
            children: [
              _buildDropdown(
                label: 'Filter',
                value: selectedFilter,
                items: const [
                  DropdownMenuItem(value: 'trending', child: Text('Trending')),
                  DropdownMenuItem(value: 'most-views', child: Text('Most Views')),
                  DropdownMenuItem(value: 'most-likes', child: Text('Most Likes')),
                ],
                onChanged: onFilterChanged,
              ),
              _buildDropdown(
                label: 'Platform',
                value: selectedPlatform,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Platforms')),
                  DropdownMenuItem(value: 'google', child: Text('Google')),
                  DropdownMenuItem(value: 'youtube', child: Text('YouTube')),
                  DropdownMenuItem(value: 'bing', child: Text('Bing')),
                  DropdownMenuItem(value: 'playstore', child: Text('Play Store')),
                  DropdownMenuItem(value: 'appstore', child: Text('App Store')),
                ],
                onChanged: onPlatformChanged,
              ),
              _buildDropdown(
                label: 'Type',
                value: selectedType,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Types')),
                  DropdownMenuItem(value: 'keywords', child: Text('Keywords')),
                  DropdownMenuItem(value: 'hashtags', child: Text('Hashtags')),
                  DropdownMenuItem(value: 'questions', child: Text('Questions')),
                  DropdownMenuItem(value: 'prepositions', child: Text('Prepositions')),
                ],
                onChanged: onTypeChanged,
              ),
              if (selectedFilter == 'trending')
                _buildDropdown(
                  label: 'Sort',
                  value: selectedSort,
                  items: const [
                    DropdownMenuItem(value: 'likes', child: Text('Most Liked')),
                    DropdownMenuItem(value: 'views', child: Text('Most Viewed')),
                    DropdownMenuItem(value: 'recent', child: Text('Most Recent')),
                  ],
                  onChanged: onSortChanged,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<DropdownMenuItem<String>> items,
    required Function(String?) onChanged,
  }) {
    return Container(
      height: 60,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: mediumText,
            ),
          ),
          const SizedBox(height: 2),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: lightPink,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderColor),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: value,
                  items: items,
                  onChanged: onChanged,
                  isExpanded: true,
                  icon: Icon(Icons.arrow_drop_down, color: lightText, size: 16),
                  style: TextStyle(
                    fontSize: 12,
                    color: darkText,
                  ),
                  dropdownColor: white,
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 