import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/typing_indicator.dart';
import '../../widgets/skeleton_loading.dart';
import '../../../utils/haptic_helper.dart';
import '../../../core/utils/image_helper.dart';
import '../../../data/datasources/socket_service.dart';
import '../../providers/app_providers.dart';
import '../../providers/socket_provider.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  late SocketService _socketService;

  @override
  void initState() {
    super.initState();
    
    // Инициализация WebSocket для обновления списка чатов
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _socketService = ref.read(socketServiceProvider);
      
      // Слушаем новые сообщения для обновления списка чатов
      _socketService.onNewMessage = (message) {
        print('📨 New message received, refreshing chat list');
        // Обновляем список чатов
        ref.read(chatProvider.notifier).loadChats();
      };
      
      // Загружаем чаты
      ref.read(chatProvider.notifier).loadChats();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.all(16.w),
              child: Row(
                children: [
                  if (!_isSearching) ...[
                    Text(
                      'Сообщения',
                      style: TextStyle(
                        fontSize: 24.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: Icon(
                        Icons.search_rounded,
                        color: Colors.white,
                        size: 24.sp,
                      ),
                      onPressed: () {
                        HapticHelper.lightImpact(); // ✨ Вибрация
                        setState(() {
                          _isSearching = true;
                        });
                      },
                    ),
                  ] else ...[
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        autofocus: true,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16.sp,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Поиск...',
                          hintStyle: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                          ),
                          border: InputBorder.none,
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.close_rounded,
                        color: Colors.white,
                        size: 24.sp,
                      ),
                      onPressed: () {
                        HapticHelper.lightImpact(); // ✨ Вибрация
                        setState(() {
                          _isSearching = false;
                          _searchController.clear();
                        });
                      },
                    ),
                  ],
                ],
              ),
            ),
            
            // Chat list
            Expanded(
              child: _buildChatList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList() {
    final chatState = ref.watch(chatProvider);
    final isLoading = chatState.isLoading;
    final chats = chatState.chats;

    if (isLoading) {
      // Skeleton loading
      return ListView.builder(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        itemCount: 8,
        itemBuilder: (context, index) {
          return const SkeletonChatItem();
        },
      );
    }

    if (chats.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      itemCount: chats.length,
      itemBuilder: (context, index) {
        return _buildChatItemFromModel(chats[index], index);
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline_rounded,
            size: 80.sp,
            color: Colors.white.withOpacity(0.3),
          ),
          SizedBox(height: 24.h),
          Text(
            'Нет сообщений',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: Colors.white.withOpacity(0.5),
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Начните общение с мастерами',
            style: TextStyle(
              fontSize: 14.sp,
              color: Colors.white.withOpacity(0.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatItemFromModel(dynamic chat, int index) {
    // Используем обновлённую структуру ChatModel
    final hasUnread = chat.unreadCount > 0;
    final unreadCount = chat.unreadCount;
    final isTyping = false; // TODO: Get from real-time updates
    final chatId = chat.id;
    
    // Получаем другого участника (не текущего пользователя)
    final otherUser = chat.otherUser;
    final otherUserName = otherUser?.displayName ?? 'Пользователь';
    final otherUserAvatar = otherUser?.avatar;
    final isOnline = otherUser?.isActive ?? false;
    
    // Последнее сообщение и время
    final lastMessage = chat.lastMessage ?? 'Нет сообщений';
    final lastMessageTime = chat.lastMessageTime ?? DateTime.now();

    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 300 + (index * 50)),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(-50 * (1 - value), 0),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: EdgeInsets.only(bottom: 8.h),
        decoration: BoxDecoration(
          color: hasUnread
              ? AppColors.primary.withOpacity(0.05)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Material(
          color: Colors.transparent,
            child: InkWell(
            onTap: () {
              HapticHelper.lightImpact(); // ✨ Вибрация
              Navigator.pushNamed(context, '/chat', arguments: chatId);
            },
            borderRadius: BorderRadius.circular(16.r),
            child: Padding(
              padding: EdgeInsets.all(12.w),
              child: Row(
                children: [
                  // Avatar
                  Stack(
                    children: [
                      Hero(
                        tag: 'chat_avatar_$chatId', // ✨ Hero animation
                        child: Container(
                          width: 56.w,
                          height: 56.w,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.secondary],
                            ),
                          ),
                          padding: EdgeInsets.all(2.w),
                          child: ClipOval(
                            child: otherUserAvatar != null
                                ? CachedNetworkImage(
                                    imageUrl: ImageHelper.getFullImageUrl(otherUserAvatar),
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Container(
                                      color: AppColors.darkSurface,
                                      child: Center(
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                        ),
                                      ),
                                    ),
                                    errorWidget: (context, url, error) {
                                      return Container(
                                        color: AppColors.darkSurface,
                                        child: Icon(
                                          Icons.person,
                                          size: 28.sp,
                                          color: Colors.white,
                                        ),
                                      );
                                    },
                                  )
                                : Container(
                                    color: AppColors.darkSurface,
                                    child: Icon(
                                      Icons.person,
                                      size: 28.sp,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                      
                      // Online indicator
                      if (isOnline)
                        Positioned(
                          right: 2,
                          bottom: 2,
                          child: Container(
                            width: 14.w,
                            height: 14.w,
                            decoration: BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.dark,
                                width: 2,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  
                  SizedBox(width: 12.w),
                  
                  // Chat info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              otherUserName,
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: hasUnread
                                    ? FontWeight.bold
                                    : FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        isTyping
                            ? const TypingIndicatorSmall() // ✨ Typing indicator
                            : Text(
                                lastMessage,
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: Colors.white.withOpacity(hasUnread ? 0.8 : 0.5),
                                  fontWeight: hasUnread
                                      ? FontWeight.w500
                                      : FontWeight.normal,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                      ],
                    ),
                  ),
                  
                  SizedBox(width: 12.w),
                  
                  // Time and badge
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _formatMessageTime(lastMessageTime),
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: hasUnread
                              ? AppColors.primary
                              : Colors.white.withOpacity(0.5),
                          fontWeight: hasUnread
                              ? FontWeight.w600
                              : FontWeight.normal,
                        ),
                      ),
                      if (hasUnread) ...[
                        SizedBox(height: 6.h),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 6.w,
                            vertical: 2.h,
                          ),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.secondary],
                            ),
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                          child: Text(
                            '$unreadCount',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _formatMessageTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'сейчас';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} мин';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} ч';
    } else if (difference.inDays == 1) {
      return 'вчера';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} дн';
    } else {
      return '${dateTime.day}.${dateTime.month}';
    }
  }
}
