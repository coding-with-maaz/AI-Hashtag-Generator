import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/search_response.dart';

class SearchResults extends StatelessWidget {
  final SearchResponse? results;
  final bool loading;
  final VoidCallback onSave;

  const SearchResults({
    super.key,
    this.results,
    required this.loading,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFCEEEE)),
        ),
      );
    }

    if (results == null) {
      return const Center(
        child: Text(
          'No search results yet',
          style: TextStyle(
            fontSize: 16,
            color: Color(0xFF666666),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with save button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                'Results for "${results!.data.query}"',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1A1A),
                ),
              ),
            ),
            ElevatedButton.icon(
              onPressed: onSave,
              icon: const Icon(Icons.save, size: 16),
              label: const Text('Save'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFCEEEE),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Results sections - use Flexible instead of Expanded
        Flexible(
          child: SingleChildScrollView(
            child: Column(
              children: [
                _ResultSection(
                  title: 'Keywords',
                  items: results!.data.keywords,
                  icon: Icons.key,
                  color: Colors.blue,
                ),
                const SizedBox(height: 16),
                _ResultSection(
                  title: 'Hashtags',
                  items: results!.data.hashtags,
                  icon: Icons.tag,
                  color: Colors.purple,
                ),
                const SizedBox(height: 16),
                _ResultSection(
                  title: 'Questions',
                  items: results!.data.questions,
                  icon: Icons.question_mark,
                  color: Colors.orange,
                ),
                const SizedBox(height: 16),
                _ResultSection(
                  title: 'Prepositions',
                  items: results!.data.prepositions,
                  icon: Icons.link,
                  color: Colors.green,
                ),
                if (results!.data.generatedHashtags.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _ResultSection(
                    title: 'Generated Hashtags',
                    items: results!.data.generatedHashtags,
                    icon: Icons.auto_awesome,
                    color: Colors.pink,
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ResultSection extends StatelessWidget {
  final String title;
  final List<String> items;
  final IconData icon;
  final Color color;

  const _ResultSection({
    required this.title,
    required this.items,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
                const Spacer(),
                Text(
                  '${items.length} items',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF666666),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: items.map((item) => _ResultChip(
                text: item,
                color: color,
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResultChip extends StatelessWidget {
  final String text;
  final Color color;

  const _ResultChip({
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Clipboard.setData(ClipboardData(text: text));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Copied "$text" to clipboard'),
            duration: const Duration(seconds: 2),
            backgroundColor: Colors.green,
          ),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.copy,
              size: 14,
              color: color,
            ),
          ],
        ),
      ),
    );
  }
} 