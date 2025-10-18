class UserPointsModel {
  final String userId;
  final int totalPoints;
  final int level;
  final int rank;
  final int nextLevelAt;
  final DateTime updatedAt;

  UserPointsModel({
    required this.userId,
    required this.totalPoints,
    required this.level,
    required this.rank,
    required this.nextLevelAt,
    required this.updatedAt,
  });

  factory UserPointsModel.fromJson(Map<String, dynamic> json) {
    return UserPointsModel(
      userId: json['user_id'],
      totalPoints: json['total_points'],
      level: json['level'],
      rank: json['rank'],
      nextLevelAt: json['next_level_at'],
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  double get progressPercent {
    final pointsInLevel = totalPoints % nextLevelAt;
    return (pointsInLevel / nextLevelAt) * 100;
  }
}

class AchievementModel {
  final String id;
  final String code;
  final Map<String, String> title;
  final Map<String, String> description;
  final String icon;
  final int points;
  final String requirement;
  final DateTime createdAt;

  AchievementModel({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    required this.icon,
    required this.points,
    required this.requirement,
    required this.createdAt,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      id: json['id'],
      code: json['code'],
      title: Map<String, String>.from(json['title']),
      description: Map<String, String>.from(json['description']),
      icon: json['icon'],
      points: json['points'],
      requirement: json['requirement'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  String getTitle(String locale) => title[locale] ?? title['en'] ?? '';
  String getDescription(String locale) => description[locale] ?? description['en'] ?? '';
}

class LeaderboardEntryModel {
  final int rank;
  final String userId;
  final String username;
  final String avatar;
  final int totalPoints;
  final int level;

  LeaderboardEntryModel({
    required this.rank,
    required this.userId,
    required this.username,
    required this.avatar,
    required this.totalPoints,
    required this.level,
  });

  factory LeaderboardEntryModel.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntryModel(
      rank: json['rank'],
      userId: json['user_id'],
      username: json['username'],
      avatar: json['avatar'] ?? '',
      totalPoints: json['total_points'],
      level: json['level'],
    );
  }

  String get medalEmoji {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '#$rank';
    }
  }
}

