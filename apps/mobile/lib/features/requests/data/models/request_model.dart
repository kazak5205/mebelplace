class RequestModel {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String category;
  final String region;
  final List<String> photos;
  final String status; // pending, active, accepted, closed
  final DateTime createdAt;
  final DateTime updatedAt;

  RequestModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.category,
    required this.region,
    required this.photos,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      region: json['region'],
      photos: List<String>.from(json['photos'] ?? []),
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'description': description,
      'category': category,
      'region': region,
      'photos': photos,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  // Convert to domain entity
  // Note: Simplified conversion - full mapping in repository
  dynamic toEntity() {
    // Returns raw data for repository to convert properly
    return this;
  }
}

class ProposalModel {
  final String id;
  final String requestId;
  final String masterId;
  final String price;
  final DateTime deadline;
  final String description;
  final String status; // pending, accepted, rejected, withdrawn
  final DateTime createdAt;
  final DateTime updatedAt;

  ProposalModel({
    required this.id,
    required this.requestId,
    required this.masterId,
    required this.price,
    required this.deadline,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProposalModel.fromJson(Map<String, dynamic> json) {
    return ProposalModel(
      id: json['id'],
      requestId: json['request_id'],
      masterId: json['master_id'],
      price: json['price'].toString(),
      deadline: DateTime.parse(json['deadline']),
      description: json['description'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  double get priceAsDouble => double.tryParse(price) ?? 0;
}

class CreateRequestDTO {
  final String title;
  final String description;
  final String category;
  final String region;
  final List<String> photos;

  CreateRequestDTO({
    required this.title,
    required this.description,
    required this.category,
    required this.region,
    this.photos = const [],
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'region': region,
      'photos': photos,
    };
  }
}

class CreateProposalDTO {
  final String price;
  final String deadline; // ISO 8601 format
  final String description;

  CreateProposalDTO({
    required this.price,
    required this.deadline,
    required this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'price': price,
      'deadline': deadline,
      'description': description,
    };
  }
}
