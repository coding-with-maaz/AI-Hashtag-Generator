import 'package:flutter/material.dart';
import 'country_language_selector.dart';

class SearchForm extends StatefulWidget {
  final Function({
    required String platform,
    required String query,
    String? language,
    String? country,
  }) onSearch;
  final bool loading;

  const SearchForm({
    super.key,
    required this.onSearch,
    required this.loading,
  });

  @override
  State<SearchForm> createState() => _SearchFormState();
}

class _SearchFormState extends State<SearchForm> {
  String selectedPlatform = 'google';
  final TextEditingController queryController = TextEditingController();
  String selectedLanguage = 'en';
  String selectedCountry = 'us';

  final List<Map<String, String>> platforms = [
    {'value': 'google', 'label': 'Google'},
    {'value': 'youtube', 'label': 'YouTube'},
    {'value': 'bing', 'label': 'Bing'},
    {'value': 'playstore', 'label': 'Play Store'},
    {'value': 'appstore', 'label': 'App Store'},
  ];

  void _handleSubmit() {
    if (queryController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a search query'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    widget.onSearch(
      platform: selectedPlatform,
      query: queryController.text.trim(),
      language: selectedLanguage,
      country: selectedCountry,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Keyword Search',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A1A),
              ),
            ),
            const SizedBox(height: 16),
            
            // Platform Selection
            const Text(
              'Platform',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF3C3C43),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: platforms.length,
                itemBuilder: (context, index) {
                  final platform = platforms[index];
                  final isSelected = selectedPlatform == platform['value'];
                  
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          selectedPlatform = platform['value']!;
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFFCEEEE) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? const Color(0xFFFCEEEE) : const Color(0xFFE5E5E5),
                          ),
                        ),
                        child: Text(
                          platform['label']!,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? Colors.black : const Color(0xFF666666),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Query Input
            const Text(
              'Search Query',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF3C3C43),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: queryController,
              decoration: InputDecoration(
                hintText: 'Enter your search query...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFE5E5E5)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFE5E5E5)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFFCEEEE), width: 2),
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onSubmitted: (_) => _handleSubmit(),
            ),
            
            const SizedBox(height: 16),
            
            // Country Language Selector
            CountryLanguageSelector(
              language: selectedLanguage,
              country: selectedCountry,
              onLanguageChange: (language) {
                setState(() {
                  selectedLanguage = language;
                });
              },
              onCountryChange: (country) {
                setState(() {
                  selectedCountry = country;
                });
              },
              disabled: widget.loading,
            ),
            
            const SizedBox(height: 24),
            
            // Search Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: widget.loading ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFCEEEE),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: widget.loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                        ),
                      )
                    : const Text(
                        'Search',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    queryController.dispose();
    super.dispose();
  }
} 