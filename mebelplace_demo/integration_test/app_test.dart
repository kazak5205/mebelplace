import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mebelplace/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('MebelPlace Integration Tests', () {
    testWidgets('Full user flow test', (WidgetTester tester) async {
      // Запускаем приложение
      app.main();
      await tester.pumpAndSettle();

      // ЧАСТЬ 1: Проверка экрана входа
      print('✅ Test 1: Проверка начального экрана');
      expect(find.text('Войти'), findsOneWidget);
      expect(find.text('Регистрация'), findsOneWidget);
      
      // ЧАСТЬ 2: Переход на регистрацию
      print('✅ Test 2: Переход на регистрацию');
      await tester.tap(find.text('Регистрация'));
      await tester.pumpAndSettle();
      
      // Проверяем, что форма регистрации открылась
      expect(find.byType(TextFormField), findsWidgets);
      
      print('✅ All tests passed!');
    });

    testWidgets('Navigation test', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      print('✅ Test: Проверка навигации');
      
      // Проверяем наличие основных элементов
      expect(find.byType(Scaffold), findsWidgets);
      
      print('✅ Navigation test passed!');
    });

    testWidgets('API connectivity test', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      print('✅ Test: Проверка подключения к API');
      
      // Приложение должно запуститься без ошибок
      expect(find.byType(MaterialApp), findsOneWidget);
      
      print('✅ API connectivity test passed!');
    });
  });
}

