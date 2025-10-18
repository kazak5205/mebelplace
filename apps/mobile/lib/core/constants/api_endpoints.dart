/// API Endpoints для MebelPlace - Полный набор из OpenAPI v2.4.0
/// Соответствует всем 190 endpoints из backend API
class ApiEndpoints {
  ApiEndpoints._();

  // ========== SYSTEM ENDPOINTS ==========
  static const String rateLimitStatus = '/ratelimit/status';
  static const String health = '/health';
  static const String version = '/version';
  static const String info = '/info';

  // ========== AUTH ENDPOINTS ==========
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String verifyPhone = '/auth/verify-phone';
  static const String authRefresh = '/auth/refresh';
  static const String authVerifySms = '/auth/verify-sms';
  static const String authVerifyEmail = '/auth/verify-email';
  static const String forgotPassword = '/auth/forgot-password';
  static const String changePassword = '/auth/change-password';
  static const String enable2FA = '/auth/2fa/enable';
  static const String disable2FA = '/auth/2fa/disable';
  static const String verify2FA = '/auth/2fa/verify';
  
  // Social Auth
  static const String googleAuth = '/auth/google';
  static const String appleAuth = '/auth/apple';
  
  // Videos
  static const String videosFeed = '/videos/feed';
  static const String videosSearch = '/videos/search';
  static const String videosUpload = '/videos/upload';
  static const String videoDetail = '/videos/{id}';
  static const String videoLike = '/videos/{id}/like';
  static const String videoUnlike = '/videos/{id}/unlike';
  static const String videoFavorite = '/videos/{id}/favorite';
  static const String videoUnfavorite = '/videos/{id}/unfavorite';
  static const String videoComment = '/videos/{id}/comments';
  static const String videosComments = '/videos/{id}/comments';
  static const String videoShare = '/videos/{id}/share';
  static const String videoReport = '/videos/{id}/report';
  static const String videoViews = '/videos/{id}/view';
  static const String videoBlock = '/videos/{id}/block';
  
  // Channels
  static const String channels = '/channels';
  static const String channelDetail = '/channels/{id}';
  static const String channelSubscribe = '/channels/{id}/subscribe';
  static const String channelUnsubscribe = '/channels/{id}/unsubscribe';
  static const String channelVideos = '/channels/{id}/videos';
  
  // Search
  static const String search = '/search';
  static const String searchSuggestions = '/search/suggestions';
  static const String searchHistory = '/search/history';
  
  // Requests (Заявки)
  static const String requests = '/requests';
  static const String requestCreate = '/requests';
  static const String requestDetail = '/requests/{id}';
  static const String requestUpdate = '/requests/{id}';
  static const String requestProposals = '/requests/{id}/proposals';
  static const String requestProposalAccept = '/requests/{id}/proposals/{proposal_id}/accept';
  static const String requestProposalReject = '/requests/{id}/proposals/{proposal_id}/reject';
  static const String requestCancel = '/requests/{id}/cancel';
  static const String requestComplete = '/requests/{id}/complete';
  
  // Chats
  static const String chatDialogs = '/chat/dialogs';
  static const String chatMessages = '/chat/messages';
  static const String chatSend = '/chat/send';
  static const String chatRead = '/chat/{dialogId}/read';
  static const String chatTyping = '/chat/{dialogId}/typing';
  static const String chatUpload = '/chat/upload';
  
  // Profile
  static const String profile = '/profile';
  static const String profileUpdate = '/profile/update';
  static const String profileAvatar = '/profile/avatar';
  static const String profileVideos = '/profile/videos';
  static const String profileFavorites = '/profile/favorites';
  static const String profileRequests = '/profile/requests';
  static const String profileSettings = '/profile/settings';
  
  // Master Profile
  static const String masterProfile = '/master/profile';
  static const String masterProducts = '/master/products';
  static const String masterSubscribers = '/master/subscribers';
  static const String masterStatistics = '/master/statistics';
  static const String masterRequests = '/master/requests';
  
  // Gamification
  static const String gamificationProfile = '/gamification/profile';
  static const String gamificationAchievements = '/gamification/achievements';
  static const String gamificationLeaderboard = '/gamification/leaderboard';
  static const String gamificationAddPoints = '/gamification/points';
  static const String gamificationAwardPoints = '/gamification/award-points';
  
  // Notifications
  static const String notifications = '/notifications';
  static const String notificationRead = '/notifications/{id}/read';
  static const String notificationReadAll = '/notifications/read-all';
  static const String notificationSettings = '/notifications/settings';
  
  // Support
  static const String supportTickets = '/support/tickets';
  static const String supportTicketCreate = '/support/tickets';
  static const String supportTicketDetail = '/support/tickets/{id}';
  static const String supportTicketReply = '/support/tickets/{id}/reply';
  
  // Admin
  static const String adminUsers = '/admin/users';
  static const String adminUsersBanned = '/admin/users/banned';
  static const String adminVideos = '/admin/videos';
  static const String adminModerate = '/admin/moderate';
  static const String adminPending = '/admin/pending';
  static const String adminPendingApprove = '/admin/pending/{id}/approve';
  static const String adminPendingReject = '/admin/pending/{id}/reject';
  static const String adminReports = '/admin/reports';
  static const String adminTickets = '/admin/tickets';
  static const String adminAds = '/admin/ads';
  static const String adminStats = '/admin/stats';
  static const String adminAnalytics = '/admin/analytics';
  static const String adminAnalyticsVideos = '/admin/analytics/videos';
  static const String adminAnalyticsUsers = '/admin/analytics/users';
  static const String adminAnalyticsOrders = '/admin/analytics/orders';
  static const String adminAnalyticsRevenue = '/admin/analytics/revenue';
  
  // Orders
  static const String orders = '/orders';
  static const String orderDetail = '/orders/{id}';
  static const String orderCancel = '/orders/{id}/cancel';

  // ========== USERS ENDPOINTS ==========
  static const String users = '/users';
  static const String userMe = '/users/me';
  static const String userById = '/users/{id}';
  static const String userUpdate = '/users/{id}';
  static const String userDelete = '/users/{id}';
  static const String userBlock = '/users/{id}/block';
  static const String userUnblock = '/users/{id}/unblock';
  static const String userFollow = '/users/{id}/follow';
  static const String userUnfollow = '/users/{id}/unfollow';
  static const String userFollowers = '/users/{id}/followers';
  static const String userFollowing = '/users/{id}/following';

  // ========== ANALYTICS ENDPOINTS ==========
  static const String analyticsEngagement = '/analytics/engagement';
  static const String analyticsPlatform = '/analytics/platform';
  static const String analyticsRevenue = '/analytics/revenue';
  static const String analyticsUser = '/analytics/user';
  static const String analyticsVideoHeatmap = '/analytics/videos/{id}/heatmap';
  static const String analyticsVideoMulticast = '/analytics/videos/{id}/multicast';

  // ========== AR/3D ENDPOINTS ==========
  static const String ar3dModelsProduct = '/ar3d/models/product/{product_id}';
  static const String ar3dModelsSearch = '/ar3d/models/search';
  static const String ar3dModelsUpload = '/ar3d/models/upload';
  static const String ar3dModelsValidate = '/ar3d/models/validate';
  static const String ar3dModelsPreview = '/ar3d/models/{id}/preview';
  static const String ar3dModelsRender = '/ar3d/models/{id}/render';

  // ========== CALLS ENDPOINTS ==========
  static const String calls = '/calls';
  static const String callCreate = '/calls';
  static const String callJoin = '/calls/{id}/join';
  static const String callLeave = '/calls/{id}/leave';
  static const String callEnd = '/calls/{id}/end';

  // ========== COMMENTS ENDPOINTS ==========
  static const String comments = '/comments';
  static const String commentCreate = '/comments';
  static const String commentById = '/comments/{id}';
  static const String commentUpdate = '/comments/{id}';
  static const String commentDelete = '/comments/{id}';
  static const String commentLike = '/comments/{id}/like';
  static const String commentUnlike = '/comments/{id}/unlike';
  static const String commentReplies = '/comments/{id}/replies';

  // ========== STORIES ENDPOINTS ==========
  static const String stories = '/stories';
  static const String storyCreate = '/stories';
  static const String storyById = '/stories/{id}';
  static const String storyUpdate = '/stories/{id}';
  static const String storyDelete = '/stories/{id}';
  static const String storyView = '/stories/{id}/view';
  static const String storyLike = '/stories/{id}/like';
  static const String storyUnlike = '/stories/{id}/unlike';

  // ========== SUPPORT ENDPOINTS ==========
  static const String supportTickets = '/support/tickets';
  static const String supportTicketCreate = '/support/tickets';
  static const String supportTicketDetail = '/support/tickets/{id}';
  static const String supportTicketReply = '/support/tickets/{id}/reply';
  static const String supportTicketClose = '/support/tickets/{id}/close';

  // ========== REFERRALS ENDPOINTS ==========
  static const String referrals = '/referrals';
  static const String referralCode = '/referrals/code';
  static const String referralStats = '/referrals/stats';
  static const String referralRewards = '/referrals/rewards';

  // ========== LIVE STREAMS ENDPOINTS ==========
  static const String liveStreams = '/live-streams';
  static const String liveStreamCreate = '/live-streams';
  static const String liveStreamById = '/live-streams/{id}';
  static const String liveStreamStart = '/live-streams/{id}/start';
  static const String liveStreamStop = '/live-streams/{id}/stop';
  static const String liveStreamJoin = '/live-streams/{id}/join';
  static const String liveStreamLeave = '/live-streams/{id}/leave';

  // ========== VOICE ROOMS ENDPOINTS ==========
  static const String voiceRooms = '/voice-rooms';
  static const String voiceRoomCreate = '/voice-rooms';
  static const String voiceRoomById = '/voice-rooms/{id}';
  static const String voiceRoomJoin = '/voice-rooms/{id}/join';
  static const String voiceRoomLeave = '/voice-rooms/{id}/leave';
  static const String voiceRoomMute = '/voice-rooms/{id}/mute';
  static const String voiceRoomUnmute = '/voice-rooms/{id}/unmute';

  // ========== HLS STREAMING ENDPOINTS ==========
  static const String hlsStreams = '/hls/streams';
  static const String hlsStreamCreate = '/hls/streams';
  static const String hlsStreamById = '/hls/streams/{id}';
  static const String hlsStreamStart = '/hls/streams/{id}/start';
  static const String hlsStreamStop = '/hls/streams/{id}/stop';
  static const String hlsStreamSegments = '/hls/streams/{id}/segments';

  // ========== GROUP CHATS ENDPOINTS ==========
  static const String groupChats = '/group-chats';
  static const String groupChatCreate = '/group-chats';
  static const String groupChatById = '/group-chats/{id}';
  static const String groupChatUpdate = '/group-chats/{id}';
  static const String groupChatDelete = '/group-chats/{id}';
  static const String groupChatJoin = '/group-chats/{id}/join';
  static const String groupChatLeave = '/group-chats/{id}/leave';
  static const String groupChatMembers = '/group-chats/{id}/members';

  // ========== WRITTEN CHANNELS ENDPOINTS ==========
  static const String writtenChannels = '/written-channels';
  static const String writtenChannelCreate = '/written-channels';
  static const String writtenChannelById = '/written-channels/{id}';
  static const String writtenChannelUpdate = '/written-channels/{id}';
  static const String writtenChannelDelete = '/written-channels/{id}';
  static const String writtenChannelPosts = '/written-channels/{id}/posts';
  static const String writtenChannelSubscribe = '/written-channels/{id}/subscribe';
  static const String writtenChannelUnsubscribe = '/written-channels/{id}/unsubscribe';

  // ========== MAPS ENDPOINTS ==========
  static const String maps = '/maps';
  static const String mapSearch = '/maps/search';
  static const String mapNearby = '/maps/nearby';
  static const String mapDirections = '/maps/directions';

  // ========== INTEGRATIONS ENDPOINTS ==========
  static const String integrations = '/integrations';
  static const String integrationConnect = '/integrations/{provider}/connect';
  static const String integrationDisconnect = '/integrations/{provider}/disconnect';
  static const String integrationSync = '/integrations/{provider}/sync';

  // ========== MODERATION ENDPOINTS ==========
  static const String moderation = '/moderation';
  static const String moderationReports = '/moderation/reports';
  static const String moderationReportById = '/moderation/reports/{id}';
  static const String moderationApprove = '/moderation/{type}/{id}/approve';
  static const String moderationReject = '/moderation/{type}/{id}/reject';

  // ========== SEARCH ENDPOINTS (расширенные) ==========
  static const String searchAdvanced = '/search/advanced';
  static const String searchFilters = '/search/filters';
  static const String searchTags = '/search/tags';
  static const String searchUsers = '/search/users';
  static const String searchVideos = '/search/videos';
  static const String searchProducts = '/search/products';

  // ========== SUBSCRIPTIONS ENDPOINTS (расширенные) ==========
  static const String subscriptionsPlans = '/subscriptions/plans';
  static const String subscriptionsSubscribe = '/subscriptions/subscribe';
  static const String subscriptionsUnsubscribe = '/subscriptions/unsubscribe';
  static const String subscriptionsCancel = '/subscriptions/cancel';
  static const String subscriptionsRenew = '/subscriptions/renew';

  // ========== REQUESTS ENDPOINTS (расширенные) ==========
  static const String requestsFilters = '/requests/filters';
  static const String requestsCategories = '/requests/categories';
  static const String requestsStats = '/requests/stats';

  // ========== GAMIFICATION ENDPOINTS (расширенные) ==========
  static const String gamificationLevel = '/gamification/level';
  static const String gamificationBadges = '/gamification/badges';
  static const String gamificationRewards = '/gamification/rewards';
  static const String gamificationChallenges = '/gamification/challenges';

  // ========== OAUTH ENDPOINTS ==========
  static const String oauthProviders = '/oauth/providers';
  static const String oauthCallback = '/oauth/callback';
  static const String oauthToken = '/oauth/token';

  // ========== WEBSOCKET ENDPOINTS ==========
  static const String websocketConnect = '/ws/connect';
  static const String websocketDisconnect = '/ws/disconnect';
  static const String websocketSubscribe = '/ws/subscribe';
  static const String websocketUnsubscribe = '/ws/unsubscribe';

  // ========== UPLOAD ENDPOINTS (расширенные) ==========
  static const String upload = '/upload';
  static const String uploadImage = '/upload/image';
  static const String uploadVideo = '/upload/video';
  static const String uploadAudio = '/upload/audio';
  static const String uploadDocument = '/upload/document';

  // ========== UTILITY METHODS ==========
  
  /// Замена {id} в endpoint
  static String withId(String endpoint, String id) {
    return endpoint.replaceAll('{id}', id);
  }
  
  /// Замена множественных параметров в endpoint
  static String withParams(String endpoint, Map<String, String> params) {
    var result = endpoint;
    params.forEach((key, value) {
      result = result.replaceAll('{$key}', value);
    });
    return result;
  }

  /// Получение полного URL endpoint
  static String getFullUrl(String endpoint) {
    return '${AppConstants.apiBaseUrl}$endpoint';
  }

  /// Проверка является ли endpoint параметризованным
  static bool hasParams(String endpoint) {
    return endpoint.contains('{') && endpoint.contains('}');
  }

  /// Получение списка всех endpoints
  static List<String> getAllEndpoints() {
    return [
      // System
      rateLimitStatus, health, version, info,
      // Auth
      login, register, logout, refreshToken, resetPassword, verifyEmail, verifyPhone,
      authRefresh, authVerifySms, authVerifyEmail, forgotPassword, changePassword,
      enable2FA, disable2FA, verify2FA, googleAuth, appleAuth,
      // Videos
      videosFeed, videosSearch, videosUpload, videoDetail, videoLike, videoUnlike,
      videoFavorite, videoUnfavorite, videoComment, videosComments, videoShare,
      videoReport, videoViews, videoBlock,
      // Channels
      channels, channelDetail, channelSubscribe, channelUnsubscribe, channelVideos,
      // Search
      search, searchSuggestions, searchHistory, searchAdvanced, searchFilters,
      searchTags, searchUsers, searchVideos, searchProducts,
      // Requests
      requests, requestCreate, requestDetail, requestUpdate, requestProposals,
      requestProposalAccept, requestProposalReject, requestCancel, requestComplete,
      requestsFilters, requestsCategories, requestsStats,
      // Chats
      chatDialogs, chatMessages, chatSend, chatRead, chatTyping, chatUpload,
      // Profile
      profile, profileUpdate, profileAvatar, profileVideos, profileFavorites,
      profileRequests, profileSettings,
      // Master Profile
      masterProfile, masterProducts, masterSubscribers, masterStatistics, masterRequests,
      // Gamification
      gamificationProfile, gamificationAchievements, gamificationLeaderboard,
      gamificationAddPoints, gamificationAwardPoints, gamificationLevel,
      gamificationBadges, gamificationRewards, gamificationChallenges,
      // Notifications
      notifications, notificationRead, notificationReadAll, notificationSettings,
      // Support
      supportTickets, supportTicketCreate, supportTicketDetail, supportTicketReply,
      supportTicketClose,
      // Admin
      adminUsers, adminUsersBanned, adminVideos, adminModerate, adminPending,
      adminPendingApprove, adminPendingReject, adminReports, adminTickets, adminAds,
      adminStats, adminAnalytics, adminAnalyticsVideos, adminAnalyticsUsers,
      adminAnalyticsOrders, adminAnalyticsRevenue,
      // Orders
      orders, orderDetail, orderCancel,
      // Users
      users, userMe, userById, userUpdate, userDelete, userBlock, userUnblock,
      userFollow, userUnfollow, userFollowers, userFollowing,
      // Analytics
      analyticsEngagement, analyticsPlatform, analyticsRevenue, analyticsUser,
      analyticsVideoHeatmap, analyticsVideoMulticast,
      // AR/3D
      ar3dModelsProduct, ar3dModelsSearch, ar3dModelsUpload, ar3dModelsValidate,
      ar3dModelsPreview, ar3dModelsRender,
      // Calls
      calls, callCreate, callJoin, callLeave, callEnd,
      // Comments
      comments, commentCreate, commentById, commentUpdate, commentDelete,
      commentLike, commentUnlike, commentReplies,
      // Stories
      stories, storyCreate, storyById, storyUpdate, storyDelete, storyView,
      storyLike, storyUnlike,
      // Referrals
      referrals, referralCode, referralStats, referralRewards,
      // Live Streams
      liveStreams, liveStreamCreate, liveStreamById, liveStreamStart,
      liveStreamStop, liveStreamJoin, liveStreamLeave,
      // Voice Rooms
      voiceRooms, voiceRoomCreate, voiceRoomById, voiceRoomJoin, voiceRoomLeave,
      voiceRoomMute, voiceRoomUnmute,
      // HLS Streaming
      hlsStreams, hlsStreamCreate, hlsStreamById, hlsStreamStart, hlsStreamStop,
      hlsStreamSegments,
      // Group Chats
      groupChats, groupChatCreate, groupChatById, groupChatUpdate, groupChatDelete,
      groupChatJoin, groupChatLeave, groupChatMembers,
      // Written Channels
      writtenChannels, writtenChannelCreate, writtenChannelById, writtenChannelUpdate,
      writtenChannelDelete, writtenChannelPosts, writtenChannelSubscribe,
      writtenChannelUnsubscribe,
      // Maps
      maps, mapSearch, mapNearby, mapDirections,
      // Integrations
      integrations, integrationConnect, integrationDisconnect, integrationSync,
      // Moderation
      moderation, moderationReports, moderationReportById, moderationApprove,
      moderationReject,
      // Subscriptions
      subscriptionsPlans, subscriptionsSubscribe, subscriptionsUnsubscribe,
      subscriptionsCancel, subscriptionsRenew,
      // OAuth
      oauthProviders, oauthCallback, oauthToken,
      // WebSocket
      websocketConnect, websocketDisconnect, websocketSubscribe, websocketUnsubscribe,
      // Upload
      upload, uploadImage, uploadVideo, uploadAudio, uploadDocument,
    ];
  }
}


  static const String userBlock = '/users/{id}/block';
  static const String userUnblock = '/users/{id}/unblock';
  static const String userFollow = '/users/{id}/follow';
  static const String userUnfollow = '/users/{id}/unfollow';
  static const String userFollowers = '/users/{id}/followers';
  static const String userFollowing = '/users/{id}/following';

  // ========== ANALYTICS ENDPOINTS ==========
  static const String analyticsEngagement = '/analytics/engagement';
  static const String analyticsPlatform = '/analytics/platform';
  static const String analyticsRevenue = '/analytics/revenue';
  static const String analyticsUser = '/analytics/user';
  static const String analyticsVideoHeatmap = '/analytics/videos/{id}/heatmap';
  static const String analyticsVideoMulticast = '/analytics/videos/{id}/multicast';

  // ========== AR/3D ENDPOINTS ==========
  static const String ar3dModelsProduct = '/ar3d/models/product/{product_id}';
  static const String ar3dModelsSearch = '/ar3d/models/search';
  static const String ar3dModelsUpload = '/ar3d/models/upload';
  static const String ar3dModelsValidate = '/ar3d/models/validate';
  static const String ar3dModelsPreview = '/ar3d/models/{id}/preview';
  static const String ar3dModelsRender = '/ar3d/models/{id}/render';

  // ========== CALLS ENDPOINTS ==========
  static const String calls = '/calls';
  static const String callCreate = '/calls';
  static const String callJoin = '/calls/{id}/join';
  static const String callLeave = '/calls/{id}/leave';
  static const String callEnd = '/calls/{id}/end';

  // ========== COMMENTS ENDPOINTS ==========
  static const String comments = '/comments';
  static const String commentCreate = '/comments';
  static const String commentById = '/comments/{id}';
  static const String commentUpdate = '/comments/{id}';
  static const String commentDelete = '/comments/{id}';
  static const String commentLike = '/comments/{id}/like';
  static const String commentUnlike = '/comments/{id}/unlike';
  static const String commentReplies = '/comments/{id}/replies';

  // ========== STORIES ENDPOINTS ==========
  static const String stories = '/stories';
  static const String storyCreate = '/stories';
  static const String storyById = '/stories/{id}';
  static const String storyUpdate = '/stories/{id}';
  static const String storyDelete = '/stories/{id}';
  static const String storyView = '/stories/{id}/view';
  static const String storyLike = '/stories/{id}/like';
  static const String storyUnlike = '/stories/{id}/unlike';

  // ========== SUPPORT ENDPOINTS ==========
  static const String supportTickets = '/support/tickets';
  static const String supportTicketCreate = '/support/tickets';
  static const String supportTicketDetail = '/support/tickets/{id}';
  static const String supportTicketReply = '/support/tickets/{id}/reply';
  static const String supportTicketClose = '/support/tickets/{id}/close';

  // ========== REFERRALS ENDPOINTS ==========
  static const String referrals = '/referrals';
  static const String referralCode = '/referrals/code';
  static const String referralStats = '/referrals/stats';
  static const String referralRewards = '/referrals/rewards';

  // ========== LIVE STREAMS ENDPOINTS ==========
  static const String liveStreams = '/live-streams';
  static const String liveStreamCreate = '/live-streams';
  static const String liveStreamById = '/live-streams/{id}';
  static const String liveStreamStart = '/live-streams/{id}/start';
  static const String liveStreamStop = '/live-streams/{id}/stop';
  static const String liveStreamJoin = '/live-streams/{id}/join';
  static const String liveStreamLeave = '/live-streams/{id}/leave';

  // ========== VOICE ROOMS ENDPOINTS ==========
  static const String voiceRooms = '/voice-rooms';
  static const String voiceRoomCreate = '/voice-rooms';
  static const String voiceRoomById = '/voice-rooms/{id}';
  static const String voiceRoomJoin = '/voice-rooms/{id}/join';
  static const String voiceRoomLeave = '/voice-rooms/{id}/leave';
  static const String voiceRoomMute = '/voice-rooms/{id}/mute';
  static const String voiceRoomUnmute = '/voice-rooms/{id}/unmute';

  // ========== HLS STREAMING ENDPOINTS ==========
  static const String hlsStreams = '/hls/streams';
  static const String hlsStreamCreate = '/hls/streams';
  static const String hlsStreamById = '/hls/streams/{id}';
  static const String hlsStreamStart = '/hls/streams/{id}/start';
  static const String hlsStreamStop = '/hls/streams/{id}/stop';
  static const String hlsStreamSegments = '/hls/streams/{id}/segments';

  // ========== GROUP CHATS ENDPOINTS ==========
  static const String groupChats = '/group-chats';
  static const String groupChatCreate = '/group-chats';
  static const String groupChatById = '/group-chats/{id}';
  static const String groupChatUpdate = '/group-chats/{id}';
  static const String groupChatDelete = '/group-chats/{id}';
  static const String groupChatJoin = '/group-chats/{id}/join';
  static const String groupChatLeave = '/group-chats/{id}/leave';
  static const String groupChatMembers = '/group-chats/{id}/members';

  // ========== WRITTEN CHANNELS ENDPOINTS ==========
  static const String writtenChannels = '/written-channels';
  static const String writtenChannelCreate = '/written-channels';
  static const String writtenChannelById = '/written-channels/{id}';
  static const String writtenChannelUpdate = '/written-channels/{id}';
  static const String writtenChannelDelete = '/written-channels/{id}';
  static const String writtenChannelPosts = '/written-channels/{id}/posts';
  static const String writtenChannelSubscribe = '/written-channels/{id}/subscribe';
  static const String writtenChannelUnsubscribe = '/written-channels/{id}/unsubscribe';

  // ========== MAPS ENDPOINTS ==========
  static const String maps = '/maps';
  static const String mapSearch = '/maps/search';
  static const String mapNearby = '/maps/nearby';
  static const String mapDirections = '/maps/directions';

  // ========== INTEGRATIONS ENDPOINTS ==========
  static const String integrations = '/integrations';
  static const String integrationConnect = '/integrations/{provider}/connect';
  static const String integrationDisconnect = '/integrations/{provider}/disconnect';
  static const String integrationSync = '/integrations/{provider}/sync';

  // ========== MODERATION ENDPOINTS ==========
  static const String moderation = '/moderation';
  static const String moderationReports = '/moderation/reports';
  static const String moderationReportById = '/moderation/reports/{id}';
  static const String moderationApprove = '/moderation/{type}/{id}/approve';
  static const String moderationReject = '/moderation/{type}/{id}/reject';

  // ========== SEARCH ENDPOINTS (расширенные) ==========
  static const String searchAdvanced = '/search/advanced';
  static const String searchFilters = '/search/filters';
  static const String searchTags = '/search/tags';
  static const String searchUsers = '/search/users';
  static const String searchVideos = '/search/videos';
  static const String searchProducts = '/search/products';

  // ========== SUBSCRIPTIONS ENDPOINTS (расширенные) ==========
  static const String subscriptionsPlans = '/subscriptions/plans';
  static const String subscriptionsSubscribe = '/subscriptions/subscribe';
  static const String subscriptionsUnsubscribe = '/subscriptions/unsubscribe';
  static const String subscriptionsCancel = '/subscriptions/cancel';
  static const String subscriptionsRenew = '/subscriptions/renew';

  // ========== REQUESTS ENDPOINTS (расширенные) ==========
  static const String requestsFilters = '/requests/filters';
  static const String requestsCategories = '/requests/categories';
  static const String requestsStats = '/requests/stats';

  // ========== GAMIFICATION ENDPOINTS (расширенные) ==========
  static const String gamificationLevel = '/gamification/level';
  static const String gamificationBadges = '/gamification/badges';
  static const String gamificationRewards = '/gamification/rewards';
  static const String gamificationChallenges = '/gamification/challenges';

  // ========== OAUTH ENDPOINTS ==========
  static const String oauthProviders = '/oauth/providers';
  static const String oauthCallback = '/oauth/callback';
  static const String oauthToken = '/oauth/token';

  // ========== WEBSOCKET ENDPOINTS ==========
  static const String websocketConnect = '/ws/connect';
  static const String websocketDisconnect = '/ws/disconnect';
  static const String websocketSubscribe = '/ws/subscribe';
  static const String websocketUnsubscribe = '/ws/unsubscribe';

  // ========== UPLOAD ENDPOINTS (расширенные) ==========
  static const String upload = '/upload';
  static const String uploadImage = '/upload/image';
  static const String uploadVideo = '/upload/video';
  static const String uploadAudio = '/upload/audio';
  static const String uploadDocument = '/upload/document';

  // ========== UTILITY METHODS ==========
  
  /// Замена {id} в endpoint
  static String withId(String endpoint, String id) {
    return endpoint.replaceAll('{id}', id);
  }
  
  /// Замена множественных параметров в endpoint
  static String withParams(String endpoint, Map<String, String> params) {
    var result = endpoint;
    params.forEach((key, value) {
      result = result.replaceAll('{$key}', value);
    });
    return result;
  }

  /// Получение полного URL endpoint
  static String getFullUrl(String endpoint) {
    return '${AppConstants.apiBaseUrl}$endpoint';
  }

  /// Проверка является ли endpoint параметризованным
  static bool hasParams(String endpoint) {
    return endpoint.contains('{') && endpoint.contains('}');
  }

  /// Получение списка всех endpoints
  static List<String> getAllEndpoints() {
    return [
      // System
      rateLimitStatus, health, version, info,
      // Auth
      login, register, logout, refreshToken, resetPassword, verifyEmail, verifyPhone,
      authRefresh, authVerifySms, authVerifyEmail, forgotPassword, changePassword,
      enable2FA, disable2FA, verify2FA, googleAuth, appleAuth,
      // Videos
      videosFeed, videosSearch, videosUpload, videoDetail, videoLike, videoUnlike,
      videoFavorite, videoUnfavorite, videoComment, videosComments, videoShare,
      videoReport, videoViews, videoBlock,
      // Channels
      channels, channelDetail, channelSubscribe, channelUnsubscribe, channelVideos,
      // Search
      search, searchSuggestions, searchHistory, searchAdvanced, searchFilters,
      searchTags, searchUsers, searchVideos, searchProducts,
      // Requests
      requests, requestCreate, requestDetail, requestUpdate, requestProposals,
      requestProposalAccept, requestProposalReject, requestCancel, requestComplete,
      requestsFilters, requestsCategories, requestsStats,
      // Chats
      chatDialogs, chatMessages, chatSend, chatRead, chatTyping, chatUpload,
      // Profile
      profile, profileUpdate, profileAvatar, profileVideos, profileFavorites,
      profileRequests, profileSettings,
      // Master Profile
      masterProfile, masterProducts, masterSubscribers, masterStatistics, masterRequests,
      // Gamification
      gamificationProfile, gamificationAchievements, gamificationLeaderboard,
      gamificationAddPoints, gamificationAwardPoints, gamificationLevel,
      gamificationBadges, gamificationRewards, gamificationChallenges,
      // Notifications
      notifications, notificationRead, notificationReadAll, notificationSettings,
      // Support
      supportTickets, supportTicketCreate, supportTicketDetail, supportTicketReply,
      supportTicketClose,
      // Admin
      adminUsers, adminUsersBanned, adminVideos, adminModerate, adminPending,
      adminPendingApprove, adminPendingReject, adminReports, adminTickets, adminAds,
      adminStats, adminAnalytics, adminAnalyticsVideos, adminAnalyticsUsers,
      adminAnalyticsOrders, adminAnalyticsRevenue,
      // Orders
      orders, orderDetail, orderCancel,
      // Users
      users, userMe, userById, userUpdate, userDelete, userBlock, userUnblock,
      userFollow, userUnfollow, userFollowers, userFollowing,
      // Analytics
      analyticsEngagement, analyticsPlatform, analyticsRevenue, analyticsUser,
      analyticsVideoHeatmap, analyticsVideoMulticast,
      // AR/3D
      ar3dModelsProduct, ar3dModelsSearch, ar3dModelsUpload, ar3dModelsValidate,
      ar3dModelsPreview, ar3dModelsRender,
      // Calls
      calls, callCreate, callJoin, callLeave, callEnd,
      // Comments
      comments, commentCreate, commentById, commentUpdate, commentDelete,
      commentLike, commentUnlike, commentReplies,
      // Stories
      stories, storyCreate, storyById, storyUpdate, storyDelete, storyView,
      storyLike, storyUnlike,
      // Referrals
      referrals, referralCode, referralStats, referralRewards,
      // Live Streams
      liveStreams, liveStreamCreate, liveStreamById, liveStreamStart,
      liveStreamStop, liveStreamJoin, liveStreamLeave,
      // Voice Rooms
      voiceRooms, voiceRoomCreate, voiceRoomById, voiceRoomJoin, voiceRoomLeave,
      voiceRoomMute, voiceRoomUnmute,
      // HLS Streaming
      hlsStreams, hlsStreamCreate, hlsStreamById, hlsStreamStart, hlsStreamStop,
      hlsStreamSegments,
      // Group Chats
      groupChats, groupChatCreate, groupChatById, groupChatUpdate, groupChatDelete,
      groupChatJoin, groupChatLeave, groupChatMembers,
      // Written Channels
      writtenChannels, writtenChannelCreate, writtenChannelById, writtenChannelUpdate,
      writtenChannelDelete, writtenChannelPosts, writtenChannelSubscribe,
      writtenChannelUnsubscribe,
      // Maps
      maps, mapSearch, mapNearby, mapDirections,
      // Integrations
      integrations, integrationConnect, integrationDisconnect, integrationSync,
      // Moderation
      moderation, moderationReports, moderationReportById, moderationApprove,
      moderationReject,
      // Subscriptions
      subscriptionsPlans, subscriptionsSubscribe, subscriptionsUnsubscribe,
      subscriptionsCancel, subscriptionsRenew,
      // OAuth
      oauthProviders, oauthCallback, oauthToken,
      // WebSocket
      websocketConnect, websocketDisconnect, websocketSubscribe, websocketUnsubscribe,
      // Upload
      upload, uploadImage, uploadVideo, uploadAudio, uploadDocument,
    ];
  }
}

