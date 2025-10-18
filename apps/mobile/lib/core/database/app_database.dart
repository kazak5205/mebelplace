import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';

part 'app_database.g.dart';

// Tables
class CachedVideos extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get videoId => text()();
  TextColumn get data => text()(); // JSON serialized video data
  DateTimeColumn get cachedAt => dateTime()();
  DateTimeColumn get lastViewed => dateTime().nullable()();
  IntColumn get viewCount => integer().withDefault(const Constant(0))();
}

class CachedChats extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get chatId => text().unique()();
  TextColumn get data => text()(); // JSON serialized chat data
  DateTimeColumn get cachedAt => dateTime()();
  DateTimeColumn get lastMessageAt => dateTime().nullable()();
}

class CachedMessages extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get messageId => text().unique()();
  TextColumn get chatId => text()();
  TextColumn get data => text()(); // JSON serialized message data
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  DateTimeColumn get cachedAt => dateTime()();
}

class CachedRequests extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get requestId => integer().unique()();
  TextColumn get data => text()();
  DateTimeColumn get cachedAt => dateTime()();
}

class PendingActions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get actionType => text()(); // 'like', 'comment', 'message', etc.
  TextColumn get targetId => text()();
  TextColumn get payload => text()(); // JSON data
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
}

@DriftDatabase(tables: [
  CachedVideos,
  CachedChats,
  CachedMessages,
  CachedRequests,
  PendingActions,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Videos
  Future<List<CachedVideo>> getCachedVideos({int limit = 20}) {
    return (select(cachedVideos)
          ..orderBy([
            (t) => OrderingTerm(expression: t.lastViewed, mode: OrderingMode.desc),
            (t) => OrderingTerm(expression: t.cachedAt, mode: OrderingMode.desc),
          ])
          ..limit(limit))
        .get();
  }

  Future<CachedVideo?> getCachedVideo(String videoId) {
    return (select(cachedVideos)..where((t) => t.videoId.equals(videoId))).getSingleOrNull();
  }

  Future<void> cacheVideo(String videoId, String data) {
    return into(cachedVideos).insert(
      CachedVideosCompanion.insert(
        videoId: videoId,
        data: data,
        cachedAt: DateTime.now(),
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  Future<void> updateVideoViewCount(String videoId) async {
    final video = await getCachedVideo(videoId);
    if (video != null) {
      await (update(cachedVideos)..where((t) => t.videoId.equals(videoId))).write(
        CachedVideosCompanion(
          lastViewed: Value(DateTime.now()),
          viewCount: Value(video.viewCount + 1),
        ),
      );
    }
  }

  Future<void> clearOldVideos({int keepDays = 7}) async {
    final cutoffDate = DateTime.now().subtract(Duration(days: keepDays));
    await (delete(cachedVideos)..where((t) => t.cachedAt.isSmallerThanValue(cutoffDate))).go();
  }

  // Chats
  Future<List<CachedChat>> getCachedChats() {
    return (select(cachedChats)
          ..orderBy([(t) => OrderingTerm(expression: t.lastMessageAt, mode: OrderingMode.desc)]))
        .get();
  }

  Future<CachedChat?> getCachedChat(String chatId) {
    return (select(cachedChats)..where((t) => t.chatId.equals(chatId))).getSingleOrNull();
  }

  Future<void> cacheChat(String chatId, String data) {
    return into(cachedChats).insert(
      CachedChatsCompanion.insert(
        chatId: chatId,
        data: data,
        cachedAt: DateTime.now(),
        lastMessageAt: Value(DateTime.now()),
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  // Messages
  Future<List<CachedMessage>> getCachedMessages(String chatId) {
    return (select(cachedMessages)
          ..where((t) => t.chatId.equals(chatId))
          ..orderBy([(t) => OrderingTerm(expression: t.cachedAt, mode: OrderingMode.asc)]))
        .get();
  }

  Future<void> cacheMessage(String messageId, String chatId, String data, {bool isSynced = true}) {
    return into(cachedMessages).insert(
      CachedMessagesCompanion.insert(
        messageId: messageId,
        chatId: chatId,
        data: data,
        isSynced: Value(isSynced),
        cachedAt: DateTime.now(),
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  Future<List<CachedMessage>> getUnsyncedMessages() {
    return (select(cachedMessages)..where((t) => t.isSynced.equals(false))).get();
  }

  Future<void> markMessageAsSynced(String messageId) {
    return (update(cachedMessages)..where((t) => t.messageId.equals(messageId)))
        .write(const CachedMessagesCompanion(isSynced: Value(true)));
  }

  // Requests
  Future<List<CachedRequest>> getCachedRequests() {
    return (select(cachedRequests)
          ..orderBy([(t) => OrderingTerm(expression: t.cachedAt, mode: OrderingMode.desc)]))
        .get();
  }

  Future<void> cacheRequest(int requestId, String data) {
    return into(cachedRequests).insert(
      CachedRequestsCompanion.insert(
        requestId: requestId,
        data: data,
        cachedAt: DateTime.now(),
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  // Pending Actions
  Future<void> addPendingAction(String actionType, String targetId, String payload) {
    return into(pendingActions).insert(
      PendingActionsCompanion.insert(
        actionType: actionType,
        targetId: targetId,
        payload: payload,
        createdAt: DateTime.now(),
      ),
    );
  }

  Future<List<PendingAction>> getPendingActions() {
    return (select(pendingActions)
          ..orderBy([(t) => OrderingTerm(expression: t.createdAt, mode: OrderingMode.asc)]))
        .get();
  }

  Future<void> deletePendingAction(int id) {
    return (delete(pendingActions)..where((t) => t.id.equals(id))).go();
  }

  Future<void> incrementRetryCount(int id) async {
    final action = await (select(pendingActions)..where((t) => t.id.equals(id))).getSingle();
    await (update(pendingActions)..where((t) => t.id.equals(id)))
        .write(PendingActionsCompanion(retryCount: Value(action.retryCount + 1)));
  }

  // Cleanup
  Future<void> clearAllCache() async {
    await delete(cachedVideos).go();
    await delete(cachedChats).go();
    await delete(cachedMessages).go();
    await delete(cachedRequests).go();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'mebelplace.db'));
    return NativeDatabase(file);
  });
}

// Global database instance
final database = AppDatabase();


