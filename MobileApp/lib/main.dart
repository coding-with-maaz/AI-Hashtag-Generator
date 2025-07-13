import 'package:flutter/material.dart';
import 'pages/search_page.dart';
import 'pages/trending_keywords_page.dart';
import 'pages/states_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Keyword Tools',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Poppins',
        scaffoldBackgroundColor: const Color(0xFFFFF7F4),
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        textTheme: const TextTheme(
          headlineMedium: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 26,
            color: Color(0xFF1A1A1A),
          ),
          bodyMedium: TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 15,
            color: Color(0xFF3C3C43),
          ),
        ),
        // Use simple page transitions to prevent crashes
        pageTransitionsTheme: const PageTransitionsTheme(
          builders: {
            TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
            TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          },
        ),
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 1; // Default to Search (middle)

  static const List<Widget> _pages = <Widget>[
    StatesPage(),
    SearchPage(),
    TrendingKeywordsPage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF7F4),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          _selectedIndex == 0
              ? 'States'
              : _selectedIndex == 1
                  ? 'Search'
                  : 'Trending',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 26,
            color: Color(0xFF1A1A1A),
            letterSpacing: 0.2,
          ),
        ),
        centerTitle: true,
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: Container(
        height: 72,
        decoration: BoxDecoration(
          color: const Color(0xFFFFF7F4),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
          border: Border.all(
            color: const Color(0xFFE5E5E5),
            width: 1.2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _BottomBarItem(
              icon: Icons.map,
              label: 'States',
              active: _selectedIndex == 0,
              onTap: () => _onItemTapped(0),
              isCenter: false,
            ),
            _BottomBarItem(
              icon: Icons.search,
              label: 'Search',
              active: _selectedIndex == 1,
              onTap: () => _onItemTapped(1),
              isCenter: true,
            ),
            _BottomBarItem(
              icon: Icons.trending_up,
              label: 'Trending',
              active: _selectedIndex == 2,
              onTap: () => _onItemTapped(2),
              isCenter: false,
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomBarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  final bool isCenter;

  const _BottomBarItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    this.isCenter = false,
  });

  @override
  Widget build(BuildContext context) {
    final double iconSize = isCenter ? 34 : 28;
    final double containerSize = isCenter ? 52 : 44;
    final double fontSize = isCenter ? 15 : 13;
    final fontWeight = active ? FontWeight.w700 : FontWeight.w500;
    final Color activeBg = const Color(0xFFFCEEEE);
    final Color inactiveBg = Colors.transparent;
    final Color activeColor = Colors.black;
    final Color inactiveColor = const Color(0xFFB0B0B0);

    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: SizedBox(
          height: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Flexible(
                flex: 2,
                child: Container(
                  width: containerSize,
                  height: containerSize,
                  decoration: BoxDecoration(
                    color: active ? activeBg : inactiveBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Icon(
                      icon,
                      color: active ? activeColor : inactiveColor,
                      size: iconSize,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 2),
              Flexible(
                flex: 1,
                child: Text(
                  label,
                  style: TextStyle(
                    fontWeight: fontWeight,
                    fontSize: fontSize,
                    color: active ? activeColor : inactiveColor,
                    fontFamily: 'Poppins',
                    letterSpacing: 0.1,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}




