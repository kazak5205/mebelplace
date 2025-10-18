import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../data/models/gamification_model.dart';

class GamificationScreen extends StatelessWidget {
  final UserPointsModel userPoints;
  final List<AchievementModel> achievements;
  final List<String> unlockedAchievementIds;
  final List<LeaderboardEntryModel> leaderboard;
  final String currentUserId;

  const GamificationScreen({
    super.key,
    required this.userPoints,
    required this.achievements,
    required this.unlockedAchievementIds,
    required this.leaderboard,
    required this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Геймификация'),
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.emoji_events), text: 'Мой прогресс'),
              Tab(icon: Icon(Icons.leaderboard), text: 'Лидеры'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildProgressTab(context),
            _buildLeaderboardTab(context),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressTab(BuildContext context) {
    final formatter = NumberFormat('#,###', 'ru_RU');
    final unlocked = unlockedAchievementIds.toSet();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // User progress card
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF667eea), Color(0xFFf093fb)],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.purple.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Уровень',
                        style: TextStyle(color: Colors.white70, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${userPoints.level}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Text('🏆', style: TextStyle(fontSize: 56)),
                ],
              ),
              const SizedBox(height: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Прогресс',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      Text(
                        '${userPoints.totalPoints} / ${userPoints.nextLevelAt}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: userPoints.progressPercent / 100,
                      minHeight: 12,
                      backgroundColor: Colors.white24,
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStat('Всего очков', formatter.format(userPoints.totalPoints)),
                  _buildStat('Рейтинг', '#${userPoints.rank}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        // Achievements
        Text(
          'Достижения',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),

        ...achievements.map((achievement) {
          final isUnlocked = unlocked.contains(achievement.id);

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            color: isUnlocked ? Colors.amber.shade50 : Colors.grey.shade100,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Text(
                    achievement.icon,
                    style: TextStyle(
                      fontSize: 40,
                      color: isUnlocked ? null : Colors.grey,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          achievement.getTitle('ru'),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: isUnlocked ? Colors.black87 : Colors.grey.shade700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          achievement.getDescription('ru'),
                          style: TextStyle(
                            fontSize: 13,
                            color: isUnlocked ? Colors.grey.shade700 : Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isUnlocked ? Colors.amber : Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '+${achievement.points} очков',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isUnlocked ? Colors.amber.shade900 : Colors.grey.shade700,
                                ),
                              ),
                            ),
                            if (isUnlocked) ...[
                              const SizedBox(width: 8),
                              const Text(
                                '✓ Получено',
                                style: TextStyle(
                                  color: Colors.green,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildLeaderboardTab(BuildContext context) {
    final formatter = NumberFormat('#,###', 'ru_RU');

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: leaderboard.length,
      itemBuilder: (context, index) {
        final entry = leaderboard[index];
        final isCurrentUser = entry.userId == currentUserId;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          color: isCurrentUser ? Colors.blue.shade50 : Colors.white,
          elevation: isCurrentUser ? 4 : 1,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Rank
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: entry.rank <= 3
                        ? LinearGradient(
                            colors: entry.rank == 1
                                ? [Colors.amber, Colors.orange]
                                : entry.rank == 2
                                    ? [Colors.grey.shade300, Colors.grey.shade400]
                                    : [Colors.orange.shade300, Colors.orange.shade500],
                          )
                        : null,
                    color: entry.rank > 3 ? Colors.grey.shade200 : null,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      entry.medalEmoji,
                      style: TextStyle(
                        fontSize: entry.rank <= 3 ? 24 : 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Avatar
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Colors.purple.shade300,
                  child: Text(
                    entry.username[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // User info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            entry.username,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                          ),
                          if (isCurrentUser) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.blue,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Вы',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Уровень ${entry.level}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),

                // Points
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatter.format(entry.totalPoints),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(
                      'очков',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

