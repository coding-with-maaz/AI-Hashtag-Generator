import 'package:flutter/material.dart';

class ResultsFilterTabs extends StatefulWidget {
  final Map<String, int> sectionCounts;
  final Function(String) onTabChanged;
  final String selectedTab;

  const ResultsFilterTabs({
    super.key,
    required this.sectionCounts,
    required this.onTabChanged,
    required this.selectedTab,
  });

  @override
  State<ResultsFilterTabs> createState() => _ResultsFilterTabsState();
}

class _ResultsFilterTabsState extends State<ResultsFilterTabs> {
  // App Color Constants
  static const Color primaryPink = Color(0xFFFCEEEE);
  static const Color backgroundPink = Color(0xFFFFF7F4);
  static const Color lightPink = Color(0xFFFEF2F2);
  static const Color darkText = Color(0xFF1A1A1A);
  static const Color lightText = Color(0xFF666666);
  static const Color mutedText = Color(0xFF999999);
  static const Color white = Color(0xFFFFFFFF);

  @override
  Widget build(BuildContext context) {
    final tabs = widget.sectionCounts.keys.toList();
    
    return Container(
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
        mainAxisSize: MainAxisSize.min,
        children: [
          // Tab Bar
          Container(
            decoration: BoxDecoration(
              color: lightPink,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: tabs.map((tab) => _buildTab(tab)).toList(),
            ),
          ),
          
          // Tab Content Area
          Container(
            constraints: const BoxConstraints(
              minHeight: 80,
              maxHeight: 100,
            ),
            padding: const EdgeInsets.all(16),
            child: _buildTabContent(widget.selectedTab),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String tabName) {
    final count = widget.sectionCounts[tabName] ?? 0;
    final isSelected = widget.selectedTab == tabName;
    
    return Expanded(
      child: InkWell(
        onTap: () => widget.onTabChanged(tabName),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? white : Colors.transparent,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            boxShadow: isSelected ? [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ] : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: Text(
                  tabName,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    fontSize: 11,
                    color: isSelected ? darkText : mutedText,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? primaryPink : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? darkText : mutedText,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent(String tabName) {
    final count = widget.sectionCounts[tabName] ?? 0;
    final icon = _getTabIcon(tabName);
    final color = _getTabColor(tabName);
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 24,
          color: color,
        ),
        const SizedBox(height: 4),
        Flexible(
          child: Text(
            tabName,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: darkText,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '$count items',
          style: TextStyle(
            fontSize: 10,
            color: lightText,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  IconData _getTabIcon(String tabName) {
    switch (tabName.toLowerCase()) {
      case 'keywords':
        return Icons.key;
      case 'hashtags':
        return Icons.tag;
      case 'questions':
        return Icons.question_mark;
      case 'prepositions':
        return Icons.link;
      case 'generated hashtags':
        return Icons.auto_awesome;
      default:
        return Icons.list;
    }
  }

  Color _getTabColor(String tabName) {
    switch (tabName.toLowerCase()) {
      case 'keywords':
        return Colors.blue;
      case 'hashtags':
        return Colors.purple;
      case 'questions':
        return Colors.orange;
      case 'prepositions':
        return Colors.green;
      case 'generated hashtags':
        return Colors.pink;
      default:
        return primaryPink;
    }
  }
} 