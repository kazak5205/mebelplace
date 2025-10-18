import 'package:flutter/material.dart';
import 'glass_welcome_page.dart';
import 'glass_features_page.dart';
import 'glass_get_started_page.dart';

class GlassOnboardingScreen extends StatefulWidget {
  const GlassOnboardingScreen({super.key});

  @override
  State<GlassOnboardingScreen> createState() => _GlassOnboardingScreenState();
}

class _GlassOnboardingScreenState extends State<GlassOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Widget> _pages = const [
    GlassWelcomePage(),
    GlassFeaturesPage(),
    GlassGetStartedPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return PageView.builder(
      controller: _pageController,
      onPageChanged: (index) => setState(() => _currentPage = index),
      itemCount: _pages.length,
      itemBuilder: (context, index) => _pages[index],
    );
  }
}

