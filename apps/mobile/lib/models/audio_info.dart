class AudioInfo {
  final int id;
  final String title;
  final String artist;
  final String category;
  final String previewUrl;
  final int duration;
  final bool isPopular;
  final DateTime createdAt;

  AudioInfo({
    required this.id,
    required this.title,
    required this.artist,
    required this.category,
    required this.previewUrl,
    required this.duration,
    this.isPopular = false,
    required this.createdAt,
  });
}


