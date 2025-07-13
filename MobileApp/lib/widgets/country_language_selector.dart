import 'package:flutter/material.dart';
import 'dart:convert';

class CountryLanguageSelector extends StatefulWidget {
  final String language;
  final String country;
  final Function(String) onLanguageChange;
  final Function(String) onCountryChange;
  final bool disabled;

  const CountryLanguageSelector({
    super.key,
    required this.language,
    required this.country,
    required this.onLanguageChange,
    required this.onCountryChange,
    this.disabled = false,
  });

  @override
  State<CountryLanguageSelector> createState() => _CountryLanguageSelectorState();
}

class _CountryLanguageSelectorState extends State<CountryLanguageSelector> {
  List<Map<String, dynamic>> countryData = [];
  List<String> availableLanguages = [];
  List<String> availableCountries = [];
  List<String> filteredLanguages = []; // Languages for selected country
  Map<String, String> languageNameToCode = {};
  Map<String, String> languageCodeToName = {};
  Map<String, String> countryNameToCode = {};
  Map<String, String> countryCodeToName = {};
  String selectedLanguage = 'en';
  String selectedCountry = 'us';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    selectedLanguage = widget.language;
    selectedCountry = widget.country;
    _loadCountryData();
  }

  Future<void> _loadCountryData() async {
    try {
      final String jsonString = await DefaultAssetBundle.of(context)
          .loadString('assets/country-by-languages.json');
      final List<dynamic> jsonData = json.decode(jsonString);
      countryData = jsonData.cast<Map<String, dynamic>>();

      Set<String> languages = {};
      Set<String> countries = {};
      
      // Comprehensive language code mapping
      Map<String, String> langNameToCode = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Portuguese': 'pt',
        'Russian': 'ru',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Bengali': 'bn',
        'Dutch': 'nl',
        'Swedish': 'sv',
        'Norwegian': 'no',
        'Danish': 'da',
        'Finnish': 'fi',
        'Polish': 'pl',
        'Czech': 'cs',
        'Hungarian': 'hu',
        'Romanian': 'ro',
        'Bulgarian': 'bg',
        'Greek': 'el',
        'Turkish': 'tr',
        'Hebrew': 'he',
        'Thai': 'th',
        'Vietnamese': 'vi',
        'Indonesian': 'id',
        'Malay': 'ms',
        'Filipino': 'fil',
        'Ukrainian': 'uk',
        'Serbian': 'sr',
        'Croatian': 'hr',
        'Slovenian': 'sl',
        'Slovak': 'sk',
        'Lithuanian': 'lt',
        'Latvian': 'lv',
        'Estonian': 'et',
        'Icelandic': 'is',
        'Irish': 'ga',
        'Welsh': 'cy',
        'Catalan': 'ca',
        'Basque': 'eu',
        'Galician': 'gl',
        'Maltese': 'mt',
        'Luxembourgish': 'lb',
        'Faroese': 'fo',
        'Greenlandic': 'kl',
        'Sami': 'se',
        'Albanian': 'sq',
        'Macedonian': 'mk',
        'Bosnian': 'bs',
        'Montenegrin': 'cnr',
        'Kosovan': 'sq',
        'Moldovan': 'ro',
        'Georgian': 'ka',
        'Armenian': 'hy',
        'Azerbaijani': 'az',
        'Kazakh': 'kk',
        'Kyrgyz': 'ky',
        'Uzbek': 'uz',
        'Turkmen': 'tk',
        'Tajik': 'tg',
        'Persian': 'fa',
        'Kurdish': 'ku',
        'Pashto': 'ps',
        'Dari': 'prs',
        'Urdu': 'ur',
        'Punjabi': 'pa',
        'Gujarati': 'gu',
        'Marathi': 'mr',
        'Kannada': 'kn',
        'Telugu': 'te',
        'Tamil': 'ta',
        'Malayalam': 'ml',
        'Sinhala': 'si',
        'Nepali': 'ne',
        'Sinhalese': 'si',
        'Burmese': 'my',
        'Khmer': 'km',
        'Lao': 'lo',
        'Mongolian': 'mn',
        'Tibetan': 'bo',
        'Uyghur': 'ug',
        'Balochi': 'bal',
        'Dari': 'prs',
        'Pashto': 'ps',
        'Turkmenian': 'tk',
        'Uzbek': 'uz',
        'Ambo': 'amb',
        'Chokwe': 'cjk',
        'Kongo': 'kon',
        'Luchazi': 'lch',
        'Luimbe-nganguela': 'lng',
        'Luvale': 'lue',
        'Mbundu': 'umb',
        'Nyaneka-nkhumbi': 'nyk',
        'Ovimbundu': 'umb',
        'Albaniana': 'sq',
        'Macedonian': 'mk',
        'Papiamento': 'pap',
        'Indian Languages': 'ind',
        'Creole English': 'cpe',
        'Canton Chinese': 'yue',
        'Serbo-Croatian': 'hbs',
        'Slovene': 'sl',
        'Lezgian': 'lez',
        'Kirundi': 'run',
        'Swahili': 'swa',
        'Adja': 'aja',
        'Aizo': 'aiz',
        'Bariba': 'bba',
        'Fon': 'fon',
        'Ful': 'ful',
        'Joruba': 'yor',
        'Somba': 'som',
        'Busansi': 'bus',
        'Dagara': 'dag',
        'Dyula': 'dyu',
        'Gurma': 'gur',
        'Mossi': 'mos',
        'Chakma': 'ccp',
        'Garo': 'grt',
        'Khasi': 'kha',
        'Marma': 'rmz',
        'Santhali': 'sat',
        'Tripuri': 'trp',
        'Bulgariana': 'bg',
        'Romani': 'rom',
        'Armenian': 'hy',
        'Azerbaijani': 'az',
        'Russian': 'ru',
        'Kirundi': 'run',
        'Swahili': 'swa',
        'Arabic': 'ar',
        'Dutch': 'nl',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Turkish': 'tr',
        'Adja': 'aja',
        'Aizo': 'aiz',
        'Bariba': 'bba',
        'Fon': 'fon',
        'Ful': 'ful',
        'Joruba': 'yor',
        'Somba': 'som',
        'Busansi': 'bus',
        'Dagara': 'dag',
        'Dyula': 'dyu',
        'Gurma': 'gur',
        'Mossi': 'mos',
        'Bengali': 'bn',
        'Chakma': 'ccp',
        'Garo': 'grt',
        'Khasi': 'kha',
        'Marma': 'rmz',
        'Santhali': 'sat',
        'Tripuri': 'trp',
        'Bulgariana': 'bg',
        'Macedonian': 'mk',
        'Romani': 'rom',
        'Turkish': 'tr',
      };
      
      Map<String, String> langCodeToName = {};
      langNameToCode.forEach((name, code) {
        langCodeToName[code] = name;
      });

      // Build comprehensive country code mapping from the actual data
      Map<String, String> ctryNameToCode = {};
      Map<String, String> ctryCodeToName = {};
      
      // Add common country mappings
      Map<String, String> commonCountries = {
        'United States': 'us',
        'United Kingdom': 'gb',
        'Canada': 'ca',
        'Australia': 'au',
        'Germany': 'de',
        'France': 'fr',
        'Spain': 'es',
        'Italy': 'it',
        'Japan': 'jp',
        'Korea': 'kr',
        'Brazil': 'br',
        'Mexico': 'mx',
        'India': 'in',
        'China': 'cn',
        'Russia': 'ru',
        'Netherlands': 'nl',
        'Belgium': 'be',
        'Switzerland': 'ch',
        'Austria': 'at',
        'Sweden': 'se',
        'Norway': 'no',
        'Denmark': 'dk',
        'Finland': 'fi',
        'Poland': 'pl',
        'Czech Republic': 'cz',
        'Hungary': 'hu',
        'Romania': 'ro',
        'Bulgaria': 'bg',
        'Greece': 'gr',
        'Turkey': 'tr',
        'Portugal': 'pt',
        'Ireland': 'ie',
        'New Zealand': 'nz',
        'South Africa': 'za',
        'Argentina': 'ar',
        'Chile': 'cl',
        'Colombia': 'co',
        'Peru': 'pe',
        'Venezuela': 've',
        'Uruguay': 'uy',
        'Paraguay': 'py',
        'Ecuador': 'ec',
        'Bolivia': 'bo',
        'Guyana': 'gy',
        'Suriname': 'sr',
        'French Guiana': 'gf',
        'Falkland Islands': 'fk',
        'South Georgia': 'gs',
        'Antarctica': 'aq',
        'Greenland': 'gl',
        'Iceland': 'is',
        'Faroe Islands': 'fo',
        'Svalbard': 'sj',
        'Jan Mayen': 'sj',
        'Bouvet Island': 'bv',
        'Heard Island': 'hm',
        'French Southern Territories': 'tf',
        'South Sandwich Islands': 'gs',
        'British Indian Ocean Territory': 'io',
        'Christmas Island': 'cx',
        'Cocos Islands': 'cc',
        'Norfolk Island': 'nf',
        'Pitcairn': 'pn',
        'Tokelau': 'tk',
        'Niue': 'nu',
        'Cook Islands': 'ck',
        'Wallis and Futuna': 'wf',
        'French Polynesia': 'pf',
        'New Caledonia': 'nc',
        'Vanuatu': 'vu',
        'Solomon Islands': 'sb',
        'Papua New Guinea': 'pg',
        'Fiji': 'fj',
        'Tonga': 'to',
        'Samoa': 'ws',
        'American Samoa': 'as',
        'Northern Mariana Islands': 'mp',
        'Guam': 'gu',
        'Micronesia': 'fm',
        'Marshall Islands': 'mh',
        'Palau': 'pw',
        'Nauru': 'nr',
        'Kiribati': 'ki',
        'Tuvalu': 'tv',
        'Maldives': 'mv',
        'Sri Lanka': 'lk',
        'Bangladesh': 'bd',
        'Myanmar': 'mm',
        'Thailand': 'th',
        'Cambodia': 'kh',
        'Laos': 'la',
        'Vietnam': 'vn',
        'Malaysia': 'my',
        'Singapore': 'sg',
        'Brunei': 'bn',
        'Philippines': 'ph',
        'Indonesia': 'id',
        'East Timor': 'tl',
        'Aruba': 'aw',
        'Afghanistan': 'af',
        'Angola': 'ao',
        'Anguilla': 'ai',
        'Albania': 'al',
        'Andorra': 'ad',
        'Netherlands Antilles': 'an',
        'United Arab Emirates': 'ae',
        'Armenia': 'am',
        'American Samoa': 'as',
        'Antigua and Barbuda': 'ag',
        'Azerbaijan': 'az',
        'Burundi': 'bi',
        'Benin': 'bj',
        'Burkina Faso': 'bf',
      };

      // Add common countries to the mapping
      ctryNameToCode.addAll(commonCountries);
      commonCountries.forEach((name, code) {
        ctryCodeToName[code] = name;
      });

      // Process country data to build language and country lists
      for (var country in countryData) {
        String countryName = country['country'];
        countries.add(countryName);
        
        // Generate country code if not already mapped
        if (!ctryNameToCode.containsKey(countryName)) {
          String countryCode = _generateCountryCode(countryName);
          ctryNameToCode[countryName] = countryCode;
          ctryCodeToName[countryCode] = countryName;
        }
        
        List<dynamic> countryLanguages = country['languages'];
        for (var language in countryLanguages) {
          languages.add(language);
        }
      }

      setState(() {
        availableLanguages = languages.toList()..sort();
        availableCountries = countries.toList()..sort();
        languageNameToCode = langNameToCode;
        languageCodeToName = langCodeToName;
        countryNameToCode = ctryNameToCode;
        countryCodeToName = ctryCodeToName;
        isLoading = false;
      });

      // Update filtered languages for the selected country
      _updateFilteredLanguages();
    } catch (e) {
      print('Error loading country data: $e');
      setState(() {
        availableLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
        availableCountries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'];
        languageNameToCode = {'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 'Chinese': 'zh'};
        languageCodeToName = {'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'zh': 'Chinese'};
        countryNameToCode = {'United States': 'us', 'United Kingdom': 'gb', 'Canada': 'ca', 'Australia': 'au', 'Germany': 'de'};
        countryCodeToName = {'us': 'United States', 'gb': 'United Kingdom', 'ca': 'Canada', 'au': 'Australia', 'de': 'Germany'};
        isLoading = false;
      });
      _updateFilteredLanguages();
    }
  }

  // Helper function to generate country codes for unmapped countries
  String _generateCountryCode(String countryName) {
    // Remove common words and get first letters
    String cleanName = countryName
        .replaceAll(RegExp(r'\b(and|of|the|islands|territories?)\b', caseSensitive: false), '')
        .replaceAll(RegExp(r'\s+'), '')
        .toLowerCase();
    
    if (cleanName.length >= 2) {
      return cleanName.substring(0, 2);
    } else if (cleanName.length == 1) {
      return cleanName + 'x';
    } else {
      return 'xx';
    }
  }

  void _updateFilteredLanguages() {
    String selectedCountryName = _getCountryName(selectedCountry);
    print('Selected country: $selectedCountryName (code: $selectedCountry)');
    
    // Find the country data for the selected country
    var countryInfo = countryData.firstWhere(
      (country) => country['country'] == selectedCountryName,
      orElse: () => {'languages': ['English']},
    );
    
    List<dynamic> countryLanguages = countryInfo['languages'];
    List<String> languagesForCountry = countryLanguages.cast<String>();
    print('Languages for $selectedCountryName: $languagesForCountry');
    
    setState(() {
      // Show languages for the selected country, but also include common languages
      Set<String> allLanguages = Set<String>.from(languagesForCountry);
      
      // Add common languages that are always available
      allLanguages.addAll(['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic']);
      
      filteredLanguages = allLanguages.toList()..sort();
      print('Available languages: $filteredLanguages');
      
      // If current selected language is not available in the selected country,
      // keep the current language (don't auto-change)
      String currentLanguageName = _getLanguageName(selectedLanguage);
      if (!filteredLanguages.contains(currentLanguageName)) {
        // Add the current language to the list if it's not there
        filteredLanguages.add(currentLanguageName);
        filteredLanguages.sort();
        print('Added current language: $currentLanguageName');
      }
    });
  }

  String _getLanguageCode(String languageName) {
    return languageNameToCode[languageName] ?? 'en';
  }

  String _getLanguageName(String languageCode) {
    return languageCodeToName[languageCode] ?? languageCode;
  }

  String _getCountryCode(String countryName) {
    String code = countryNameToCode[countryName] ?? 'us';
    print('Country code for "$countryName": $code');
    return code;
  }

  String _getCountryName(String countryCode) {
    String name = countryCodeToName[countryCode] ?? countryCode;
    print('Country name for "$countryCode": $name');
    return name;
  }

  Widget _buildSearchableDropdown({
    required String value,
    required List<String> items,
    required Function(String?) onChanged,
    required String searchHint,
    required bool disabled,
    bool isLanguage = false,
  }) {
    return InkWell(
      onTap: disabled
          ? null
          : () => _showSearchableDialog(
                context,
                value,
                items,
                (selectedName) {
                  if (selectedName != null) {
                    print('Selected: $selectedName (isLanguage: $isLanguage)');
                    // Always update the code, not just the name
                    if (isLanguage) {
                      final code = languageNameToCode[selectedName] ?? 'en';
                      print('Language code: $code');
                      setState(() {
                        selectedLanguage = code;
                      });
                      widget.onLanguageChange(code);
                    } else {
                      final code = countryNameToCode[selectedName] ?? 'us';
                      print('Country code: $code');
                      setState(() {
                        selectedCountry = code;
                      });
                      widget.onCountryChange(code);
                      // Update filtered languages when country changes
                      _updateFilteredLanguages();
                    }
                  }
                },
                searchHint,
              ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE5E5E5)),
          borderRadius: BorderRadius.circular(8),
          color: Colors.white,
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                value,
                style: const TextStyle(fontSize: 12),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(
              Icons.arrow_drop_down,
              size: 16,
              color: disabled ? Colors.grey : Colors.black54,
            ),
          ],
        ),
      ),
    );
  }

  void _showSearchableDialog(
    BuildContext context,
    String currentValue,
    List<String> items,
    Function(String?) onChanged,
    String searchHint,
  ) {
    String searchQuery = '';
    List<String> filteredItems = items;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setState) {
            return AlertDialog(
              title: Text(searchHint),
              content: SizedBox(
                width: double.maxFinite,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      autofocus: true,
                      decoration: InputDecoration(
                        hintText: searchHint,
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onChanged: (value) {
                        setState(() {
                          searchQuery = value;
                          filteredItems = items
                              .where((item) => item.toLowerCase().contains(value.toLowerCase()))
                              .toList();
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 200,
                      child: ListView.builder(
                        itemCount: filteredItems.length,
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          return ListTile(
                            title: Text(item),
                            selected: item == currentValue,
                            onTap: () {
                              onChanged(item);
                              Navigator.of(context).pop();
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Language & Country',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF3C3C43),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Language',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF666666),
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildSearchableDropdown(
                    value: _getLanguageName(selectedLanguage),
                    items: filteredLanguages.isNotEmpty ? filteredLanguages : availableLanguages,
                    onChanged: (_) {}, // handled in the dialog
                    searchHint: 'Search languages...',
                    disabled: widget.disabled,
                    isLanguage: true,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Country',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF666666),
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildSearchableDropdown(
                    value: _getCountryName(selectedCountry),
                    items: availableCountries,
                    onChanged: (_) {}, // handled in the dialog
                    searchHint: 'Search countries...',
                    disabled: widget.disabled,
                    isLanguage: false,
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
} 