# OpenAPI спецификация для MebelPlace API

## 📋 Содержание

1. [Описание](#описание)
2. [Установка и использование](#установка-и-использование)
3. [Генерация клиентов](#генерация-клиентов)
4. [Примеры использования](#примеры-использования)
5. [Аутентификация](#аутентификация)
6. [API Endpoints](#api-endpoints)
7. [WebSocket](#websocket)

---

## 📖 Описание

OpenAPI спецификация для REST API MebelPlace. Предназначена для подключения мобильных приложений на Flutter и React Native к backend серверу.

**Файл спецификации:** `openapi.yaml`

**Base URL Production:** `https://mebelplace.com.kz/api`  
**Base URL Development:** `http://localhost:3000/api`

---

## 🚀 Установка и использование

### Для Flutter (Dart)

#### 1. Установка инструментов

```bash
# Установка OpenAPI Generator
brew install openapi-generator
# или
npm install -g @openapi-generator-plus/cli

# Установка Dart SDK
# https://dart.dev/get-dart
```

#### 2. Генерация клиента

```bash
# Скачать спецификацию
curl -o openapi.yaml https://mebelplace.com.kz/openapi.yaml

# Сгенерировать Dart клиент
openapi-generator generate \
  -i openapi.yaml \
  -g dart \
  -o lib/api \
  --additional-properties=pubName=mebelplace_api

# Или использовать swagger-codegen
swagger-codegen generate \
  -i openapi.yaml \
  -l dart \
  -o lib/api \
  --additional-properties=pubName=mebelplace_api
```

#### 3. Добавление в pubspec.yaml

```yaml
dependencies:
  mebelplace_api:
    path: lib/api
  http: ^1.0.0
  dio: ^5.0.0
```

#### 4. Использование в коде

```dart
import 'package:mebelplace_api/api.dart';

// Настройка клиента
final apiClient = ApiClient(
  basePath: 'https://mebelplace.com.kz/api',
);

// Установка токена
apiClient.addDefaultHeader('Authorization', 'Bearer $token');

// Использование API
final authApi = AuthApi(apiClient);
final response = await authApi.login(
  loginRequest: LoginRequest(
    phone: '+77001234567',
    password: 'password123',
  ),
);

final user = response.data!.user;
final accessToken = response.data!.accessToken;
```

---

### Для React Native (TypeScript/JavaScript)

#### 1. Установка инструментов

```bash
# Установка OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Или локально
npm install --save-dev @openapitools/openapi-generator-cli
```

#### 2. Генерация клиента

```bash
# Скачать спецификацию
curl -o openapi.yaml https://mebelplace.com.kz/openapi.yaml

# Сгенерировать TypeScript клиент
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o src/api

# Или TypeScript Fetch
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o src/api
```

#### 3. Установка зависимостей

```bash
npm install axios
# или для fetch
npm install node-fetch @types/node-fetch
```

#### 4. Использование в коде

```typescript
import { Configuration, AuthApi, LoginRequest } from './api';

// Настройка клиента
const configuration = new Configuration({
  basePath: 'https://mebelplace.com.kz/api',
  accessToken: token,
});

// Использование API
const authApi = new AuthApi(configuration);

const response = await authApi.login({
  loginRequest: {
    phone: '+77001234567',
    password: 'password123',
  },
});

const { user, accessToken } = response.data;
```

---

## 🔧 Генерация клиентов

### Поддерживаемые языки

| Язык | Generator | Команда |
|------|-----------|---------|
| Dart (Flutter) | `dart` | `openapi-generator generate -i openapi.yaml -g dart -o output` |
| TypeScript | `typescript-axios` | `openapi-generator generate -i openapi.yaml -g typescript-axios -o output` |
| TypeScript | `typescript-fetch` | `openapi-generator generate -i openapi.yaml -g typescript-fetch -o output` |
| JavaScript | `javascript` | `openapi-generator generate -i openapi.yaml -g javascript -o output` |
| Java | `java` | `openapi-generator generate -i openapi.yaml -g java -o output` |
| Swift (iOS) | `swift5` | `openapi-generator generate -i openapi.yaml -g swift5 -o output` |
| Kotlin | `kotlin` | `openapi-generator generate -i openapi.yaml -g kotlin -o output` |

### Онлайн генераторы

1. **Swagger Editor**: https://editor.swagger.io/
2. **OpenAPI Generator Online**: https://openapi-generator.tech/
3. **Swagger Codegen**: https://swagger.io/tools/swagger-codegen/

---

## 💻 Примеры использования

### Регистрация и вход

#### Flutter (Dart)

```dart
import 'package:mebelplace_api/api.dart';

class AuthService {
  late ApiClient _apiClient;
  late AuthApi _authApi;
  
  AuthService() {
    _apiClient = ApiClient(basePath: 'https://mebelplace.com.kz/api');
    _authApi = AuthApi(_apiClient);
  }
  
  Future<AuthResponse> register({
    required String phone,
    required String username,
    required String password,
    required String firstName,
    required String lastName,
  }) async {
    try {
      final response = await _authApi.register(
        registerRequest: RegisterRequest(
          phone: phone,
          username: username,
          password: password,
          firstName: firstName,
          lastName: lastName,
          role: 'user',
        ),
      );
      return response.data!;
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }
  
  Future<AuthResponse> login({
    required String phone,
    required String password,
  }) async {
    try {
      final response = await _authApi.login(
        loginRequest: LoginRequest(
          phone: phone,
          password: password,
        ),
      );
      
      // Сохраняем токен
      _apiClient.addDefaultHeader('Authorization', 'Bearer ${response.data!.accessToken}');
      
      return response.data!;
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }
}
```

#### React Native (TypeScript)

```typescript
import { Configuration, AuthApi, LoginRequest, RegisterRequest } from './api';

class AuthService {
  private config: Configuration;
  private authApi: AuthApi;
  
  constructor() {
    this.config = new Configuration({
      basePath: 'https://mebelplace.com.kz/api',
    });
    this.authApi = new AuthApi(this.config);
  }
  
  async register(data: {
    phone: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const response = await this.authApi.register({
        registerRequest: {
          phone: data.phone,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'user',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
    }
  }
  
  async login(phone: string, password: string) {
    try {
      const response = await this.authApi.login({
        loginRequest: {
          phone,
          password,
        },
      });
      
      // Сохраняем токен
      this.config.accessToken = response.data.accessToken;
      
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }
}
```

---

### Работа с видео

#### Flutter

```dart
import 'package:mebelplace_api/api.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

class VideoService {
  late VideoApi _videoApi;
  
  VideoService(ApiClient apiClient) {
    _videoApi = VideoApi(apiClient);
  }
  
  // Получить ленту видео
  Future<List<Video>> getFeed({int page = 1, int limit = 20}) async {
    final response = await _videoApi.getVideosFeed(
      page: page,
      limit: limit,
    );
    return response.data ?? [];
  }
  
  // Загрузить видео
  Future<Video> uploadVideo({
    required File videoFile,
    required String title,
    String? description,
  }) async {
    // Для загрузки файлов используем прямой HTTP запрос
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('https://mebelplace.com.kz/api/videos/upload'),
    );
    
    request.headers['Authorization'] = apiClient.apiKey!['Authorization']!;
    request.files.add(
      await http.MultipartFile.fromPath('video', videoFile.path),
    );
    request.fields['title'] = title;
    if (description != null) request.fields['description'] = description;
    
    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    
    return Video.fromJson(json.decode(responseBody)['data']);
  }
  
  // Лайкнуть видео
  Future<bool> likeVideo(String videoId) async {
    try {
      await _videoApi.likeVideo(id: videoId);
      return true;
    } catch (e) {
      return false;
    }
  }
}
```

---

### Работа с заявками

#### Flutter

```dart
class OrderService {
  late OrderApi _orderApi;
  
  OrderService(ApiClient apiClient) {
    _orderApi = OrderApi(apiClient);
  }
  
  // Создать заявку
  Future<Order> createOrder({
    required String title,
    required String description,
    required String category,
    String? city,
    String? region,
    List<File>? images,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('https://mebelplace.com.kz/api/orders/create'),
    );
    
    request.headers['Authorization'] = apiClient.apiKey!['Authorization']!;
    request.fields['title'] = title;
    request.fields['description'] = description;
    request.fields['category'] = category;
    if (city != null) request.fields['city'] = city;
    if (region != null) request.fields['region'] = region;
    
    if (images != null) {
      for (var image in images) {
        request.files.add(
          await http.MultipartFile.fromPath('images', image.path),
        );
      }
    }
    
    final response = await request.send();
    final responseBody = await response.stream.bytesToString();
    
    return Order.fromJson(json.decode(responseBody)['data']);
  }
  
  // Получить ленту заявок
  Future<List<Order>> getFeed({
    int page = 1,
    int limit = 20,
    String? category,
    String? region,
  }) async {
    final response = await _orderApi.getOrdersFeed(
      page: page,
      limit: limit,
      category: category,
      region: region,
    );
    return response.data ?? [];
  }
  
  // Откликнуться на заявку
  Future<void> respondToOrder({
    required String orderId,
    required String message,
    double? price,
    DateTime? deadline,
  }) async {
    await _orderApi.response(
      id: orderId,
      responseRequest: ResponseRequest(
        message: message,
        price: price,
        deadline: deadline?.toIso8601String(),
      ),
    );
  }
}
```

---

## 🔐 Аутентификация

### JWT токены

API использует JWT (JSON Web Tokens) для аутентификации.

#### Получение токенов

```dart
// Регистрация
final authResponse = await authService.register(
  phone: '+77001234567',
  username: 'john_doe',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
);

final accessToken = authResponse.accessToken;
final refreshToken = authResponse.refreshToken;

// Вход
final authResponse = await authService.login(
  phone: '+77001234567',
  password: 'password123',
);
```

#### Использование токена

```dart
// Установка в API клиенте
_apiClient.addDefaultHeader('Authorization', 'Bearer $accessToken');
```

#### Обновление токена

```dart
final refreshResponse = await _authApi.refresh(
  refreshRequest: RefreshRequest(
    refreshToken: refreshToken,
  ),
);

final newAccessToken = refreshResponse.data!.accessToken;
```

---

## 📡 API Endpoints

### Основные группы

1. **Auth** - Аутентификация и регистрация
2. **Videos** - Видео контент
3. **Orders** - Заявки и отклики
4. **Chat** - Чат между пользователями
5. **Users** - Управление пользователями
6. **Notifications** - Уведомления
7. **Push** - Push-уведомления
8. **Search** - Поиск
9. **Support** - Поддержка
10. **Admin** - Административные функции

### Примеры запросов

#### POST /auth/login
```json
{
  "phone": "+77001234567",
  "password": "password123"
}
```

#### GET /videos/feed
```
GET /api/videos/feed?page=1&limit=20&category=furniture
Authorization: Bearer {token}
```

#### POST /orders/create
```json
{
  "title": "Нужен шкаф",
  "description": "Шкаф-купе 200x240",
  "category": "wardrobe",
  "city": "Алматы",
  "region": "Алматы"
}
```

---

## 🔌 WebSocket

Для real-time коммуникации используется WebSocket (Socket.IO).

### Подключение

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket socket;
  
  void connect(String token) {
    socket = IO.io(
      'https://mebelplace.com.kz',
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .build(),
    );
    
    socket.onConnect((_) => print('Connected'));
    socket.onDisconnect((_) => print('Disconnected'));
  }
  
  // Слушать новые сообщения
  void listenToMessages(Function(Map<String, dynamic>) callback) {
    socket.on('new_message', (data) => callback(data));
  }
  
  // Слушать новые уведомления
  void listenToNotifications(Function(Map<String, dynamic>) callback) {
    socket.on('new_notification', (data) => callback(data));
  }
  
  // Отправить сообщение
  void sendMessage(String chatId, String content) {
    socket.emit('send_message', {
      'chatId': chatId,
      'content': content,
    });
  }
}
```

---

## 📝 Дополнительные ресурсы

- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Postman Collection**: Импортируйте `openapi.yaml` в Postman

---

## 🤝 Поддержка

Если у вас возникли вопросы:
- Email: support@mebelplace.com.kz
- Документация: https://mebelplace.com.kz/docs
- API Status: https://mebelplace.com.kz/api/health
