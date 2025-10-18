class GamificationStats {
  final int currentLevel;
  final int totalPoints;
  final int pointsToNextLevel;
  final double progressToNextLevel;
  final List<Achievement> achievements;
  
  const GamificationStats({
    required this.currentLevel,
    required this.totalPoints,
    required this.pointsToNextLevel,
    required this.progressToNextLevel,
    required this.achievements,
  });
}
class Achievement {
  final String id;
  final String title;
  final String description;
  final bool isUnlocked;
  
  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.isUnlocked,
  });
}
class LeaderboardEntry {
  final String userId;
  final String userName;
  final int points;
  final int rank;
  
  const LeaderboardEntry({
    required this.userId,
    required this.userName,
    required this.points,
    required this.rank,
  });
}

extension GamificationStatsExtension on GamificationStats {
  List<LeaderboardEntry> get leaderboard => [];
}

extension LeaderboardEntryExt on LeaderboardEntry {
  String get name => userName;
  String get username => userName;
  int get level => (points / 100).floor();
}

extension AchievementExt on Achievement {
  int get requiredPoints => 100;
}

