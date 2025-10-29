import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/message_model.dart';
import '../../../data/datasources/socket_service.dart';
import '../../providers/app_providers.dart';
import '../../providers/socket_provider.dart';
import '../../widgets/loading_widget.dart';

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
                  
                  Text(
                    message.message ?? '',
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
      child: Row(
        children: [
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
