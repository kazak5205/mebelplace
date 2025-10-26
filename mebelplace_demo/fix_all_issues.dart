import 'dart:io';

void main() async {
  print('🔧 Fixing all Flutter analyze issues...');
  
  // List of files to fix
  final filesToFix = [
    'lib/presentation/pages/video/create_video_page.dart',
    'lib/presentation/widgets/loading_widget.dart',
    'lib/presentation/widgets/tiktok_video_player.dart',
    'test/widget_test.dart',
  ];
  
  for (final filePath in filesToFix) {
    final file = File(filePath);
    if (await file.exists()) {
      String content = await file.readAsString();
      
      // Fix const constructors
      content = content.replaceAllMapped(
        RegExp(r'(\w+)\(([^)]*)\)'),
        (match) {
          final className = match.group(1);
          final params = match.group(2);
          
          // Skip if already const or if it's a function call
          if (match.group(0)!.startsWith('const ') || 
              match.group(0)!.contains('(') && !match.group(0)!.startsWith(RegExp(r'[A-Z]'))) {
            return match.group(0)!;
          }
          
          // Add const to common constructors
          if (className == 'Icon' || 
              className == 'SizedBox' || 
              className == 'Text' ||
              className == 'Container' ||
              className == 'Padding' ||
              className == 'EdgeInsets' ||
              className == 'BorderRadius' ||
              className == 'BorderSide' ||
              className == 'RoundedRectangleBorder' ||
              className == 'ProviderScope' ||
              className == 'MebelPlaceApp') {
            return 'const $className($params)';
          }
          
          return match.group(0)!;
        },
      );
      
      // Fix withOpacity to withValues
      content = content.replaceAllMapped(
        RegExp(r'\.withOpacity\(([^)]+)\)'),
        (match) {
          final opacity = match.group(1);
          return '.withValues(alpha: $opacity)';
        },
      );
      
      // Fix SizedBox instead of Container for whitespace
      content = content.replaceAllMapped(
        RegExp(r'Container\(\s*width:\s*(\d+\.?\d*)\s*,\s*height:\s*(\d+\.?\d*)\s*,\s*\)'),
        (match) {
          final width = match.group(1);
          final height = match.group(2);
          return 'SizedBox(width: $width, height: $height)';
        },
      );
      
      await file.writeAsString(content);
      print('✅ Fixed $filePath');
    }
  }
  
  print('🎉 All fixes applied!');
}
