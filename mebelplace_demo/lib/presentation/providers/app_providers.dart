import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/video_model.dart';
import '../../data/models/user_model.dart';
import '../../data/models/order_model.dart';
import '../../data/models/chat_model.dart';
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
}

class OrderState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;

  OrderState({
    required this.orders,
    required this.isLoading,
    this.error,
  });

  factory OrderState.initial() {
    return OrderState(
      orders: [],
      isLoading: false,
      error: null,
    );
  }

  OrderState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
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
}

class ChatState {
  final List<ChatModel> chats;
  final bool isLoading;
  final String? error;

  ChatState({
    required this.chats,
    required this.isLoading,
    this.error,
  });

  factory ChatState.initial() {
    return ChatState(
      chats: [],
      isLoading: false,
      error: null,
    );
  }

  ChatState copyWith({
    List<ChatModel>? chats,
    bool? isLoading,
    String? error,
  }) {
    return ChatState(
      chats: chats ?? this.chats,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}