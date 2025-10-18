import 'package:json_annotation/json_annotation.dart';


class GamificationStats {
  final int totalPoints;
  final int currentLevel;
  final int pointsToNextLevel;
  final double progressToNextLevel;
  final List<Achievement> achievements;
  final List<LeaderboardEntry> leaderboard;

  const GamificationStats({
    this.totalPoints = 0,
    this.currentLevel = 1,
    this.pointsToNextLevel = 100,
    this.progressToNextLevel = 0.0,
    this.achievements = const [],
    this.leaderboard = const [],
  });

  GamificationStats copyWith({
    int? totalPoints,
    int? currentLevel,
    int? pointsToNextLevel,
    double? progressToNextLevel,
    List<Achievement>? achievements,
    List<LeaderboardEntry>? leaderboard,
  }) {
    return GamificationStats(
      totalPoints: totalPoints ?? this.totalPoints,
      currentLevel: currentLevel ?? this.currentLevel,
      pointsToNextLevel: pointsToNextLevel ?? this.pointsToNextLevel,
      progressToNextLevel: progressToNextLevel ?? this.progressToNextLevel,
      achievements: achievements ?? this.achievements,
      leaderboard: leaderboard ?? this.leaderboard,
    );
  }
}

@JsonSerializable()
class UserStats {
  final int userId;
  final int points;
  final int level;
  final int completedOrders;
  final int totalLikes;
  final int totalComments;
  final int totalSubscribers;
  final int totalVideos;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const UserStats({
    required this.userId,
    required this.points,
    required this.level,
    required this.completedOrders,
    required this.totalLikes,
    required this.totalComments,
    required this.totalSubscribers,
    required this.totalVideos,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => UserStats(
    userId: json['user_id'] ?? 0,
    points: json['points'] ?? 0,
    level: json['level'] ?? 1,
    completedOrders: json['completed_orders'] ?? 0,
    totalLikes: json['total_likes'] ?? 0,
    totalComments: json['total_comments'] ?? 0,
    totalVideos: json['total_videos'] ?? 0,
    totalSubscribers: json['total_subscribers'] ?? 0,
    createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
    updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : DateTime.now(),
  );
  
  Map<String, dynamic> toJson() => {
    'user_id': userId,
    'points': points,
    'level': level,
    'completed_orders': completedOrders,
    'total_likes': totalLikes,
    'total_comments': totalComments,
    'total_videos': totalVideos,
    'total_subscribers': totalSubscribers,
    'created_at': createdAt.toIso8601String(),
    'updated_at': updatedAt.toIso8601String(),
  };
}

@JsonSerializable()
class Achievement {
  final int id;
  final String title;
  final String description;
  final String icon;
  final int pointsReward;
  final String category;
  final bool isUnlocked;
  @JsonKey(name: 'unlocked_at')
  final DateTime? unlockedAt;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.pointsReward,
    required this.category,
    required this.isUnlocked,
    this.unlockedAt,
    required this.createdAt,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) => Achievement(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    icon: json['icon'] ?? '',
    category: json['category'] ?? '',
    pointsReward: json['points_reward'] ?? json['points'] ?? 0,
    isUnlocked: json['is_unlocked'] ?? false,
    unlockedAt: json['unlocked_at'] != null ? DateTime.parse(json['unlocked_at']) : null,
    createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'icon': icon,
    'category': category,
    'points_reward': pointsReward,
    'is_unlocked': isUnlocked,
    'unlocked_at': unlockedAt?.toIso8601String(),
    'created_at': createdAt.toIso8601String(),
  };
}

@JsonSerializable()
class LeaderboardEntry {
  final int userId;
  final String userName;
  final String? userAvatar;
  final int points;
  final int level;
  final int rank;
  final String role;

  const LeaderboardEntry({
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.points,
    required this.level,
    required this.rank,
    required this.role,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) => LeaderboardEntry(
    userId: json['user_id'] ?? 0,
    userName: json['user_name'] ?? json['username'] ?? '',
    userAvatar: json['user_avatar'],
    points: json['points'] ?? 0,
    level: json['level'] ?? 1,
    rank: json['rank'] ?? 0,
    role: json['role'] ?? 'user',
  );
  
  Map<String, dynamic> toJson() => {
    'user_id': userId,
    'user_name': userName,
    'user_avatar': userAvatar,
    'points': points,
    'level': level,
    'rank': rank,
    'role': role,
  };
}

@JsonSerializable()
class Level {
  final int level;
  final int minPoints;
  final int maxPoints;
  final String title;
  final String description;
  final String color;
  final String icon;

  const Level({
    required this.level,
    required this.minPoints,
    required this.maxPoints,
    required this.title,
    required this.description,
    required this.color,
    required this.icon,
  });

  factory Level.fromJson(Map<String, dynamic> json) => Level(
    level: json['level'] ?? 1,
    title: json['title'] ?? '',
    minPoints: json['min_points'] ?? 0,
    maxPoints: json['max_points'] ?? 100,
    description: json['description'] ?? '',
    color: json['color'] ?? '#000000',
    icon: json['icon'] ?? '⭐',
  );
  
  Map<String, dynamic> toJson() => {
    'level': level,
    'title': title,
    'min_points': minPoints,
    'max_points': maxPoints,
    'description': description,
    'color': color,
    'icon': icon,
  };
}

// Predefined levels
class LevelSystem {
  static final List<Level> levels = [
    Level(
      level: 1,
      minPoints: 0,
      maxPoints: 100,
      title: 'Новичок',
      description: 'Добро пожаловать в Mebelplace!',
      color: '#9E9E9E',
      icon: '🌱',
    ),
    Level(
      level: 2,
      minPoints: 100,
      maxPoints: 300,
      title: 'Ученик',
      description: 'Вы начинаете свой путь!',
      color: '#4CAF50',
      icon: '📚',
    ),
    Level(
      level: 3,
      minPoints: 300,
      maxPoints: 600,
      title: 'Подмастерье',
      description: 'Набираетесь опыта',
      color: '#2196F3',
      icon: '🔨',
    ),
    Level(
      level: 4,
      minPoints: 600,
      maxPoints: 1000,
      title: 'Мастер',
      description: 'Настоящий профессионал',
      color: '#FF9800',
      icon: '⭐',
    ),
    Level(
      level: 5,
      minPoints: 1000,
      maxPoints: 1500,
      title: 'Эксперт',
      description: 'Высший уровень мастерства',
      color: '#9C27B0',
      icon: '👑',
    ),
    Level(
      level: 6,
      minPoints: 1500,
      maxPoints: 2500,
      title: 'Гуру',
      description: 'Легенда Mebelplace',
      color: '#F44336',
      icon: '🏆',
    ),
  ];

  static Level getLevelByPoints(int points) {
    for (final level in levels.reversed) {
      if (points >= level.minPoints) {
        return level;
      }
    }
    return levels.first;
  }

  static Level? getNextLevel(int points) {
    final currentLevel = getLevelByPoints(points);
    final currentIndex = levels.indexOf(currentLevel);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }

  static double getProgressToNextLevel(int points) {
    final currentLevel = getLevelByPoints(points);
    final nextLevel = getNextLevel(points);
    
    if (nextLevel == null) {
      return 1.0; // Max level reached
    }
    
    final progress = (points - currentLevel.minPoints) / 
                    (nextLevel.minPoints - currentLevel.minPoints);
    return progress.clamp(0.0, 1.0);
  }
}

// Predefined achievements
class AchievementSystem {
  static final List<Achievement> achievements = [
    // User achievements
    Achievement(
      id: 1,
      title: 'Первый шаг',
      description: 'Создайте первую заявку',
      icon: '🎯',
      pointsReward: 10,
      category: 'user',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 2,
      title: 'Активный пользователь',
      description: 'Создайте 10 заявок',
      icon: '📝',
      pointsReward: 50,
      category: 'user',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 3,
      title: 'Заказчик',
      description: 'Выполните первый заказ',
      icon: '✅',
      pointsReward: 25,
      category: 'user',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 4,
      title: 'Постоянный клиент',
      description: 'Выполните 5 заказов',
      icon: '🛒',
      pointsReward: 100,
      category: 'user',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    
    // Master achievements
    Achievement(
      id: 5,
      title: 'Первый мастер',
      description: 'Загрузите первое видео',
      icon: '🎬',
      pointsReward: 15,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 6,
      title: 'Контент-мейкер',
      description: 'Загрузите 10 видео',
      icon: '📹',
      pointsReward: 75,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 7,
      title: 'Популярный',
      description: 'Получите 100 лайков',
      icon: '❤️',
      pointsReward: 50,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 8,
      title: 'Звезда',
      description: 'Получите 1000 лайков',
      icon: '⭐',
      pointsReward: 200,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 9,
      title: 'Наставник',
      description: 'Получите 100 подписчиков',
      icon: '👥',
      pointsReward: 150,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 10,
      title: 'Лидер мнений',
      description: 'Получите 1000 подписчиков',
      icon: '👑',
      pointsReward: 500,
      category: 'master',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    
    // Social achievements
    Achievement(
      id: 11,
      title: 'Комментатор',
      description: 'Оставьте первый комментарий',
      icon: '💬',
      pointsReward: 5,
      category: 'social',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 12,
      title: 'Общительный',
      description: 'Оставьте 50 комментариев',
      icon: '🗣️',
      pointsReward: 30,
      category: 'social',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
    Achievement(
      id: 13,
      title: 'Друг',
      description: 'Подпишитесь на 10 мастеров',
      icon: '🤝',
      pointsReward: 20,
      category: 'social',
      isUnlocked: false,
      createdAt: DateTime.now(),
    ),
  ];

  static List<Achievement> getAchievementsByCategory(String category) {
    return achievements.where((a) => a.category == category).toList();
  }

  static List<Achievement> getUnlockedAchievements(List<Achievement> userAchievements) {
    return userAchievements.where((a) => a.isUnlocked).toList();
  }

  static List<Achievement> getLockedAchievements(List<Achievement> userAchievements) {
    return userAchievements.where((a) => !a.isUnlocked).toList();
  }
}

