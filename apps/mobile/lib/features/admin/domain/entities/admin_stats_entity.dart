class AdminStatsEntity {
  final int pendingContentCount;
  final int reportedContentCount;
  final int totalUsers;
  final int bannedUsers;
  final int pendingTickets;
  final int activeAds;

  const AdminStatsEntity({
    required this.pendingContentCount,
    required this.reportedContentCount,
    required this.totalUsers,
    required this.bannedUsers,
    required this.pendingTickets,
    required this.activeAds,
  });
}
