import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/theme/app_theme.dart';
import '../../core/utils/image_helper.dart';
import '../../data/models/video_model.dart';
import '../../data/models/comment_model.dart';
import '../providers/app_providers.dart' as providers;

class CommentsBottomSheet extends ConsumerStatefulWidget {
  final VideoModel video;

  const CommentsBottomSheet({
    super.key,
    required this.video,
  });

  @override
  ConsumerState<CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends ConsumerState<CommentsBottomSheet> {
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isSending = false;

  @override
  void dispose() {
    _commentController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final commentState = ref.watch(providers.commentProvider(widget.video.id));

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: BoxDecoration(
        color: AppColors.darkSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40.w,
            height: 4.h,
            margin: EdgeInsets.symmetric(vertical: 12.h),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),

          // Header
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            child: Row(
              children: [
                Text(
                  'Комментарии',
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(width: 8.w),
                Text(
                  '${commentState.comments.length}',
                  style: TextStyle(
                    fontSize: 16.sp,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),

          Divider(color: Colors.white.withOpacity(0.1), height: 1),

          // Comments list
          Expanded(
            child: commentState.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : commentState.error != null
                    ? Center(
                        child: Text(
                          commentState.error!,
                          style: TextStyle(color: Colors.white.withOpacity(0.6)),
                        ),
                      )
                    : commentState.comments.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.chat_bubble_outline,
                                  size: 64.sp,
                                  color: Colors.white.withOpacity(0.3),
                                ),
                                SizedBox(height: 16.h),
                                Text(
                                  'Пока нет комментариев',
                                  style: TextStyle(
                                    fontSize: 16.sp,
                                    color: Colors.white.withOpacity(0.6),
                                  ),
                                ),
                                SizedBox(height: 8.h),
                                Text(
                                  'Будьте первым!',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: Colors.white.withOpacity(0.4),
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                            itemCount: commentState.comments.length,
                            itemBuilder: (context, index) {
                              final comment = commentState.comments[index];
                              return _buildCommentItem(comment);
                            },
                          ),
          ),

          // Input field
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: AppColors.dark,
              border: Border(
                top: BorderSide(
                  color: Colors.white.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(24.r),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                      child: TextField(
                        controller: _commentController,
                        focusNode: _focusNode,
                        style: TextStyle(color: Colors.white, fontSize: 14.sp),
                        maxLines: null,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: InputDecoration(
                          hintText: 'Добавить комментарий...',
                          hintStyle: TextStyle(
                            color: Colors.white.withOpacity(0.4),
                            fontSize: 14.sp,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 8.h),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 8.w),
                  GestureDetector(
                    onTap: _isSending ? null : _sendComment,
                    child: Container(
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        gradient: _commentController.text.trim().isEmpty
                            ? null
                            : const LinearGradient(
                                colors: [AppColors.primary, AppColors.secondary],
                              ),
                        color: _commentController.text.trim().isEmpty
                            ? Colors.white.withOpacity(0.1)
                            : null,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 20.sp,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentItem(CommentModel comment) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          Container(
            width: 36.w,
            height: 36.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.2),
            ),
            child: ClipOval(
              child: ImageHelper.hasValidImagePath(comment.userAvatar)
                  ? CachedNetworkImage(
                      imageUrl: ImageHelper.getFullImageUrl(comment.userAvatar),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Icon(Icons.person, color: Colors.white54),
                      errorWidget: (context, url, error) => const Icon(Icons.person, color: Colors.white54),
                    )
                  : Icon(Icons.person, color: Colors.white54, size: 20.sp),
            ),
          ),
          SizedBox(width: 12.w),
          
          // Comment content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment.username,
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      _formatTime(comment.createdAt),
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 4.h),
                Text(
                  comment.content,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    timeago.setLocaleMessages('ru', timeago.RuMessages());
    return timeago.format(dateTime, locale: 'ru');
  }

  Future<void> _sendComment() async {
    final content = _commentController.text.trim();
    if (content.isEmpty || _isSending) return;

    setState(() {
      _isSending = true;
    });

    try {
      await ref.read(providers.commentProvider(widget.video.id).notifier).addComment(content);
      _commentController.clear();
      _focusNode.unfocus();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка отправки комментария: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }
}

