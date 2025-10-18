// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $CachedVideosTable extends CachedVideos
    with TableInfo<$CachedVideosTable, CachedVideo> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedVideosTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _videoIdMeta = const VerificationMeta(
    'videoId',
  );
  @override
  late final GeneratedColumn<String> videoId = GeneratedColumn<String>(
    'video_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dataMeta = const VerificationMeta('data');
  @override
  late final GeneratedColumn<String> data = GeneratedColumn<String>(
    'data',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastViewedMeta = const VerificationMeta(
    'lastViewed',
  );
  @override
  late final GeneratedColumn<DateTime> lastViewed = GeneratedColumn<DateTime>(
    'last_viewed',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _viewCountMeta = const VerificationMeta(
    'viewCount',
  );
  @override
  late final GeneratedColumn<int> viewCount = GeneratedColumn<int>(
    'view_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    videoId,
    data,
    cachedAt,
    lastViewed,
    viewCount,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_videos';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedVideo> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('video_id')) {
      context.handle(
        _videoIdMeta,
        videoId.isAcceptableOrUnknown(data['video_id']!, _videoIdMeta),
      );
    } else if (isInserting) {
      context.missing(_videoIdMeta);
    }
    if (data.containsKey('data')) {
      context.handle(
        _dataMeta,
        this.data.isAcceptableOrUnknown(data['data']!, _dataMeta),
      );
    } else if (isInserting) {
      context.missing(_dataMeta);
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    if (data.containsKey('last_viewed')) {
      context.handle(
        _lastViewedMeta,
        lastViewed.isAcceptableOrUnknown(data['last_viewed']!, _lastViewedMeta),
      );
    }
    if (data.containsKey('view_count')) {
      context.handle(
        _viewCountMeta,
        viewCount.isAcceptableOrUnknown(data['view_count']!, _viewCountMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedVideo map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedVideo(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      videoId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}video_id'],
      )!,
      data: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data'],
      )!,
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
      lastViewed: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_viewed'],
      ),
      viewCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}view_count'],
      )!,
    );
  }

  @override
  $CachedVideosTable createAlias(String alias) {
    return $CachedVideosTable(attachedDatabase, alias);
  }
}

class CachedVideo extends DataClass implements Insertable<CachedVideo> {
  final int id;
  final String videoId;
  final String data;
  final DateTime cachedAt;
  final DateTime? lastViewed;
  final int viewCount;
  const CachedVideo({
    required this.id,
    required this.videoId,
    required this.data,
    required this.cachedAt,
    this.lastViewed,
    required this.viewCount,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['video_id'] = Variable<String>(videoId);
    map['data'] = Variable<String>(data);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    if (!nullToAbsent || lastViewed != null) {
      map['last_viewed'] = Variable<DateTime>(lastViewed);
    }
    map['view_count'] = Variable<int>(viewCount);
    return map;
  }

  CachedVideosCompanion toCompanion(bool nullToAbsent) {
    return CachedVideosCompanion(
      id: Value(id),
      videoId: Value(videoId),
      data: Value(data),
      cachedAt: Value(cachedAt),
      lastViewed: lastViewed == null && nullToAbsent
          ? const Value.absent()
          : Value(lastViewed),
      viewCount: Value(viewCount),
    );
  }

  factory CachedVideo.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedVideo(
      id: serializer.fromJson<int>(json['id']),
      videoId: serializer.fromJson<String>(json['videoId']),
      data: serializer.fromJson<String>(json['data']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
      lastViewed: serializer.fromJson<DateTime?>(json['lastViewed']),
      viewCount: serializer.fromJson<int>(json['viewCount']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'videoId': serializer.toJson<String>(videoId),
      'data': serializer.toJson<String>(data),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
      'lastViewed': serializer.toJson<DateTime?>(lastViewed),
      'viewCount': serializer.toJson<int>(viewCount),
    };
  }

  CachedVideo copyWith({
    int? id,
    String? videoId,
    String? data,
    DateTime? cachedAt,
    Value<DateTime?> lastViewed = const Value.absent(),
    int? viewCount,
  }) => CachedVideo(
    id: id ?? this.id,
    videoId: videoId ?? this.videoId,
    data: data ?? this.data,
    cachedAt: cachedAt ?? this.cachedAt,
    lastViewed: lastViewed.present ? lastViewed.value : this.lastViewed,
    viewCount: viewCount ?? this.viewCount,
  );
  CachedVideo copyWithCompanion(CachedVideosCompanion data) {
    return CachedVideo(
      id: data.id.present ? data.id.value : this.id,
      videoId: data.videoId.present ? data.videoId.value : this.videoId,
      data: data.data.present ? data.data.value : this.data,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      lastViewed: data.lastViewed.present
          ? data.lastViewed.value
          : this.lastViewed,
      viewCount: data.viewCount.present ? data.viewCount.value : this.viewCount,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedVideo(')
          ..write('id: $id, ')
          ..write('videoId: $videoId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('lastViewed: $lastViewed, ')
          ..write('viewCount: $viewCount')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, videoId, data, cachedAt, lastViewed, viewCount);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedVideo &&
          other.id == this.id &&
          other.videoId == this.videoId &&
          other.data == this.data &&
          other.cachedAt == this.cachedAt &&
          other.lastViewed == this.lastViewed &&
          other.viewCount == this.viewCount);
}

class CachedVideosCompanion extends UpdateCompanion<CachedVideo> {
  final Value<int> id;
  final Value<String> videoId;
  final Value<String> data;
  final Value<DateTime> cachedAt;
  final Value<DateTime?> lastViewed;
  final Value<int> viewCount;
  const CachedVideosCompanion({
    this.id = const Value.absent(),
    this.videoId = const Value.absent(),
    this.data = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.lastViewed = const Value.absent(),
    this.viewCount = const Value.absent(),
  });
  CachedVideosCompanion.insert({
    this.id = const Value.absent(),
    required String videoId,
    required String data,
    required DateTime cachedAt,
    this.lastViewed = const Value.absent(),
    this.viewCount = const Value.absent(),
  }) : videoId = Value(videoId),
       data = Value(data),
       cachedAt = Value(cachedAt);
  static Insertable<CachedVideo> custom({
    Expression<int>? id,
    Expression<String>? videoId,
    Expression<String>? data,
    Expression<DateTime>? cachedAt,
    Expression<DateTime>? lastViewed,
    Expression<int>? viewCount,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (videoId != null) 'video_id': videoId,
      if (data != null) 'data': data,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (lastViewed != null) 'last_viewed': lastViewed,
      if (viewCount != null) 'view_count': viewCount,
    });
  }

  CachedVideosCompanion copyWith({
    Value<int>? id,
    Value<String>? videoId,
    Value<String>? data,
    Value<DateTime>? cachedAt,
    Value<DateTime?>? lastViewed,
    Value<int>? viewCount,
  }) {
    return CachedVideosCompanion(
      id: id ?? this.id,
      videoId: videoId ?? this.videoId,
      data: data ?? this.data,
      cachedAt: cachedAt ?? this.cachedAt,
      lastViewed: lastViewed ?? this.lastViewed,
      viewCount: viewCount ?? this.viewCount,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (videoId.present) {
      map['video_id'] = Variable<String>(videoId.value);
    }
    if (data.present) {
      map['data'] = Variable<String>(data.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (lastViewed.present) {
      map['last_viewed'] = Variable<DateTime>(lastViewed.value);
    }
    if (viewCount.present) {
      map['view_count'] = Variable<int>(viewCount.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedVideosCompanion(')
          ..write('id: $id, ')
          ..write('videoId: $videoId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('lastViewed: $lastViewed, ')
          ..write('viewCount: $viewCount')
          ..write(')'))
        .toString();
  }
}

class $CachedChatsTable extends CachedChats
    with TableInfo<$CachedChatsTable, CachedChat> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedChatsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _chatIdMeta = const VerificationMeta('chatId');
  @override
  late final GeneratedColumn<String> chatId = GeneratedColumn<String>(
    'chat_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  static const VerificationMeta _dataMeta = const VerificationMeta('data');
  @override
  late final GeneratedColumn<String> data = GeneratedColumn<String>(
    'data',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastMessageAtMeta = const VerificationMeta(
    'lastMessageAt',
  );
  @override
  late final GeneratedColumn<DateTime> lastMessageAt =
      GeneratedColumn<DateTime>(
        'last_message_at',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    chatId,
    data,
    cachedAt,
    lastMessageAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_chats';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedChat> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('chat_id')) {
      context.handle(
        _chatIdMeta,
        chatId.isAcceptableOrUnknown(data['chat_id']!, _chatIdMeta),
      );
    } else if (isInserting) {
      context.missing(_chatIdMeta);
    }
    if (data.containsKey('data')) {
      context.handle(
        _dataMeta,
        this.data.isAcceptableOrUnknown(data['data']!, _dataMeta),
      );
    } else if (isInserting) {
      context.missing(_dataMeta);
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    if (data.containsKey('last_message_at')) {
      context.handle(
        _lastMessageAtMeta,
        lastMessageAt.isAcceptableOrUnknown(
          data['last_message_at']!,
          _lastMessageAtMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedChat map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedChat(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      chatId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}chat_id'],
      )!,
      data: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data'],
      )!,
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
      lastMessageAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_message_at'],
      ),
    );
  }

  @override
  $CachedChatsTable createAlias(String alias) {
    return $CachedChatsTable(attachedDatabase, alias);
  }
}

class CachedChat extends DataClass implements Insertable<CachedChat> {
  final int id;
  final String chatId;
  final String data;
  final DateTime cachedAt;
  final DateTime? lastMessageAt;
  const CachedChat({
    required this.id,
    required this.chatId,
    required this.data,
    required this.cachedAt,
    this.lastMessageAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['chat_id'] = Variable<String>(chatId);
    map['data'] = Variable<String>(data);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    if (!nullToAbsent || lastMessageAt != null) {
      map['last_message_at'] = Variable<DateTime>(lastMessageAt);
    }
    return map;
  }

  CachedChatsCompanion toCompanion(bool nullToAbsent) {
    return CachedChatsCompanion(
      id: Value(id),
      chatId: Value(chatId),
      data: Value(data),
      cachedAt: Value(cachedAt),
      lastMessageAt: lastMessageAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastMessageAt),
    );
  }

  factory CachedChat.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedChat(
      id: serializer.fromJson<int>(json['id']),
      chatId: serializer.fromJson<String>(json['chatId']),
      data: serializer.fromJson<String>(json['data']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
      lastMessageAt: serializer.fromJson<DateTime?>(json['lastMessageAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'chatId': serializer.toJson<String>(chatId),
      'data': serializer.toJson<String>(data),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
      'lastMessageAt': serializer.toJson<DateTime?>(lastMessageAt),
    };
  }

  CachedChat copyWith({
    int? id,
    String? chatId,
    String? data,
    DateTime? cachedAt,
    Value<DateTime?> lastMessageAt = const Value.absent(),
  }) => CachedChat(
    id: id ?? this.id,
    chatId: chatId ?? this.chatId,
    data: data ?? this.data,
    cachedAt: cachedAt ?? this.cachedAt,
    lastMessageAt: lastMessageAt.present
        ? lastMessageAt.value
        : this.lastMessageAt,
  );
  CachedChat copyWithCompanion(CachedChatsCompanion data) {
    return CachedChat(
      id: data.id.present ? data.id.value : this.id,
      chatId: data.chatId.present ? data.chatId.value : this.chatId,
      data: data.data.present ? data.data.value : this.data,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      lastMessageAt: data.lastMessageAt.present
          ? data.lastMessageAt.value
          : this.lastMessageAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedChat(')
          ..write('id: $id, ')
          ..write('chatId: $chatId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('lastMessageAt: $lastMessageAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, chatId, data, cachedAt, lastMessageAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedChat &&
          other.id == this.id &&
          other.chatId == this.chatId &&
          other.data == this.data &&
          other.cachedAt == this.cachedAt &&
          other.lastMessageAt == this.lastMessageAt);
}

class CachedChatsCompanion extends UpdateCompanion<CachedChat> {
  final Value<int> id;
  final Value<String> chatId;
  final Value<String> data;
  final Value<DateTime> cachedAt;
  final Value<DateTime?> lastMessageAt;
  const CachedChatsCompanion({
    this.id = const Value.absent(),
    this.chatId = const Value.absent(),
    this.data = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.lastMessageAt = const Value.absent(),
  });
  CachedChatsCompanion.insert({
    this.id = const Value.absent(),
    required String chatId,
    required String data,
    required DateTime cachedAt,
    this.lastMessageAt = const Value.absent(),
  }) : chatId = Value(chatId),
       data = Value(data),
       cachedAt = Value(cachedAt);
  static Insertable<CachedChat> custom({
    Expression<int>? id,
    Expression<String>? chatId,
    Expression<String>? data,
    Expression<DateTime>? cachedAt,
    Expression<DateTime>? lastMessageAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (chatId != null) 'chat_id': chatId,
      if (data != null) 'data': data,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (lastMessageAt != null) 'last_message_at': lastMessageAt,
    });
  }

  CachedChatsCompanion copyWith({
    Value<int>? id,
    Value<String>? chatId,
    Value<String>? data,
    Value<DateTime>? cachedAt,
    Value<DateTime?>? lastMessageAt,
  }) {
    return CachedChatsCompanion(
      id: id ?? this.id,
      chatId: chatId ?? this.chatId,
      data: data ?? this.data,
      cachedAt: cachedAt ?? this.cachedAt,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (chatId.present) {
      map['chat_id'] = Variable<String>(chatId.value);
    }
    if (data.present) {
      map['data'] = Variable<String>(data.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (lastMessageAt.present) {
      map['last_message_at'] = Variable<DateTime>(lastMessageAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedChatsCompanion(')
          ..write('id: $id, ')
          ..write('chatId: $chatId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('lastMessageAt: $lastMessageAt')
          ..write(')'))
        .toString();
  }
}

class $CachedMessagesTable extends CachedMessages
    with TableInfo<$CachedMessagesTable, CachedMessage> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedMessagesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _messageIdMeta = const VerificationMeta(
    'messageId',
  );
  @override
  late final GeneratedColumn<String> messageId = GeneratedColumn<String>(
    'message_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  static const VerificationMeta _chatIdMeta = const VerificationMeta('chatId');
  @override
  late final GeneratedColumn<String> chatId = GeneratedColumn<String>(
    'chat_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dataMeta = const VerificationMeta('data');
  @override
  late final GeneratedColumn<String> data = GeneratedColumn<String>(
    'data',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _isSyncedMeta = const VerificationMeta(
    'isSynced',
  );
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
    'is_synced',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("is_synced" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    messageId,
    chatId,
    data,
    isSynced,
    cachedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_messages';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedMessage> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('message_id')) {
      context.handle(
        _messageIdMeta,
        messageId.isAcceptableOrUnknown(data['message_id']!, _messageIdMeta),
      );
    } else if (isInserting) {
      context.missing(_messageIdMeta);
    }
    if (data.containsKey('chat_id')) {
      context.handle(
        _chatIdMeta,
        chatId.isAcceptableOrUnknown(data['chat_id']!, _chatIdMeta),
      );
    } else if (isInserting) {
      context.missing(_chatIdMeta);
    }
    if (data.containsKey('data')) {
      context.handle(
        _dataMeta,
        this.data.isAcceptableOrUnknown(data['data']!, _dataMeta),
      );
    } else if (isInserting) {
      context.missing(_dataMeta);
    }
    if (data.containsKey('is_synced')) {
      context.handle(
        _isSyncedMeta,
        isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta),
      );
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedMessage map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedMessage(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      messageId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}message_id'],
      )!,
      chatId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}chat_id'],
      )!,
      data: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data'],
      )!,
      isSynced: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}is_synced'],
      )!,
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
    );
  }

  @override
  $CachedMessagesTable createAlias(String alias) {
    return $CachedMessagesTable(attachedDatabase, alias);
  }
}

class CachedMessage extends DataClass implements Insertable<CachedMessage> {
  final int id;
  final String messageId;
  final String chatId;
  final String data;
  final bool isSynced;
  final DateTime cachedAt;
  const CachedMessage({
    required this.id,
    required this.messageId,
    required this.chatId,
    required this.data,
    required this.isSynced,
    required this.cachedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['message_id'] = Variable<String>(messageId);
    map['chat_id'] = Variable<String>(chatId);
    map['data'] = Variable<String>(data);
    map['is_synced'] = Variable<bool>(isSynced);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    return map;
  }

  CachedMessagesCompanion toCompanion(bool nullToAbsent) {
    return CachedMessagesCompanion(
      id: Value(id),
      messageId: Value(messageId),
      chatId: Value(chatId),
      data: Value(data),
      isSynced: Value(isSynced),
      cachedAt: Value(cachedAt),
    );
  }

  factory CachedMessage.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedMessage(
      id: serializer.fromJson<int>(json['id']),
      messageId: serializer.fromJson<String>(json['messageId']),
      chatId: serializer.fromJson<String>(json['chatId']),
      data: serializer.fromJson<String>(json['data']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'messageId': serializer.toJson<String>(messageId),
      'chatId': serializer.toJson<String>(chatId),
      'data': serializer.toJson<String>(data),
      'isSynced': serializer.toJson<bool>(isSynced),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
    };
  }

  CachedMessage copyWith({
    int? id,
    String? messageId,
    String? chatId,
    String? data,
    bool? isSynced,
    DateTime? cachedAt,
  }) => CachedMessage(
    id: id ?? this.id,
    messageId: messageId ?? this.messageId,
    chatId: chatId ?? this.chatId,
    data: data ?? this.data,
    isSynced: isSynced ?? this.isSynced,
    cachedAt: cachedAt ?? this.cachedAt,
  );
  CachedMessage copyWithCompanion(CachedMessagesCompanion data) {
    return CachedMessage(
      id: data.id.present ? data.id.value : this.id,
      messageId: data.messageId.present ? data.messageId.value : this.messageId,
      chatId: data.chatId.present ? data.chatId.value : this.chatId,
      data: data.data.present ? data.data.value : this.data,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedMessage(')
          ..write('id: $id, ')
          ..write('messageId: $messageId, ')
          ..write('chatId: $chatId, ')
          ..write('data: $data, ')
          ..write('isSynced: $isSynced, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, messageId, chatId, data, isSynced, cachedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedMessage &&
          other.id == this.id &&
          other.messageId == this.messageId &&
          other.chatId == this.chatId &&
          other.data == this.data &&
          other.isSynced == this.isSynced &&
          other.cachedAt == this.cachedAt);
}

class CachedMessagesCompanion extends UpdateCompanion<CachedMessage> {
  final Value<int> id;
  final Value<String> messageId;
  final Value<String> chatId;
  final Value<String> data;
  final Value<bool> isSynced;
  final Value<DateTime> cachedAt;
  const CachedMessagesCompanion({
    this.id = const Value.absent(),
    this.messageId = const Value.absent(),
    this.chatId = const Value.absent(),
    this.data = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.cachedAt = const Value.absent(),
  });
  CachedMessagesCompanion.insert({
    this.id = const Value.absent(),
    required String messageId,
    required String chatId,
    required String data,
    this.isSynced = const Value.absent(),
    required DateTime cachedAt,
  }) : messageId = Value(messageId),
       chatId = Value(chatId),
       data = Value(data),
       cachedAt = Value(cachedAt);
  static Insertable<CachedMessage> custom({
    Expression<int>? id,
    Expression<String>? messageId,
    Expression<String>? chatId,
    Expression<String>? data,
    Expression<bool>? isSynced,
    Expression<DateTime>? cachedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (messageId != null) 'message_id': messageId,
      if (chatId != null) 'chat_id': chatId,
      if (data != null) 'data': data,
      if (isSynced != null) 'is_synced': isSynced,
      if (cachedAt != null) 'cached_at': cachedAt,
    });
  }

  CachedMessagesCompanion copyWith({
    Value<int>? id,
    Value<String>? messageId,
    Value<String>? chatId,
    Value<String>? data,
    Value<bool>? isSynced,
    Value<DateTime>? cachedAt,
  }) {
    return CachedMessagesCompanion(
      id: id ?? this.id,
      messageId: messageId ?? this.messageId,
      chatId: chatId ?? this.chatId,
      data: data ?? this.data,
      isSynced: isSynced ?? this.isSynced,
      cachedAt: cachedAt ?? this.cachedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (messageId.present) {
      map['message_id'] = Variable<String>(messageId.value);
    }
    if (chatId.present) {
      map['chat_id'] = Variable<String>(chatId.value);
    }
    if (data.present) {
      map['data'] = Variable<String>(data.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedMessagesCompanion(')
          ..write('id: $id, ')
          ..write('messageId: $messageId, ')
          ..write('chatId: $chatId, ')
          ..write('data: $data, ')
          ..write('isSynced: $isSynced, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }
}

class $CachedRequestsTable extends CachedRequests
    with TableInfo<$CachedRequestsTable, CachedRequest> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedRequestsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _requestIdMeta = const VerificationMeta(
    'requestId',
  );
  @override
  late final GeneratedColumn<int> requestId = GeneratedColumn<int>(
    'request_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'),
  );
  static const VerificationMeta _dataMeta = const VerificationMeta('data');
  @override
  late final GeneratedColumn<String> data = GeneratedColumn<String>(
    'data',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cachedAtMeta = const VerificationMeta(
    'cachedAt',
  );
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
    'cached_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, requestId, data, cachedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_requests';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedRequest> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('request_id')) {
      context.handle(
        _requestIdMeta,
        requestId.isAcceptableOrUnknown(data['request_id']!, _requestIdMeta),
      );
    } else if (isInserting) {
      context.missing(_requestIdMeta);
    }
    if (data.containsKey('data')) {
      context.handle(
        _dataMeta,
        this.data.isAcceptableOrUnknown(data['data']!, _dataMeta),
      );
    } else if (isInserting) {
      context.missing(_dataMeta);
    }
    if (data.containsKey('cached_at')) {
      context.handle(
        _cachedAtMeta,
        cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_cachedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedRequest map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedRequest(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      requestId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}request_id'],
      )!,
      data: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}data'],
      )!,
      cachedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}cached_at'],
      )!,
    );
  }

  @override
  $CachedRequestsTable createAlias(String alias) {
    return $CachedRequestsTable(attachedDatabase, alias);
  }
}

class CachedRequest extends DataClass implements Insertable<CachedRequest> {
  final int id;
  final int requestId;
  final String data;
  final DateTime cachedAt;
  const CachedRequest({
    required this.id,
    required this.requestId,
    required this.data,
    required this.cachedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['request_id'] = Variable<int>(requestId);
    map['data'] = Variable<String>(data);
    map['cached_at'] = Variable<DateTime>(cachedAt);
    return map;
  }

  CachedRequestsCompanion toCompanion(bool nullToAbsent) {
    return CachedRequestsCompanion(
      id: Value(id),
      requestId: Value(requestId),
      data: Value(data),
      cachedAt: Value(cachedAt),
    );
  }

  factory CachedRequest.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedRequest(
      id: serializer.fromJson<int>(json['id']),
      requestId: serializer.fromJson<int>(json['requestId']),
      data: serializer.fromJson<String>(json['data']),
      cachedAt: serializer.fromJson<DateTime>(json['cachedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'requestId': serializer.toJson<int>(requestId),
      'data': serializer.toJson<String>(data),
      'cachedAt': serializer.toJson<DateTime>(cachedAt),
    };
  }

  CachedRequest copyWith({
    int? id,
    int? requestId,
    String? data,
    DateTime? cachedAt,
  }) => CachedRequest(
    id: id ?? this.id,
    requestId: requestId ?? this.requestId,
    data: data ?? this.data,
    cachedAt: cachedAt ?? this.cachedAt,
  );
  CachedRequest copyWithCompanion(CachedRequestsCompanion data) {
    return CachedRequest(
      id: data.id.present ? data.id.value : this.id,
      requestId: data.requestId.present ? data.requestId.value : this.requestId,
      data: data.data.present ? data.data.value : this.data,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedRequest(')
          ..write('id: $id, ')
          ..write('requestId: $requestId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, requestId, data, cachedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedRequest &&
          other.id == this.id &&
          other.requestId == this.requestId &&
          other.data == this.data &&
          other.cachedAt == this.cachedAt);
}

class CachedRequestsCompanion extends UpdateCompanion<CachedRequest> {
  final Value<int> id;
  final Value<int> requestId;
  final Value<String> data;
  final Value<DateTime> cachedAt;
  const CachedRequestsCompanion({
    this.id = const Value.absent(),
    this.requestId = const Value.absent(),
    this.data = const Value.absent(),
    this.cachedAt = const Value.absent(),
  });
  CachedRequestsCompanion.insert({
    this.id = const Value.absent(),
    required int requestId,
    required String data,
    required DateTime cachedAt,
  }) : requestId = Value(requestId),
       data = Value(data),
       cachedAt = Value(cachedAt);
  static Insertable<CachedRequest> custom({
    Expression<int>? id,
    Expression<int>? requestId,
    Expression<String>? data,
    Expression<DateTime>? cachedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (requestId != null) 'request_id': requestId,
      if (data != null) 'data': data,
      if (cachedAt != null) 'cached_at': cachedAt,
    });
  }

  CachedRequestsCompanion copyWith({
    Value<int>? id,
    Value<int>? requestId,
    Value<String>? data,
    Value<DateTime>? cachedAt,
  }) {
    return CachedRequestsCompanion(
      id: id ?? this.id,
      requestId: requestId ?? this.requestId,
      data: data ?? this.data,
      cachedAt: cachedAt ?? this.cachedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (requestId.present) {
      map['request_id'] = Variable<int>(requestId.value);
    }
    if (data.present) {
      map['data'] = Variable<String>(data.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedRequestsCompanion(')
          ..write('id: $id, ')
          ..write('requestId: $requestId, ')
          ..write('data: $data, ')
          ..write('cachedAt: $cachedAt')
          ..write(')'))
        .toString();
  }
}

class $PendingActionsTable extends PendingActions
    with TableInfo<$PendingActionsTable, PendingAction> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PendingActionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _actionTypeMeta = const VerificationMeta(
    'actionType',
  );
  @override
  late final GeneratedColumn<String> actionType = GeneratedColumn<String>(
    'action_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _targetIdMeta = const VerificationMeta(
    'targetId',
  );
  @override
  late final GeneratedColumn<String> targetId = GeneratedColumn<String>(
    'target_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _payloadMeta = const VerificationMeta(
    'payload',
  );
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
    'payload',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _retryCountMeta = const VerificationMeta(
    'retryCount',
  );
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
    'retry_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    actionType,
    targetId,
    payload,
    createdAt,
    retryCount,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'pending_actions';
  @override
  VerificationContext validateIntegrity(
    Insertable<PendingAction> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('action_type')) {
      context.handle(
        _actionTypeMeta,
        actionType.isAcceptableOrUnknown(data['action_type']!, _actionTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_actionTypeMeta);
    }
    if (data.containsKey('target_id')) {
      context.handle(
        _targetIdMeta,
        targetId.isAcceptableOrUnknown(data['target_id']!, _targetIdMeta),
      );
    } else if (isInserting) {
      context.missing(_targetIdMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(
        _payloadMeta,
        payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta),
      );
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
        _retryCountMeta,
        retryCount.isAcceptableOrUnknown(data['retry_count']!, _retryCountMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  PendingAction map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return PendingAction(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      actionType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}action_type'],
      )!,
      targetId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}target_id'],
      )!,
      payload: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payload'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      retryCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}retry_count'],
      )!,
    );
  }

  @override
  $PendingActionsTable createAlias(String alias) {
    return $PendingActionsTable(attachedDatabase, alias);
  }
}

class PendingAction extends DataClass implements Insertable<PendingAction> {
  final int id;
  final String actionType;
  final String targetId;
  final String payload;
  final DateTime createdAt;
  final int retryCount;
  const PendingAction({
    required this.id,
    required this.actionType,
    required this.targetId,
    required this.payload,
    required this.createdAt,
    required this.retryCount,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['action_type'] = Variable<String>(actionType);
    map['target_id'] = Variable<String>(targetId);
    map['payload'] = Variable<String>(payload);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['retry_count'] = Variable<int>(retryCount);
    return map;
  }

  PendingActionsCompanion toCompanion(bool nullToAbsent) {
    return PendingActionsCompanion(
      id: Value(id),
      actionType: Value(actionType),
      targetId: Value(targetId),
      payload: Value(payload),
      createdAt: Value(createdAt),
      retryCount: Value(retryCount),
    );
  }

  factory PendingAction.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return PendingAction(
      id: serializer.fromJson<int>(json['id']),
      actionType: serializer.fromJson<String>(json['actionType']),
      targetId: serializer.fromJson<String>(json['targetId']),
      payload: serializer.fromJson<String>(json['payload']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'actionType': serializer.toJson<String>(actionType),
      'targetId': serializer.toJson<String>(targetId),
      'payload': serializer.toJson<String>(payload),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'retryCount': serializer.toJson<int>(retryCount),
    };
  }

  PendingAction copyWith({
    int? id,
    String? actionType,
    String? targetId,
    String? payload,
    DateTime? createdAt,
    int? retryCount,
  }) => PendingAction(
    id: id ?? this.id,
    actionType: actionType ?? this.actionType,
    targetId: targetId ?? this.targetId,
    payload: payload ?? this.payload,
    createdAt: createdAt ?? this.createdAt,
    retryCount: retryCount ?? this.retryCount,
  );
  PendingAction copyWithCompanion(PendingActionsCompanion data) {
    return PendingAction(
      id: data.id.present ? data.id.value : this.id,
      actionType: data.actionType.present
          ? data.actionType.value
          : this.actionType,
      targetId: data.targetId.present ? data.targetId.value : this.targetId,
      payload: data.payload.present ? data.payload.value : this.payload,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      retryCount: data.retryCount.present
          ? data.retryCount.value
          : this.retryCount,
    );
  }

  @override
  String toString() {
    return (StringBuffer('PendingAction(')
          ..write('id: $id, ')
          ..write('actionType: $actionType, ')
          ..write('targetId: $targetId, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, actionType, targetId, payload, createdAt, retryCount);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is PendingAction &&
          other.id == this.id &&
          other.actionType == this.actionType &&
          other.targetId == this.targetId &&
          other.payload == this.payload &&
          other.createdAt == this.createdAt &&
          other.retryCount == this.retryCount);
}

class PendingActionsCompanion extends UpdateCompanion<PendingAction> {
  final Value<int> id;
  final Value<String> actionType;
  final Value<String> targetId;
  final Value<String> payload;
  final Value<DateTime> createdAt;
  final Value<int> retryCount;
  const PendingActionsCompanion({
    this.id = const Value.absent(),
    this.actionType = const Value.absent(),
    this.targetId = const Value.absent(),
    this.payload = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.retryCount = const Value.absent(),
  });
  PendingActionsCompanion.insert({
    this.id = const Value.absent(),
    required String actionType,
    required String targetId,
    required String payload,
    required DateTime createdAt,
    this.retryCount = const Value.absent(),
  }) : actionType = Value(actionType),
       targetId = Value(targetId),
       payload = Value(payload),
       createdAt = Value(createdAt);
  static Insertable<PendingAction> custom({
    Expression<int>? id,
    Expression<String>? actionType,
    Expression<String>? targetId,
    Expression<String>? payload,
    Expression<DateTime>? createdAt,
    Expression<int>? retryCount,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (actionType != null) 'action_type': actionType,
      if (targetId != null) 'target_id': targetId,
      if (payload != null) 'payload': payload,
      if (createdAt != null) 'created_at': createdAt,
      if (retryCount != null) 'retry_count': retryCount,
    });
  }

  PendingActionsCompanion copyWith({
    Value<int>? id,
    Value<String>? actionType,
    Value<String>? targetId,
    Value<String>? payload,
    Value<DateTime>? createdAt,
    Value<int>? retryCount,
  }) {
    return PendingActionsCompanion(
      id: id ?? this.id,
      actionType: actionType ?? this.actionType,
      targetId: targetId ?? this.targetId,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (actionType.present) {
      map['action_type'] = Variable<String>(actionType.value);
    }
    if (targetId.present) {
      map['target_id'] = Variable<String>(targetId.value);
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PendingActionsCompanion(')
          ..write('id: $id, ')
          ..write('actionType: $actionType, ')
          ..write('targetId: $targetId, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $CachedVideosTable cachedVideos = $CachedVideosTable(this);
  late final $CachedChatsTable cachedChats = $CachedChatsTable(this);
  late final $CachedMessagesTable cachedMessages = $CachedMessagesTable(this);
  late final $CachedRequestsTable cachedRequests = $CachedRequestsTable(this);
  late final $PendingActionsTable pendingActions = $PendingActionsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    cachedVideos,
    cachedChats,
    cachedMessages,
    cachedRequests,
    pendingActions,
  ];
}

typedef $$CachedVideosTableCreateCompanionBuilder =
    CachedVideosCompanion Function({
      Value<int> id,
      required String videoId,
      required String data,
      required DateTime cachedAt,
      Value<DateTime?> lastViewed,
      Value<int> viewCount,
    });
typedef $$CachedVideosTableUpdateCompanionBuilder =
    CachedVideosCompanion Function({
      Value<int> id,
      Value<String> videoId,
      Value<String> data,
      Value<DateTime> cachedAt,
      Value<DateTime?> lastViewed,
      Value<int> viewCount,
    });

class $$CachedVideosTableFilterComposer
    extends Composer<_$AppDatabase, $CachedVideosTable> {
  $$CachedVideosTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get videoId => $composableBuilder(
    column: $table.videoId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastViewed => $composableBuilder(
    column: $table.lastViewed,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get viewCount => $composableBuilder(
    column: $table.viewCount,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedVideosTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedVideosTable> {
  $$CachedVideosTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get videoId => $composableBuilder(
    column: $table.videoId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastViewed => $composableBuilder(
    column: $table.lastViewed,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get viewCount => $composableBuilder(
    column: $table.viewCount,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedVideosTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedVideosTable> {
  $$CachedVideosTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get videoId =>
      $composableBuilder(column: $table.videoId, builder: (column) => column);

  GeneratedColumn<String> get data =>
      $composableBuilder(column: $table.data, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get lastViewed => $composableBuilder(
    column: $table.lastViewed,
    builder: (column) => column,
  );

  GeneratedColumn<int> get viewCount =>
      $composableBuilder(column: $table.viewCount, builder: (column) => column);
}

class $$CachedVideosTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedVideosTable,
          CachedVideo,
          $$CachedVideosTableFilterComposer,
          $$CachedVideosTableOrderingComposer,
          $$CachedVideosTableAnnotationComposer,
          $$CachedVideosTableCreateCompanionBuilder,
          $$CachedVideosTableUpdateCompanionBuilder,
          (
            CachedVideo,
            BaseReferences<_$AppDatabase, $CachedVideosTable, CachedVideo>,
          ),
          CachedVideo,
          PrefetchHooks Function()
        > {
  $$CachedVideosTableTableManager(_$AppDatabase db, $CachedVideosTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedVideosTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedVideosTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedVideosTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> videoId = const Value.absent(),
                Value<String> data = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
                Value<DateTime?> lastViewed = const Value.absent(),
                Value<int> viewCount = const Value.absent(),
              }) => CachedVideosCompanion(
                id: id,
                videoId: videoId,
                data: data,
                cachedAt: cachedAt,
                lastViewed: lastViewed,
                viewCount: viewCount,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String videoId,
                required String data,
                required DateTime cachedAt,
                Value<DateTime?> lastViewed = const Value.absent(),
                Value<int> viewCount = const Value.absent(),
              }) => CachedVideosCompanion.insert(
                id: id,
                videoId: videoId,
                data: data,
                cachedAt: cachedAt,
                lastViewed: lastViewed,
                viewCount: viewCount,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedVideosTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedVideosTable,
      CachedVideo,
      $$CachedVideosTableFilterComposer,
      $$CachedVideosTableOrderingComposer,
      $$CachedVideosTableAnnotationComposer,
      $$CachedVideosTableCreateCompanionBuilder,
      $$CachedVideosTableUpdateCompanionBuilder,
      (
        CachedVideo,
        BaseReferences<_$AppDatabase, $CachedVideosTable, CachedVideo>,
      ),
      CachedVideo,
      PrefetchHooks Function()
    >;
typedef $$CachedChatsTableCreateCompanionBuilder =
    CachedChatsCompanion Function({
      Value<int> id,
      required String chatId,
      required String data,
      required DateTime cachedAt,
      Value<DateTime?> lastMessageAt,
    });
typedef $$CachedChatsTableUpdateCompanionBuilder =
    CachedChatsCompanion Function({
      Value<int> id,
      Value<String> chatId,
      Value<String> data,
      Value<DateTime> cachedAt,
      Value<DateTime?> lastMessageAt,
    });

class $$CachedChatsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedChatsTable> {
  $$CachedChatsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get chatId => $composableBuilder(
    column: $table.chatId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastMessageAt => $composableBuilder(
    column: $table.lastMessageAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedChatsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedChatsTable> {
  $$CachedChatsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get chatId => $composableBuilder(
    column: $table.chatId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastMessageAt => $composableBuilder(
    column: $table.lastMessageAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedChatsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedChatsTable> {
  $$CachedChatsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get chatId =>
      $composableBuilder(column: $table.chatId, builder: (column) => column);

  GeneratedColumn<String> get data =>
      $composableBuilder(column: $table.data, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get lastMessageAt => $composableBuilder(
    column: $table.lastMessageAt,
    builder: (column) => column,
  );
}

class $$CachedChatsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedChatsTable,
          CachedChat,
          $$CachedChatsTableFilterComposer,
          $$CachedChatsTableOrderingComposer,
          $$CachedChatsTableAnnotationComposer,
          $$CachedChatsTableCreateCompanionBuilder,
          $$CachedChatsTableUpdateCompanionBuilder,
          (
            CachedChat,
            BaseReferences<_$AppDatabase, $CachedChatsTable, CachedChat>,
          ),
          CachedChat,
          PrefetchHooks Function()
        > {
  $$CachedChatsTableTableManager(_$AppDatabase db, $CachedChatsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedChatsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedChatsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedChatsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> chatId = const Value.absent(),
                Value<String> data = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
                Value<DateTime?> lastMessageAt = const Value.absent(),
              }) => CachedChatsCompanion(
                id: id,
                chatId: chatId,
                data: data,
                cachedAt: cachedAt,
                lastMessageAt: lastMessageAt,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String chatId,
                required String data,
                required DateTime cachedAt,
                Value<DateTime?> lastMessageAt = const Value.absent(),
              }) => CachedChatsCompanion.insert(
                id: id,
                chatId: chatId,
                data: data,
                cachedAt: cachedAt,
                lastMessageAt: lastMessageAt,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedChatsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedChatsTable,
      CachedChat,
      $$CachedChatsTableFilterComposer,
      $$CachedChatsTableOrderingComposer,
      $$CachedChatsTableAnnotationComposer,
      $$CachedChatsTableCreateCompanionBuilder,
      $$CachedChatsTableUpdateCompanionBuilder,
      (
        CachedChat,
        BaseReferences<_$AppDatabase, $CachedChatsTable, CachedChat>,
      ),
      CachedChat,
      PrefetchHooks Function()
    >;
typedef $$CachedMessagesTableCreateCompanionBuilder =
    CachedMessagesCompanion Function({
      Value<int> id,
      required String messageId,
      required String chatId,
      required String data,
      Value<bool> isSynced,
      required DateTime cachedAt,
    });
typedef $$CachedMessagesTableUpdateCompanionBuilder =
    CachedMessagesCompanion Function({
      Value<int> id,
      Value<String> messageId,
      Value<String> chatId,
      Value<String> data,
      Value<bool> isSynced,
      Value<DateTime> cachedAt,
    });

class $$CachedMessagesTableFilterComposer
    extends Composer<_$AppDatabase, $CachedMessagesTable> {
  $$CachedMessagesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get messageId => $composableBuilder(
    column: $table.messageId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get chatId => $composableBuilder(
    column: $table.chatId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get isSynced => $composableBuilder(
    column: $table.isSynced,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedMessagesTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedMessagesTable> {
  $$CachedMessagesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get messageId => $composableBuilder(
    column: $table.messageId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get chatId => $composableBuilder(
    column: $table.chatId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get isSynced => $composableBuilder(
    column: $table.isSynced,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedMessagesTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedMessagesTable> {
  $$CachedMessagesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get messageId =>
      $composableBuilder(column: $table.messageId, builder: (column) => column);

  GeneratedColumn<String> get chatId =>
      $composableBuilder(column: $table.chatId, builder: (column) => column);

  GeneratedColumn<String> get data =>
      $composableBuilder(column: $table.data, builder: (column) => column);

  GeneratedColumn<bool> get isSynced =>
      $composableBuilder(column: $table.isSynced, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);
}

class $$CachedMessagesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedMessagesTable,
          CachedMessage,
          $$CachedMessagesTableFilterComposer,
          $$CachedMessagesTableOrderingComposer,
          $$CachedMessagesTableAnnotationComposer,
          $$CachedMessagesTableCreateCompanionBuilder,
          $$CachedMessagesTableUpdateCompanionBuilder,
          (
            CachedMessage,
            BaseReferences<_$AppDatabase, $CachedMessagesTable, CachedMessage>,
          ),
          CachedMessage,
          PrefetchHooks Function()
        > {
  $$CachedMessagesTableTableManager(
    _$AppDatabase db,
    $CachedMessagesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedMessagesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedMessagesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedMessagesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> messageId = const Value.absent(),
                Value<String> chatId = const Value.absent(),
                Value<String> data = const Value.absent(),
                Value<bool> isSynced = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
              }) => CachedMessagesCompanion(
                id: id,
                messageId: messageId,
                chatId: chatId,
                data: data,
                isSynced: isSynced,
                cachedAt: cachedAt,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String messageId,
                required String chatId,
                required String data,
                Value<bool> isSynced = const Value.absent(),
                required DateTime cachedAt,
              }) => CachedMessagesCompanion.insert(
                id: id,
                messageId: messageId,
                chatId: chatId,
                data: data,
                isSynced: isSynced,
                cachedAt: cachedAt,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedMessagesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedMessagesTable,
      CachedMessage,
      $$CachedMessagesTableFilterComposer,
      $$CachedMessagesTableOrderingComposer,
      $$CachedMessagesTableAnnotationComposer,
      $$CachedMessagesTableCreateCompanionBuilder,
      $$CachedMessagesTableUpdateCompanionBuilder,
      (
        CachedMessage,
        BaseReferences<_$AppDatabase, $CachedMessagesTable, CachedMessage>,
      ),
      CachedMessage,
      PrefetchHooks Function()
    >;
typedef $$CachedRequestsTableCreateCompanionBuilder =
    CachedRequestsCompanion Function({
      Value<int> id,
      required int requestId,
      required String data,
      required DateTime cachedAt,
    });
typedef $$CachedRequestsTableUpdateCompanionBuilder =
    CachedRequestsCompanion Function({
      Value<int> id,
      Value<int> requestId,
      Value<String> data,
      Value<DateTime> cachedAt,
    });

class $$CachedRequestsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedRequestsTable> {
  $$CachedRequestsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get requestId => $composableBuilder(
    column: $table.requestId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedRequestsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedRequestsTable> {
  $$CachedRequestsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get requestId => $composableBuilder(
    column: $table.requestId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get data => $composableBuilder(
    column: $table.data,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
    column: $table.cachedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedRequestsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedRequestsTable> {
  $$CachedRequestsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get requestId =>
      $composableBuilder(column: $table.requestId, builder: (column) => column);

  GeneratedColumn<String> get data =>
      $composableBuilder(column: $table.data, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);
}

class $$CachedRequestsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedRequestsTable,
          CachedRequest,
          $$CachedRequestsTableFilterComposer,
          $$CachedRequestsTableOrderingComposer,
          $$CachedRequestsTableAnnotationComposer,
          $$CachedRequestsTableCreateCompanionBuilder,
          $$CachedRequestsTableUpdateCompanionBuilder,
          (
            CachedRequest,
            BaseReferences<_$AppDatabase, $CachedRequestsTable, CachedRequest>,
          ),
          CachedRequest,
          PrefetchHooks Function()
        > {
  $$CachedRequestsTableTableManager(
    _$AppDatabase db,
    $CachedRequestsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedRequestsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedRequestsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedRequestsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> requestId = const Value.absent(),
                Value<String> data = const Value.absent(),
                Value<DateTime> cachedAt = const Value.absent(),
              }) => CachedRequestsCompanion(
                id: id,
                requestId: requestId,
                data: data,
                cachedAt: cachedAt,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int requestId,
                required String data,
                required DateTime cachedAt,
              }) => CachedRequestsCompanion.insert(
                id: id,
                requestId: requestId,
                data: data,
                cachedAt: cachedAt,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedRequestsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedRequestsTable,
      CachedRequest,
      $$CachedRequestsTableFilterComposer,
      $$CachedRequestsTableOrderingComposer,
      $$CachedRequestsTableAnnotationComposer,
      $$CachedRequestsTableCreateCompanionBuilder,
      $$CachedRequestsTableUpdateCompanionBuilder,
      (
        CachedRequest,
        BaseReferences<_$AppDatabase, $CachedRequestsTable, CachedRequest>,
      ),
      CachedRequest,
      PrefetchHooks Function()
    >;
typedef $$PendingActionsTableCreateCompanionBuilder =
    PendingActionsCompanion Function({
      Value<int> id,
      required String actionType,
      required String targetId,
      required String payload,
      required DateTime createdAt,
      Value<int> retryCount,
    });
typedef $$PendingActionsTableUpdateCompanionBuilder =
    PendingActionsCompanion Function({
      Value<int> id,
      Value<String> actionType,
      Value<String> targetId,
      Value<String> payload,
      Value<DateTime> createdAt,
      Value<int> retryCount,
    });

class $$PendingActionsTableFilterComposer
    extends Composer<_$AppDatabase, $PendingActionsTable> {
  $$PendingActionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get actionType => $composableBuilder(
    column: $table.actionType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get targetId => $composableBuilder(
    column: $table.targetId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnFilters(column),
  );
}

class $$PendingActionsTableOrderingComposer
    extends Composer<_$AppDatabase, $PendingActionsTable> {
  $$PendingActionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get actionType => $composableBuilder(
    column: $table.actionType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get targetId => $composableBuilder(
    column: $table.targetId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$PendingActionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $PendingActionsTable> {
  $$PendingActionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get actionType => $composableBuilder(
    column: $table.actionType,
    builder: (column) => column,
  );

  GeneratedColumn<String> get targetId =>
      $composableBuilder(column: $table.targetId, builder: (column) => column);

  GeneratedColumn<String> get payload =>
      $composableBuilder(column: $table.payload, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => column,
  );
}

class $$PendingActionsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $PendingActionsTable,
          PendingAction,
          $$PendingActionsTableFilterComposer,
          $$PendingActionsTableOrderingComposer,
          $$PendingActionsTableAnnotationComposer,
          $$PendingActionsTableCreateCompanionBuilder,
          $$PendingActionsTableUpdateCompanionBuilder,
          (
            PendingAction,
            BaseReferences<_$AppDatabase, $PendingActionsTable, PendingAction>,
          ),
          PendingAction,
          PrefetchHooks Function()
        > {
  $$PendingActionsTableTableManager(
    _$AppDatabase db,
    $PendingActionsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PendingActionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PendingActionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PendingActionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> actionType = const Value.absent(),
                Value<String> targetId = const Value.absent(),
                Value<String> payload = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<int> retryCount = const Value.absent(),
              }) => PendingActionsCompanion(
                id: id,
                actionType: actionType,
                targetId: targetId,
                payload: payload,
                createdAt: createdAt,
                retryCount: retryCount,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String actionType,
                required String targetId,
                required String payload,
                required DateTime createdAt,
                Value<int> retryCount = const Value.absent(),
              }) => PendingActionsCompanion.insert(
                id: id,
                actionType: actionType,
                targetId: targetId,
                payload: payload,
                createdAt: createdAt,
                retryCount: retryCount,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$PendingActionsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $PendingActionsTable,
      PendingAction,
      $$PendingActionsTableFilterComposer,
      $$PendingActionsTableOrderingComposer,
      $$PendingActionsTableAnnotationComposer,
      $$PendingActionsTableCreateCompanionBuilder,
      $$PendingActionsTableUpdateCompanionBuilder,
      (
        PendingAction,
        BaseReferences<_$AppDatabase, $PendingActionsTable, PendingAction>,
      ),
      PendingAction,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$CachedVideosTableTableManager get cachedVideos =>
      $$CachedVideosTableTableManager(_db, _db.cachedVideos);
  $$CachedChatsTableTableManager get cachedChats =>
      $$CachedChatsTableTableManager(_db, _db.cachedChats);
  $$CachedMessagesTableTableManager get cachedMessages =>
      $$CachedMessagesTableTableManager(_db, _db.cachedMessages);
  $$CachedRequestsTableTableManager get cachedRequests =>
      $$CachedRequestsTableTableManager(_db, _db.cachedRequests);
  $$PendingActionsTableTableManager get pendingActions =>
      $$PendingActionsTableTableManager(_db, _db.pendingActions);
}
