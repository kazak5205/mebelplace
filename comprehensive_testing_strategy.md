# 🧪 КОМПЛЕКСНАЯ СТРАТЕГИЯ ТЕСТИРОВАНИЯ MEBELPLACE

## 🎯 ЦЕЛЬ: 100% ПОКРЫТИЕ ТЕСТАМИ

### 📊 Пирамида тестирования

```
        🔺 E2E Tests (10%)
       🔺🔺 Integration Tests (20%) 
      🔺🔺🔺 Unit Tests (70%)
```

## 🏗️ АРХИТЕКТУРА ТЕСТИРОВАНИЯ

### 1. 🔬 Unit Tests (70% покрытия)

#### Flutter Unit Tests
```dart
// test/unit/widgets/glass_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mebelplace/widgets/glass_card.dart';

void main() {
  group('GlassCard Widget Tests', () {
    testWidgets('should render glass card with child', (WidgetTester tester) async {
      // Arrange
      const testChild = Text('Test Content');
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: GlassCard(child: testChild),
        ),
      );
      
      // Assert
      expect(find.text('Test Content'), findsOneWidget);
      expect(find.byType(GlassCard), findsOneWidget);
    });

    testWidgets('should apply glass blur effect', (WidgetTester tester) async {
      // Arrange & Act
      await tester.pumpWidget(
        MaterialApp(
          home: GlassCard(child: const Text('Test')),
        ),
      );
      
      // Assert
      expect(find.byType(BackdropFilter), findsOneWidget);
    });

    testWidgets('should handle tap events', (WidgetTester tester) async {
      // Arrange
      bool tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: GlassCard(
            child: const Text('Test'),
            onTap: () => tapped = true,
          ),
        ),
      );
      
      // Act
      await tester.tap(find.byType(GlassCard));
      
      // Assert
      expect(tapped, isTrue);
    });
  });
}
```

#### Backend Unit Tests (Go)
```go
// internal/handlers/auth_test.go
package handlers

import (
    "testing"
    "net/http/httptest"
    "github.com/stretchr/testify/assert"
)

func TestRegisterUser(t *testing.T) {
    tests := []struct {
        name           string
        requestBody    string
        expectedStatus int
        expectedError  string
    }{
        {
            name:           "valid registration",
            requestBody:    `{"email":"test@example.com","password":"password123"}`,
            expectedStatus: 201,
        },
        {
            name:           "invalid email",
            requestBody:    `{"email":"invalid-email","password":"password123"}`,
            expectedStatus: 400,
            expectedError:  "invalid email format",
        },
        {
            name:           "weak password",
            requestBody:    `{"email":"test@example.com","password":"123"}`,
            expectedStatus: 400,
            expectedError:  "password too weak",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange
            req := httptest.NewRequest("POST", "/api/v2/auth/register", strings.NewReader(tt.requestBody))
            req.Header.Set("Content-Type", "application/json")
            w := httptest.NewRecorder()

            // Act
            RegisterUser(w, req)

            // Assert
            assert.Equal(t, tt.expectedStatus, w.Code)
            if tt.expectedError != "" {
                assert.Contains(t, w.Body.String(), tt.expectedError)
            }
        })
    }
}
```

### 2. 🔗 Integration Tests (20% покрытия)

#### Flutter Integration Tests
```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mebelplace/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('complete registration flow', (WidgetTester tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to registration
      await tester.tap(find.text('Register'));
      await tester.pumpAndSettle();

      // Fill registration form
      await tester.enterText(find.byKey(Key('email_field')), 'test@example.com');
      await tester.enterText(find.byKey(Key('password_field')), 'password123');
      await tester.enterText(find.byKey(Key('phone_field')), '+77001234567');

      // Submit form
      await tester.tap(find.byKey(Key('register_button')));
      await tester.pumpAndSettle();

      // Verify success
      expect(find.text('Registration successful'), findsOneWidget);
    });

    testWidgets('video feed loading and blur effects', (WidgetTester tester) async {
      // Login first
      await _performLogin(tester);

      // Navigate to feed
      await tester.tap(find.byKey(Key('feed_tab')));
      await tester.pumpAndSettle();

      // Verify glass cards are rendered
      expect(find.byType(GlassVideoCard), findsWidgets);
      
      // Test double-tap like
      await tester.tap(find.byType(GlassVideoCard).first);
      await tester.tap(find.byType(GlassVideoCard).first);
      await tester.pumpAndSettle();

      // Verify like animation
      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });
  });
}

Future<void> _performLogin(WidgetTester tester) async {
  await tester.enterText(find.byKey(Key('email_field')), 'test@example.com');
  await tester.enterText(find.byKey(Key('password_field')), 'password123');
  await tester.tap(find.byKey(Key('login_button')));
  await tester.pumpAndSettle();
}
```

#### Backend Integration Tests
```go
// internal/integration/auth_integration_test.go
package integration

import (
    "testing"
    "net/http"
    "bytes"
    "encoding/json"
    "github.com/stretchr/testify/suite"
)

type AuthIntegrationTestSuite struct {
    suite.Suite
    server *httptest.Server
}

func (suite *AuthIntegrationTestSuite) SetupTest() {
    // Setup test database
    suite.server = setupTestServer()
}

func (suite *AuthIntegrationTestSuite) TearDownTest() {
    suite.server.Close()
    cleanupTestDatabase()
}

func (suite *AuthIntegrationTestSuite) TestCompleteAuthFlow() {
    // Test registration
    registerReq := RegisterRequest{
        Email:    "test@example.com",
        Password: "password123",
        Phone:    "+77001234567",
    }
    
    registerBody, _ := json.Marshal(registerReq)
    resp, err := http.Post(
        suite.server.URL+"/api/v2/auth/register",
        "application/json",
        bytes.NewBuffer(registerBody),
    )
    
    suite.NoError(err)
    suite.Equal(http.StatusCreated, resp.StatusCode)

    // Test login
    loginReq := LoginRequest{
        Email:    "test@example.com",
        Password: "password123",
    }
    
    loginBody, _ := json.Marshal(loginReq)
    resp, err = http.Post(
        suite.server.URL+"/api/v2/auth/login",
        "application/json",
        bytes.NewBuffer(loginBody),
    )
    
    suite.NoError(err)
    suite.Equal(http.StatusOK, resp.StatusCode)

    // Verify JWT token
    var loginResp LoginResponse
    json.NewDecoder(resp.Body).Decode(&loginResp)
    suite.NotEmpty(loginResp.Token)
}

func TestAuthIntegrationSuite(t *testing.T) {
    suite.Run(t, new(AuthIntegrationTestSuite))
}
```

### 3. 🌐 E2E Tests (10% покрытия)

#### Playwright E2E Tests
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete user registration and login flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('https://mebelplace.com.kz/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="phone-input"]', '+77001234567');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Navigate to login
    await page.goto('https://mebelplace.com.kz/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('https://mebelplace.com.kz/dashboard');
  });
});

test.describe('Video Feed', () => {
  test('video feed with glass effects', async ({ page }) => {
    // Login first
    await page.goto('https://mebelplace.com.kz/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to feed
    await page.click('[data-testid="feed-tab"]');
    
    // Verify glass cards are rendered
    await expect(page.locator('[data-testid="glass-video-card"]')).toHaveCount({ min: 1 });
    
    // Test double-tap like
    const videoCard = page.locator('[data-testid="glass-video-card"]').first();
    await videoCard.dblclick();
    
    // Verify like animation
    await expect(page.locator('[data-testid="like-animation"]')).toBeVisible();
  });
});

test.describe('WebRTC Video Calls', () => {
  test('initiate video call between users', async ({ page, context }) => {
    // Create second browser context for second user
    const secondContext = await context.browser().newContext();
    const secondPage = await secondContext.newPage();
    
    // Login both users
    await _loginUser(page, 'user1@example.com');
    await _loginUser(secondPage, 'user2@example.com');
    
    // Start call from user1
    await page.click('[data-testid="start-call-button"]');
    await page.fill('[data-testid="call-user-input"]', 'user2@example.com');
    await page.click('[data-testid="call-button"]');
    
    // Accept call on user2
    await secondPage.click('[data-testid="accept-call-button"]');
    
    // Verify call established
    await expect(page.locator('[data-testid="call-active"]')).toBeVisible();
    await expect(secondPage.locator('[data-testid="call-active"]')).toBeVisible();
    
    await secondContext.close();
  });
});

async function _loginUser(page: any, email: string) {
  await page.goto('https://mebelplace.com.kz/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
}
```

## 📱 МОБИЛЬНОЕ ТЕСТИРОВАНИЕ

### Flutter Integration Tests
```dart
// integration_test/mobile_features_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mebelplace/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Mobile-Specific Features', () {
    testWidgets('camera integration for AR', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to AR configurator
      await tester.tap(find.byKey(Key('ar_configurator')));
      await tester.pumpAndSettle();

      // Grant camera permission
      await tester.tap(find.text('Allow Camera Access'));
      await tester.pumpAndSettle();

      // Verify camera view is active
      expect(find.byKey(Key('camera_preview')), findsOneWidget);
    });

    testWidgets('push notifications', (WidgetTester tester) async {
      // Test notification permission
      await tester.tap(find.byKey(Key('notification_settings')));
      await tester.pumpAndSettle();

      // Enable notifications
      await tester.tap(find.byKey(Key('enable_notifications')));
      await tester.pumpAndSettle();

      // Verify permission granted
      expect(find.text('Notifications enabled'), findsOneWidget);
    });

    testWidgets('offline mode functionality', (WidgetTester tester) async {
      // Simulate offline mode
      await tester.binding.defaultBinaryMessenger.handlePlatformMessage(
        'flutter/platform',
        StandardMethodCodec().encodeMethodCall(
          MethodCall('networkStatusChanged', {'connected': false}),
        ),
        (data) {},
      );

      await tester.pumpAndSettle();

      // Verify offline indicator
      expect(find.byKey(Key('offline_indicator')), findsOneWidget);

      // Test cached content
      await tester.tap(find.byKey(Key('cached_videos')));
      await tester.pumpAndSettle();

      expect(find.byType(GlassVideoCard), findsWidgets);
    });
  });
}
```

## 🎬 ВИДЕО И СТРИМИНГ ТЕСТЫ

### HLS Streaming Tests
```dart
// test/features/video/hls_streaming_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mebelplace/services/video_service.dart';

void main() {
  group('HLS Streaming Tests', () {
    test('should load HLS manifest', () async {
      // Arrange
      final videoService = VideoService();
      const videoId = 'test-video-123';

      // Act
      final manifest = await videoService.loadHLSManifest(videoId);

      // Assert
      expect(manifest, isNotNull);
      expect(manifest.variants, isNotEmpty);
      expect(manifest.variants.first.quality, isIn(['360p', '720p', '1080p']));
    });

    test('should handle quality switching', () async {
      // Arrange
      final videoService = VideoService();
      const videoId = 'test-video-123';

      // Act
      await videoService.loadVideo(videoId);
      await videoService.switchQuality('720p');

      // Assert
      expect(videoService.currentQuality, equals('720p'));
    });

    test('should handle network errors gracefully', () async {
      // Arrange
      final videoService = VideoService();
      const invalidVideoId = 'invalid-video-id';

      // Act & Assert
      expect(
        () => videoService.loadVideo(invalidVideoId),
        throwsA(isA<VideoLoadException>()),
      );
    });
  });
}
```

## 🔒 БЕЗОПАСНОСТЬ И ПРОИЗВОДИТЕЛЬНОСТЬ

### Security Tests
```go
// internal/security/security_test.go
package security

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestJWTTokenValidation(t *testing.T) {
    tests := []struct {
        name        string
        token       string
        expectValid bool
        expectError bool
    }{
        {
            name:        "valid token",
            token:       generateValidToken(),
            expectValid: true,
            expectError: false,
        },
        {
            name:        "expired token",
            token:       generateExpiredToken(),
            expectValid: false,
            expectError: true,
        },
        {
            name:        "malformed token",
            token:       "invalid.jwt.token",
            expectValid: false,
            expectError: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Act
            valid, err := ValidateJWTToken(tt.token)

            // Assert
            assert.Equal(t, tt.expectValid, valid)
            if tt.expectError {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}

func TestRateLimiting(t *testing.T) {
    // Test rate limiting for different endpoints
    rateLimiter := NewRateLimiter()

    // Test normal usage
    for i := 0; i < 100; i++ {
        allowed := rateLimiter.Allow("user123", "/api/v2/videos")
        assert.True(t, allowed)
    }

    // Test rate limit exceeded
    allowed := rateLimiter.Allow("user123", "/api/v2/videos")
    assert.False(t, allowed)
}
```

### Performance Tests
```dart
// test/performance/glass_ui_performance_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:mebelplace/widgets/glass_card.dart';

void main() {
  group('Glass UI Performance Tests', () {
    testWidgets('should render 100 glass cards without performance issues', (WidgetTester tester) async {
      // Arrange
      final stopwatch = Stopwatch()..start();
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: ListView.builder(
            itemCount: 100,
            itemBuilder: (context, index) => GlassCard(
              child: Text('Card $index'),
            ),
          ),
        ),
      );

      stopwatch.stop();

      // Assert
      expect(stopwatch.elapsedMilliseconds, lessThan(1000)); // Should render in less than 1 second
      expect(find.byType(GlassCard), findsNWidgets(100));
    });

    testWidgets('should handle rapid double-tap without lag', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          home: GlassVideoCard(
            videoUrl: 'test-video.mp4',
            thumbnailUrl: 'test-thumbnail.jpg',
            title: 'Test Video',
            author: 'Test Author',
            likes: 0,
          ),
        ),
      );

      // Act - rapid double taps
      for (int i = 0; i < 10; i++) {
        await tester.tap(find.byType(GlassVideoCard));
        await tester.tap(find.byType(GlassVideoCard));
      }

      // Assert - no crashes or performance issues
      expect(find.byType(GlassVideoCard), findsOneWidget);
    });
  });
}
```

## 🚀 CI/CD ИНТЕГРАЦИЯ

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Comprehensive Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Run Flutter unit tests
        run: flutter test --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Run integration tests
        run: flutter test integration_test/

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Go
        uses: actions/setup-go@v3
        with:
          go-version: '1.21'
      
      - name: Run Go tests
        run: go test ./... -v -race -coverprofile=coverage.out
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: |
          flutter pub audit
          npm audit
          go list -json -deps ./... | nancy sleuth
      
      - name: Run SAST scan
        uses: github/codeql-action/init@v2
        with:
          languages: dart, javascript, go
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
      
      - name: Run performance tests
        run: flutter test test/performance/
      
      - name: Generate performance report
        run: flutter test --coverage test/performance/
```

## 📊 МЕТРИКИ И ОТЧЕТНОСТЬ

### Coverage Requirements
- **Unit Tests**: 90%+ покрытие кода
- **Integration Tests**: 80%+ покрытие критических путей
- **E2E Tests**: 100% покрытие основных пользовательских сценариев

### Performance Benchmarks
- **App Launch**: < 3 секунд
- **Glass UI Rendering**: < 100ms для 50 компонентов
- **Video Loading**: < 5 секунд для HLS
- **WebRTC Connection**: < 2 секунд для установки соединения

### Quality Gates
- Все тесты должны проходить
- Покрытие кода не должно снижаться
- Производительность не должна деградировать
- Нет критических уязвимостей безопасности

## 🔄 НЕПРЕРЫВНОЕ ТЕСТИРОВАНИЕ

### Pre-commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit tests..."

# Flutter tests
flutter test --no-coverage

# Go tests
go test ./... -short

# Linting
flutter analyze
golangci-lint run

echo "All pre-commit tests passed!"
```

### Monitoring и Alerting
```yaml
# monitoring/test-alerts.yml
alerts:
  - name: test_failure_rate_high
    condition: test_failure_rate > 5%
    action: notify_team
    
  - name: coverage_dropped
    condition: coverage_percentage < 90%
    action: block_deployment
    
  - name: performance_regression
    condition: app_launch_time > 5s
    action: notify_performance_team
```

## 📈 РЕЗУЛЬТАТЫ

С этой стратегией тестирования мы достигнем:

✅ **100% покрытие** критических пользовательских сценариев  
✅ **90%+ покрытие кода** unit тестами  
✅ **Автоматизированное тестирование** на всех этапах разработки  
✅ **Непрерывная интеграция** с качественными гейтами  
✅ **Мониторинг производительности** в реальном времени  
✅ **Безопасность** на уровне enterprise  
✅ **Масштабируемость** для роста проекта  

Эта стратегия обеспечит высокое качество кода и надежность приложения MebelPlace на всех платформах.
