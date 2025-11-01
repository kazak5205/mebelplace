import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_helper.dart';
import '../../../data/models/message_model.dart';
import '../../../data/models/video_model.dart';
import '../../../data/datasources/socket_service.dart';
import '../../providers/app_providers.dart';
import '../../providers/repository_providers.dart';
import '../../providers/socket_provider.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/tiktok_video_player.dart';
import '../../../utils/haptic_helper.dart';

class ChatPage extends ConsumerStatefulWidget {
  final String chatId;
  
  const ChatPage({
    super.key,
    required this.chatId,
  });

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late SocketService _socketService;
  bool _isUploadingFile = false;
  
  @override
  void initState() {
    super.initState();
    
    // Инициализация WebSocket
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _socketService = ref.read(socketServiceProvider);
      
      // Подключаемся к WebSocket
      _socketService.connect().then((_) {
        // Присоединяемся к чату
        _socketService.joinChat(widget.chatId);
        
        // Слушаем новые сообщения
        _socketService.onNewMessage = (message) {
          // Добавляем сообщение только если оно для этого чата
          if (message.chatId == widget.chatId) {
            // 📨 New message in current chat: ${message.content}');
            // Перезагружаем сообщения
            ref.read(chatProvider.notifier).loadMessages(widget.chatId);
            
            // Прокручиваем вниз
            Future.delayed(const Duration(milliseconds: 300), () {
              if (_scrollController.hasClients) {
                _scrollController.animateTo(
                  _scrollController.position.maxScrollExtent,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOut,
                );
              }
            });
          }
        };
      });
      
      // Загружаем сообщения чата
      ref.read(chatProvider.notifier).loadMessages(widget.chatId);
    });
  }

  @override
  void dispose() {
    // Покидаем чат
    _socketService.leaveChat(widget.chatId);
    
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    
    // Отправляем через WebSocket для мгновенной доставки
    if (_socketService.isConnected) {
      _socketService.sendMessage(widget.chatId, message);
    } else {
      // Fallback на REST API если WebSocket не подключен
      ref.read(chatProvider.notifier).sendMessage(widget.chatId, message);
    }
    
    _messageController.clear();
    
    // Прокручиваем вниз после отправки
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
  
  Future<void> _pickAndSendMedia() async {
    HapticHelper.lightImpact();
    
    // Show source selection dialog
    final source = await showDialog<ImageSource>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.dark,
        title: Text(
          'Выбрать источник',
          style: TextStyle(color: Colors.white, fontSize: 18.sp),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppColors.primary),
              title: const Text('Галерея', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, ImageSource.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppColors.primary),
              title: const Text('Камера', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, ImageSource.camera),
            ),
          ],
        ),
      ),
    );
    
    if (source == null) return;
    
    try {
      setState(() {
        _isUploadingFile = true;
      });
      
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: source);
      
      if (pickedFile != null) {
        final file = File(pickedFile.path);
        final chatRepository = ref.read(chatRepositoryProvider);
        
        // Отправляем файл через API
        await chatRepository.sendFileMessage(widget.chatId, file);
        
        HapticHelper.success();
        
        // Перезагружаем сообщения
        ref.read(chatProvider.notifier).loadMessages(widget.chatId);
        
        // Прокручиваем вниз
        Future.delayed(const Duration(milliseconds: 100), () {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    } catch (e) {
      HapticHelper.error();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка загрузки файла: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploadingFile = false;
        });
      }
    }
  }

  // ✅ Навигация на видео из чата (как на вебе строка 427-432 HomePage.tsx)
  Future<void> _navigateToVideo(Map<String, dynamic> metadata) async {
    final videoId = metadata['videoId'];
    if (videoId == null) return;
    
    try {
      // Загружаем конкретное видео чтобы получить authorId
      final videoRepository = ref.read(videoRepositoryProvider);
      final video = await videoRepository.getVideo(videoId);
      
      // Загружаем все видео автора
      final authorVideos = await videoRepository.getVideosByAuthor(video.authorId, limit: 50);
      
      // Находим индекс нужного видео
      final index = authorVideos.indexWhere((v) => v.id == videoId);
      if (index == -1) return;
      
      // Открываем плеер
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TikTokVideoPlayer(
              videos: authorVideos,
              initialIndex: index,
              onLike: (video) {
                ref.read(videoProvider.notifier).likeVideo(video.id);
              },
              onVideoChanged: (video) {
                ref.read(videoProvider.notifier).recordView(video.id);
              },
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка загрузки видео: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final isSocketConnected = ref.watch(socketConnectionProvider);
    
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Чат',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(width: 8.w),
            // Индикатор WebSocket подключения
            Container(
              width: 8.w,
              height: 8.w,
              decoration: BoxDecoration(
                color: isSocketConnected ? Colors.green : Colors.grey,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Список сообщений
          Expanded(
            child: chatState.isLoading
                ? const Center(child: LoadingWidget())
                : chatState.error != null
                    ? _buildErrorWidget(chatState.error!)
                    : _buildMessagesList(chatState.messages),
          ),
          
          // Поле ввода сообщения
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessagesList(List<MessageModel> messages) {
    if (messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64.sp,
              color: Colors.white.withValues(alpha: 0.3),
            ),
            SizedBox(height: 16.h),
            Text(
              'Пока нет сообщений',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 16.sp,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Начните диалог!',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 14.sp,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.all(16.w),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        return _buildMessageBubble(message, index);
      },
    );
  }

  Widget _buildMessageBubble(MessageModel message, int index) {
    final currentUser = ref.watch(authProvider).user;
    final isMe = currentUser != null && message.senderId == currentUser.id;
    
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 16.r,
              backgroundColor: AppColors.primary,
              backgroundImage: message.senderAvatar != null 
                ? NetworkImage(message.senderAvatar!)
                : null,
              child: message.senderAvatar == null 
                ? Icon(Icons.person, size: 16.sp, color: Colors.white)
                : null,
            ),
            SizedBox(width: 8.w),
          ],
          
          Flexible(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              decoration: BoxDecoration(
                color: isMe 
                  ? AppColors.primary.withValues(alpha: 0.8)
                  : Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(
                  color: isMe 
                    ? AppColors.primary.withValues(alpha: 0.3)
                    : Colors.white.withValues(alpha: 0.1),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isMe) ...[
                    Text(
                      message.senderName ?? 'Пользователь',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 4.h),
                  ],
                  
                  // Превью видео, если есть metadata (как на вебе строка 422-454)
                  if (message.type == 'video' && message.metadata != null) ...[
                    GestureDetector(
                      onTap: () => _navigateToVideo(message.metadata!),
                      child: Container(
                        margin: EdgeInsets.only(bottom: 8.h),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12.r),
                          color: Colors.black,
                        ),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12.r),
                              child: ImageHelper.hasValidImagePath(message.metadata?['videoThumbnail'])
                                  ? CachedNetworkImage(
                                      imageUrl: ImageHelper.getFullImageUrl(message.metadata?['videoThumbnail']),
                                      width: double.infinity,
                                      height: 150.h,
                                      fit: BoxFit.cover,
                                      placeholder: (context, url) => Container(
                                        width: double.infinity,
                                        height: 150.h,
                                        color: Colors.black54,
                                        child: const Center(
                                          child: CircularProgressIndicator(color: Colors.white54),
                                        ),
                                      ),
                                      errorWidget: (context, url, error) => Container(
                                        width: double.infinity,
                                        height: 150.h,
                                        color: Colors.black54,
                                        child: Icon(Icons.video_library, size: 48.sp, color: Colors.white54),
                                      ),
                                    )
                                  : Container(
                                      width: double.infinity,
                                      height: 150.h,
                                      color: Colors.black54,
                                      child: Icon(Icons.video_library, size: 48.sp, color: Colors.white54),
                                    ),
                            ),
                            Positioned.fill(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(12.r),
                                ),
                                child: Center(
                                  child: Container(
                                    width: 40.w,
                                    height: 40.w,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.2),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(Icons.play_arrow, color: Colors.white, size: 24.sp),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Text(
                      message.metadata?['videoTitle'] ?? '',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      'от ${message.metadata?['masterName'] ?? 'Мастер'}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12.sp,
                      ),
                    ),
                    SizedBox(height: 8.h),
                  ],
                  
                  Text(
                    message.content ?? '',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14.sp,
                    ),
                  ),
                  
                  SizedBox(height: 4.h),
                  
                  Text(
                    _formatTime(message.createdAt),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 10.sp,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          if (isMe) ...[
            SizedBox(width: 8.w),
            CircleAvatar(
              radius: 16.r,
              backgroundColor: AppColors.primary,
              child: Icon(Icons.person, size: 16.sp, color: Colors.white),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.dark,
        border: Border(
          top: BorderSide(
            color: Colors.white.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          if (_isUploadingFile)
            Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: Row(
                children: [
                  SizedBox(
                    width: 14.w,
                    height: 14.w,
                    child: const CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.primary,
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    'Загрузка файла...',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12.sp,
                    ),
                  ),
                ],
              ),
            ),
          Row(
            children: [
              // Media button
              GestureDetector(
                onTap: _pickAndSendMedia,
                child: Container(
                  width: 48.w,
                  height: 48.w,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24.r),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    Icons.image,
                    color: Colors.white.withValues(alpha: 0.8),
                    size: 24.sp,
                  ),
                ),
              ).animate().scale(
                duration: 200.ms,
                curve: Curves.easeOut,
              ),
              
              SizedBox(width: 12.w),
              
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(25.r),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: TextField(
                    controller: _messageController,
                    style: TextStyle(color: Colors.white, fontSize: 14.sp),
                    decoration: InputDecoration(
                      hintText: 'Напишите сообщение...',
                      hintStyle: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 14.sp,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 12.h,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
              ),
              
              SizedBox(width: 12.w),
              
              GestureDetector(
                onTap: _sendMessage,
                child: Container(
                  width: 48.w,
                  height: 48.w,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.secondary],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24.r),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.send,
                    color: Colors.white,
                    size: 20.sp,
                  ),
                ),
              ).animate().scale(
                duration: 200.ms,
                curve: Curves.easeOut,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64.sp,
            color: Colors.red.withValues(alpha: 0.7),
          ),
          SizedBox(height: 16.h),
          Text(
            'Ошибка загрузки сообщений',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            error,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.7),
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16.h),
          ElevatedButton(
            onPressed: () {
              ref.read(chatProvider.notifier).loadMessages(widget.chatId);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: const Text(
              'Повторить',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return 'сейчас';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}м';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}ч';
    } else {
      return '${dateTime.day}.${dateTime.month}';
    }
  }
}
