import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';
import 'dart:math' as math;

const String apiBaseUrl = 'keywords.nazaarabox.com';

class StatesPage extends StatefulWidget {
  const StatesPage({super.key});

  @override
  State<StatesPage> createState() => _StatesPageState();
}

class _StatesPageState extends State<StatesPage> with SingleTickerProviderStateMixin {
  bool loading = true;
  String? error;
  List<dynamic> trending = [];
  List<dynamic> mostViews = [];
  List<dynamic> mostLikes = [];
  List<dynamic> searchActivity = [];
  bool activityLoading = true;
  String? activityError;

  // Time range selection
  final List<Map<String, String>> _ranges = [
    {'label': 'Today', 'value': 'today'},
    {'label': 'Last 7 Days', 'value': 'week'},
    {'label': 'Last 30 Days', 'value': 'month'},
  ];
  String _selectedRange = 'week';

  // For "View More" dialogs
  List<dynamic> allTopSearches = [];
  bool allTopLoading = false;
  String? allTopError;

  List<dynamic> allTopKeywords = [];
  bool allKeywordsLoading = false;
  String? allKeywordsError;

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _fetchStats();
    _fetchSearchActivity();
  }

  void _onRangeChanged(String? newValue) {
    if (newValue == null || newValue == _selectedRange) return;
    setState(() {
      _selectedRange = newValue;
    });
    _fetchStats();
    _fetchSearchActivity();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchStats() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final responses = await Future.wait([
        http.get(Uri.http(apiBaseUrl, '/api/trending', {'limit': '20', 'range': _selectedRange})),
        http.get(Uri.http(apiBaseUrl, '/api/most-views', {'limit': '10000', 'range': _selectedRange})),
        http.get(Uri.http(apiBaseUrl, '/api/most-likes', {'limit': '20', 'range': _selectedRange})),
      ]);
      final trendingRes = json.decode(responses[0].body);
      final mostViewsRes = json.decode(responses[1].body);
      final mostLikesRes = json.decode(responses[2].body);
      if (trendingRes['success'] != true || mostViewsRes['success'] != true || mostLikesRes['success'] != true) {
        setState(() {
          error = 'Failed to load statistics';
          loading = false;
        });
        return;
      }
      setState(() {
        trending = trendingRes['data'] ?? [];
        mostViews = mostViewsRes['data'] ?? [];
        mostLikes = mostLikesRes['data'] ?? [];
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Future<void> _fetchSearchActivity() async {
    setState(() {
      activityLoading = true;
      activityError = null;
    });
    try {
      final response = await http.get(Uri.http(apiBaseUrl, '/api/search-activity', {'range': _selectedRange}));
      final data = json.decode(response.body);
      setState(() {
        searchActivity = data['data'] ?? [];
        activityLoading = false;
      });
    } catch (e) {
      setState(() {
        activityError = e.toString();
        activityLoading = false;
      });
    }
  }

  Future<void> _handleViewMoreTopSearches() async {
    if (allTopSearches.isEmpty) {
      setState(() {
        allTopLoading = true;
        allTopError = null;
      });
      try {
        final response = await http.get(Uri.http(apiBaseUrl, '/api/trending', {'limit': '100', 'range': _selectedRange}));
        final data = json.decode(response.body);
        setState(() {
          allTopSearches = data['data'] ?? [];
          allTopLoading = false;
        });
      } catch (e) {
        setState(() {
          allTopError = e.toString();
          allTopLoading = false;
        });
      }
    }
    _showAllTopSearchesDialog();
  }

  Future<void> _handleViewMoreTopKeywords() async {
    if (allTopKeywords.isEmpty) {
      setState(() {
        allKeywordsLoading = true;
        allKeywordsError = null;
      });
      try {
        final response = await http.get(Uri.http(apiBaseUrl, '/api/trending', {'limit': '500', 'range': _selectedRange}));
        final data = json.decode(response.body);
        // Flatten hashtags and keywords from all trending entries
        final keywords = (data['data'] ?? []).expand((k) => [
          ..._asList(k['hashtags']).map((h) => <String, dynamic>{'name': h, 'count': k['likes']}),
          ..._asList(k['keywords']).map((kw) => <String, dynamic>{'name': kw, 'count': k['likes']}),
        ]).toList();
        setState(() {
          allTopKeywords = keywords;
          allKeywordsLoading = false;
        });
      } catch (e) {
        setState(() {
          allKeywordsError = e.toString();
          allKeywordsLoading = false;
        });
      }
    }
    _showAllTopKeywordsDialog();
  }

  // Helper to ensure hashtags/keywords are always a List
  List<dynamic> _asList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value;
    if (value is String) {
      try {
        final decoded = json.decode(value);
        if (decoded is List) return decoded;
      } catch (_) {}
    }
    return [];
  }

  // Helper methods to compute statistics
  List<Map<String, dynamic>> get topSearches {
    return trending.take(5).map((k) => {
      'name': k['query'],
      'count': k['likes'],
    }).toList();
  }

  List<Map<String, dynamic>> get topKeywords {
    final keywords = trending.expand((k) => [
      ..._asList(k['hashtags']).map((h) => <String, dynamic>{'name': h, 'count': k['likes']}),
      ..._asList(k['keywords']).map((kw) => <String, dynamic>{'name': kw, 'count': k['likes']}),
    ]).toList();
    return keywords.take(5).map((item) => item as Map<String, dynamic>).toList();
  }

  List<Map<String, dynamic>> get searchesByPlatform {
    final platformCounts = <String, int>{};
    for (final k in mostViews) {
      final platform = k['platform'] ?? 'Unknown';
      platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
    }
    return platformCounts.entries.map((e) => {
      'name': e.key,
      'searches': e.value,
    }).toList();
  }

  int get totalSearches => mostViews.length;

  String get popularPlatform {
    if (searchesByPlatform.isEmpty) return '-';
    searchesByPlatform.sort((a, b) => b['searches'].compareTo(a['searches']));
    return searchesByPlatform.first['name'];
  }

  String get mostLikedKeyword {
    if (mostLikes.isEmpty) return '-';
    return mostLikes.first['query'] ?? '-';
  }

  // Helper to get the selected range label
  String get selectedRangeLabel => _ranges.firstWhere((r) => r['value'] == _selectedRange)['label']!;

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        body: Center(child: Text('Error: $error')),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Statistics',
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Analytics and insights for your keyword searches',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      // Time range selector
                      DropdownButton<String>(
                        value: _ranges.firstWhere((r) => r['value'] == _selectedRange)['label'],
                        items: _ranges.map((range) {
                          return DropdownMenuItem<String>(
                            value: range['label'],
                            child: Text(range['label']!),
                          );
                        }).toList(),
                        onChanged: loading ? null : (label) {
                          final selected = _ranges.firstWhere((r) => r['label'] == label)['value'];
                          _onRangeChanged(selected);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Stats Cards
                  _buildStatsCards(),
                  const SizedBox(height: 24),

                  // Tabs
                  _buildTabs(),
                ],
              ),
            ),
            if (loading)
              Container(
                color: Colors.black.withOpacity(0.1),
                child: const Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        SizedBox(
          width: MediaQuery.of(context).size.width / 2 - 28, // 2 cards per row with padding
          child: _buildStatsCard(
            title: 'Total Searches',
            value: totalSearches > 0 ? totalSearches.toString() : '0',
            description: totalSearches > 0 ? 'Across all platforms' : 'No searches yet',
            icon: Icons.search,
            color: totalSearches > 0 ? Colors.blue : Colors.grey,
          ),
        ),
        SizedBox(
          width: MediaQuery.of(context).size.width / 2 - 28,
          child: _buildStatsCard(
            title: 'Trending Keywords',
            value: trending.isNotEmpty ? trending.length.toString() : '0',
            description: trending.isNotEmpty ? 'Top liked keywords' : 'No trending data',
            icon: Icons.trending_up,
            color: trending.isNotEmpty ? Colors.green : Colors.grey,
          ),
        ),
        SizedBox(
          width: MediaQuery.of(context).size.width / 2 - 28,
          child: _buildStatsCard(
            title: 'Popular Platform',
            value: searchesByPlatform.isNotEmpty ? popularPlatform : 'None',
            description: searchesByPlatform.isNotEmpty 
                ? '${searchesByPlatform.first['searches']} searches'
                : 'No platform data',
            icon: Icons.bar_chart,
            color: searchesByPlatform.isNotEmpty ? Colors.orange : Colors.grey,
          ),
        ),
        SizedBox(
          width: MediaQuery.of(context).size.width / 2 - 28,
          child: _buildStatsCard(
            title: 'Most Liked Keyword',
            value: mostLikes.isNotEmpty ? mostLikedKeyword : 'None',
            description: mostLikes.isNotEmpty 
                ? '${mostLikes.first['likes']} likes'
                : 'No likes data',
            icon: Icons.bookmark,
            color: mostLikes.isNotEmpty ? Colors.purple : Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsCard({
    required String title,
    required String value,
    required String description,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
          // Optionally set a minimum height for the card
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[500],
                fontSize: 11,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Searches'),
            Tab(text: 'Platforms'),
            Tab(text: 'Content'),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 600, // Set a fixed height for the tab content
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildOverviewTab(),
              _buildSearchesTab(),
              _buildPlatformsTab(),
              _buildContentTab(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        children: [
          // Searches by Platform Chart
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Searches by Platform ($selectedRangeLabel)',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Distribution of searches across platforms',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 300,
                    child: searchesByPlatform.isEmpty
                        ? _buildNoDataMessage('No platform data available for the selected time range. Try changing the time range or check back later.')
                        : _buildSimpleBarChart(searchesByPlatform, 'searches'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Top Searches and Keywords in a row
          Row(
            children: [
              Expanded(child: _buildTopSearchesCard()),
              const SizedBox(width: 16),
              Expanded(child: _buildTopKeywordsCard()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNoDataMessage(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Try changing the time range or check back later',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSimpleBarChart(List<Map<String, dynamic>> data, String valueKey) {
    final maxValue = data.fold(0.0, (max, item) => 
      math.max(max, (item[valueKey] ?? 0).toDouble()));
    
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxValue,
        barTouchData: BarTouchData(enabled: false),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= 0 && value.toInt() < data.length) {
                  final label = data[value.toInt()]['name']?.toString() ?? '-';
                  return Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      label,
                      style: const TextStyle(fontSize: 12),
                    ),
                  );
                }
                return const Text('-');
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toInt().toString(),
                  style: const TextStyle(fontSize: 12),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        barGroups: data.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                toY: (item[valueKey] ?? 0).toDouble(),
                color: Colors.green,
                width: 20,
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTopSearchesCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Top Searches',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Most popular search queries',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 16),
            if (topSearches.isEmpty)
              _buildNoDataMessage('No trending searches found for the selected time range. Try changing the time range or check back later.')
            else
              Column(
                children: [
                  ...topSearches.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 24,
                            child: Text(
                              '${index + 1}.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              item['name'],
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                          Row(
                            children: [
                              Text(
                                item['count'].toString(),
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(Icons.search, size: 16, color: Colors.grey[600]),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                  if (trending.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: TextButton(
                        onPressed: _handleViewMoreTopSearches,
                        child: const Text('View More'),
                      ),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopKeywordsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Top Keywords',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Most liked keywords/hashtags',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 16),
            if (topKeywords.isEmpty)
              _buildNoDataMessage('No trending keywords found for the selected time range. Try changing the time range or check back later.')
            else
              Column(
                children: [
                  ...topKeywords.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 24,
                            child: Text(
                              '${index + 1}.',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              item['name'],
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                          Row(
                            children: [
                              Text(
                                item['count'].toString(),
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(Icons.trending_up, size: 16, color: Colors.grey[600]),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                  if (topKeywords.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: TextButton(
                        onPressed: _handleViewMoreTopKeywords,
                        child: const Text('View More'),
                      ),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 20),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Search Activity ($selectedRangeLabel)',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Searches per day (${selectedRangeLabel.toLowerCase()})',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 16),
              if (activityLoading)
                const Center(child: CircularProgressIndicator())
              else if (activityError != null)
                Center(child: Text('Error: $activityError'))
              else if (searchActivity.isEmpty)
                _buildNoDataMessage('No search activity found for the selected time range. Try changing the time range or check back later.')
              else
                SizedBox(
                  height: 300,
                  child: _buildSimpleBarChart(List<Map<String, dynamic>>.from(searchActivity), 'count'),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlatformsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 20),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Platform Performance ($selectedRangeLabel)',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Analytics by platform',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 16),
              if (searchesByPlatform.isEmpty)
                _buildNoDataMessage('No platform analytics found for the selected time range. Try changing the time range or check back later.')
              else
                SizedBox(
                  height: 300,
                  child: _buildSimpleBarChart(List<Map<String, dynamic>>.from(searchesByPlatform), 'searches'),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContentTab() {
    final pieData = topKeywords.take(5).toList();
    final total = pieData.fold<int>(0, (sum, item) => sum + ((item['count'] ?? 0) as int));

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 20),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Content Analytics ($selectedRangeLabel)',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Keyword and hashtag performance',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 16),
              if (pieData.isEmpty)
                _buildNoDataMessage('No content analytics found for the selected time range. Try changing the time range or check back later.')
              else
                SizedBox(
                  height: 220,
                  child: PieChart(
                    PieChartData(
                      sections: pieData.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        final value = (item['count'] ?? 0) as int;
                        final percent = total > 0 ? (value / total) * 100 : 0.0;
                        return PieChartSectionData(
                          value: value.toDouble(),
                          title: '${item['name']}\n${percent.toStringAsFixed(1)}%',
                          color: Colors.primaries[index % Colors.primaries.length],
                          radius: 60,
                          titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        );
                      }).toList(),
                      sectionsSpace: 2,
                      centerSpaceRadius: 30,
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              if (pieData.isNotEmpty)
                Wrap(
                  spacing: 8,
                  children: pieData.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    final color = Colors.primaries[index % Colors.primaries.length];
                    return Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(width: 12, height: 12, color: color),
                        const SizedBox(width: 4),
                        Text(item['name'], style: const TextStyle(fontSize: 12)),
                      ],
                    );
                  }).toList(),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // Dialogs
  void _showAllTopSearchesDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Top 100 Trending Searches'),
        content: SizedBox(
          width: double.maxFinite,
          height: 400,
          child: allTopLoading
              ? const Center(child: CircularProgressIndicator())
              : allTopError != null
                  ? Center(child: Text('Error: $allTopError'))
                  : allTopSearches.isEmpty
                      ? _buildNoDataMessage('No trending searches found for the selected time range.')
                      : ListView.builder(
                          itemCount: allTopSearches.length,
                          itemBuilder: (context, index) {
                            final item = allTopSearches[index];
                            return ListTile(
                              leading: Text('${index + 1}.'),
                              title: Text(item['query']),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(item['likes'].toString()),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.search, size: 16),
                                ],
                              ),
                            );
                          },
                        ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAllTopKeywordsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Top 500 Keywords/Hashtags'),
        content: SizedBox(
          width: double.maxFinite,
          height: 400,
          child: allKeywordsLoading
              ? const Center(child: CircularProgressIndicator())
              : allKeywordsError != null
                  ? Center(child: Text('Error: $allKeywordsError'))
                  : allTopKeywords.isEmpty
                      ? _buildNoDataMessage('No keywords found for the selected time range.')
                      : ListView.builder(
                          itemCount: allTopKeywords.length,
                          itemBuilder: (context, index) {
                            final item = allTopKeywords[index];
                            return ListTile(
                              leading: Text('${index + 1}.'),
                              title: Text(item['name']),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(item['count'].toString()),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.trending_up, size: 16),
                                ],
                              ),
                            );
                          },
                        ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}