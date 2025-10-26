import 'dart:io';

void main() async {
  print('🔧 Fixing Flutter analyze issues...');
  
  // Fix test file
  final testFile = File('test/widget_test.dart');
  if (await testFile.exists()) {
    String content = await testFile.readAsString();
    
    // Fix import
    content = content.replaceAll(
      "import '../lib/main.dart';",
      "import 'package:mebelplace_demo/main.dart';"
    );
    
    // Fix const constructors
    content = content.replaceAll(
      'ProviderScope(\n        child: MebelPlaceApp(),\n      ),',
      'const ProviderScope(\n        child: MebelPlaceApp(),\n      ),'
    );
    
    await testFile.writeAsString(content);
    print('✅ Fixed test file');
  }
  
  print('🎉 Fixes applied!');
}
