import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/video_model.dart';
import '../../data/models/user_model.dart';
import '../../data/models/order_model.dart';
import '../../data/models/chat_model.dart';
import '../../data/models/message_model.dart';
import '../../data/models/order_response_model.dart';
import '../../data/repositories/app_repositories.dart';
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
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> register(String phone, String username, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authRepository.register(
        phone: phone,
        username: username,
        password: password,
      );
      state = state.copyWith(
        user: result.user,
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

  Future<void> logout() async {
    try {
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

  ChatNotifier(this._chatRepository) : super(ChatState.initial());

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