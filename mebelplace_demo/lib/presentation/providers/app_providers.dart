import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/video_model.dart';
import '../../data/models/user_model.dart';
import '../../data/models/order_model.dart';
import '../../data/models/chat_model.dart';
import '../../data/models/message_model.dart';
import '../../data/models/order_response_model.dart';
import '../../data/models/comment_model.dart';
import '../../data/repositories/app_repositories.dart';
import '../../data/datasources/api_service.dart';
import '../../data/datasources/socket_service.dart';
import 'repository_providers.dart';

// Video Provider
final videoProvider = StateNotifierProvider<VideoNotifier, VideoState>((ref) {
  final videoRepository = ref.watch(videoRepositoryProvider);
  return VideoNotifier(videoRepository);
});

class VideoNotifier extends StateNotifier<VideoState> {
  final VideoRepository _videoRepository;

  VideoNotifier(this._videoRepository) : super(VideoState.initial());

  Future<void> loadVideos() async {
    state = state.copyWith(isLoading: true);
    try {
      final videos = await _videoRepository.getVideos();
      state = state.copyWith(
        videos: videos,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> likeVideo(String videoId) async {
    try {
      await _videoRepository.likeVideo(videoId);
      // Update local state
      final updatedVideos = state.videos.map((video) {
        if (video.id == videoId) {
          return video.copyWith(
            isLiked: !video.isLiked,
            likesCount: video.isLiked ? video.likesCount - 1 : video.likesCount + 1,
          );
        }
        return video;
      }).toList();
      
      state = state.copyWith(videos: updatedVideos);
    } catch (e) {
      // Handle error
    }
  }

  Future<void> recordView(String videoId) async {
    try {
      await _videoRepository.recordView(videoId);
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> searchVideos(String query) async {
    state = state.copyWith(isLoading: true);
    try {
      final videos = await _videoRepository.searchVideos(query);
      state = state.copyWith(
        videos: videos,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMasterVideos(String masterId) async {
    state = state.copyWith(isLoading: true);
    try {
      final videos = await _videoRepository.getMasterVideos(masterId);
      state = state.copyWith(
        videos: videos,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

class VideoState {
  final List<VideoModel> videos;
  final bool isLoading;
  final String? error;

  VideoState({
    required this.videos,
    required this.isLoading,
    this.error,
  });

  factory VideoState.initial() {
    return VideoState(
      videos: [],
      isLoading: false,
      error: null,
    );
  }

  VideoState copyWith({
    List<VideoModel>? videos,
    bool? isLoading,
    String? error,
  }) {
    return VideoState(
      videos: videos ?? this.videos,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return AuthNotifier(authRepository);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(AuthState.initial());

  Future<void> login(String phone, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authRepository.login(phone, password);
      state = state.copyWith(
        user: result.user,
        isLoading: false,
        error: null,
      );
      
      // Подключаем WebSocket после успешного входа
      await SocketService().connect();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> register(String phone, String username, String password, {String role = 'user', String? companyName}) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authRepository.register(
        phone: phone,
        username: username,
        password: password,
        role: role,
        companyName: companyName,
      );
      state = state.copyWith(
        user: result.user,
        isLoading: false,
        error: null,
      );
      
      // Подключаем WebSocket после успешной регистрации
      await SocketService().connect();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
  
  // Метод для прямой установки пользователя после регистрации
  Future<void> setAuthData(UserModel user, String token) async {
    await _authRepository.saveAuthData(user, token);
    state = state.copyWith(
      user: user,
      isLoading: false,
      error: null,
    );
    
    // Подключаем WebSocket
    await SocketService().connect();
  }

  Future<void> refreshUser() async {
    try {
      final user = await _authRepository.getCurrentUser();
      state = state.copyWith(
        user: user,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
      );
    }
  }

  Future<void> logout() async {
    try {
      // Отключаем WebSocket перед выходом
      SocketService().disconnect();
      
      await _authRepository.logout();
      state = AuthState.initial();
    } catch (e) {
      // Handle error
    }
  }
}

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    required this.isLoading,
    this.error,
  });

  factory AuthState.initial() {
    return AuthState(
      user: null,
      isLoading: false,
      error: null,
    );
  }

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Order Provider
final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final orderRepository = ref.watch(orderRepositoryProvider);
  return OrderNotifier(orderRepository);
});

class OrderNotifier extends StateNotifier<OrderState> {
  final OrderRepository _orderRepository;

  OrderNotifier(this._orderRepository) : super(OrderState.initial());

  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true);
    try {
      final orders = await _orderRepository.getOrders();
      state = state.copyWith(
        orders: orders,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadUserOrders() async {
    state = state.copyWith(isLoading: true);
    try {
      final orders = await _orderRepository.getUserOrders();
      state = state.copyWith(
        orders: orders,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> searchOrders(String query) async {
    state = state.copyWith(isLoading: true);
    try {
      final orders = await _orderRepository.searchOrders(query);
      state = state.copyWith(
        orders: orders,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadOrderDetail(String orderId) async {
    state = state.copyWith(isLoading: true);
    try {
      final order = await _orderRepository.getOrder(orderId);
      state = state.copyWith(
        currentOrder: order,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadOrderResponses(String orderId) async {
    state = state.copyWith(isLoading: true);
    try {
      final responses = await _orderRepository.getOrderResponses(orderId);
      state = state.copyWith(
        orderResponses: responses,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

class OrderState {
  final List<OrderModel> orders;
  final OrderModel? currentOrder;
  final List<OrderResponse> orderResponses;
  final bool isLoading;
  final String? error;

  OrderState({
    required this.orders,
    this.currentOrder,
    required this.orderResponses,
    required this.isLoading,
    this.error,
  });

  factory OrderState.initial() {
    return OrderState(
      orders: [],
      currentOrder: null,
      orderResponses: [],
      isLoading: false,
      error: null,
    );
  }

  OrderState copyWith({
    List<OrderModel>? orders,
    OrderModel? currentOrder,
    List<OrderResponse>? orderResponses,
    bool? isLoading,
    String? error,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      currentOrder: currentOrder ?? this.currentOrder,
      orderResponses: orderResponses ?? this.orderResponses,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Chat Provider
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  final chatRepository = ref.watch(chatRepositoryProvider);
  return ChatNotifier(chatRepository);
});

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _chatRepository;

  ChatNotifier(this._chatRepository) : super(ChatState.initial()) {
    _initializeSocket();
  }
  
  void _initializeSocket() {
    // Socket инициализируется при первой загрузке чата
  }
  
  @override
  void dispose() {
    // Socket будет отключаться при выходе
    super.dispose();
  }

  Future<void> loadChats() async {
    state = state.copyWith(isLoading: true);
    try {
      final chats = await _chatRepository.getChats();
      state = state.copyWith(
        chats: chats,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMessages(String chatId) async {
    state = state.copyWith(isLoading: true);
    try {
      final messages = await _chatRepository.getMessages(chatId);
      state = state.copyWith(
        messages: messages,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> sendMessage(String chatId, String content) async {
    try {
      await _chatRepository.sendMessage(chatId, content);
      // Reload messages after sending
      await loadMessages(chatId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

class ChatState {
  final List<ChatModel> chats;
  final List<MessageModel> messages;
  final bool isLoading;
  final String? error;

  ChatState({
    required this.chats,
    required this.messages,
    required this.isLoading,
    this.error,
  });

  factory ChatState.initial() {
    return ChatState(
      chats: [],
      messages: [],
      isLoading: false,
      error: null,
    );
  }

  ChatState copyWith({
    List<ChatModel>? chats,
    List<MessageModel>? messages,
    bool? isLoading,
    String? error,
  }) {
    return ChatState(
      chats: chats ?? this.chats,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Master Provider (for user search)
final masterProvider = StateNotifierProvider<MasterNotifier, MasterState>((ref) {
  final userRepository = ref.watch(userRepositoryProvider);
  return MasterNotifier(userRepository);
});

class MasterNotifier extends StateNotifier<MasterState> {
  final UserRepository _userRepository;

  MasterNotifier(this._userRepository) : super(MasterState.initial());

  Future<void> searchMasters(String query) async {
    state = state.copyWith(isLoading: true);
    try {
      final masters = await _userRepository.searchMasters(query);
      state = state.copyWith(
        masters: masters,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMaster(String userId) async {
    state = state.copyWith(isLoading: true);
    try {
      final master = await _userRepository.getUser(userId);
      state = state.copyWith(
        currentMaster: master,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

class MasterState {
  final List<UserModel> masters;
  final UserModel? currentMaster;
  final bool isLoading;
  final String? error;

  MasterState({
    required this.masters,
    this.currentMaster,
    required this.isLoading,
    this.error,
  });

  factory MasterState.initial() {
    return MasterState(
      masters: [],
      currentMaster: null,
      isLoading: false,
      error: null,
    );
  }

  MasterState copyWith({
    List<UserModel>? masters,
    UserModel? currentMaster,
    bool? isLoading,
    String? error,
  }) {
    return MasterState(
      masters: masters ?? this.masters,
      currentMaster: currentMaster ?? this.currentMaster,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Comment Provider
final commentProvider = StateNotifierProvider.family<CommentNotifier, CommentState, String>((ref, videoId) {
  final apiService = ref.watch(apiServiceProvider);
  return CommentNotifier(apiService, videoId);
});

class CommentNotifier extends StateNotifier<CommentState> {
  final ApiService _apiService;
  final String _videoId;

  CommentNotifier(this._apiService, this._videoId) : super(CommentState.initial()) {
    loadComments();
  }

  Future<void> loadComments() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _apiService.getVideoComments(_videoId);
      if (response.success && response.data != null) {
        state = state.copyWith(
          comments: response.data!,
          isLoading: false,
          error: null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.message ?? 'Failed to load comments',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

class CommentState {
  final List<CommentModel> comments;
  final bool isLoading;
  final String? error;

  CommentState({
    required this.comments,
    required this.isLoading,
    this.error,
  });

  factory CommentState.initial() {
    return CommentState(
      comments: [],
      isLoading: false,
      error: null,
    );
  }

  CommentState copyWith({
    List<CommentModel>? comments,
    bool? isLoading,
    String? error,
  }) {
    return CommentState(
      comments: comments ?? this.comments,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}