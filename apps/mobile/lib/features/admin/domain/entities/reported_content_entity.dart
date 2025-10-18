class ReportedContentEntity {
  final String id;
  final String contentId;
  final String contentType;
  final String contentTitle;
  final String reason;
  final String reporterName;
  final DateTime createdAt;

  const ReportedContentEntity({
    required this.id,
    required this.contentId,
    required this.contentType,
    required this.contentTitle,
    required this.reason,
    required this.reporterName,
    required this.createdAt,
  });
}

