import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../models/search_result_model.dart';
import '../../../../core/constants/api_endpoints.dart';

/// Remote data source для поиска
abstract class SearchRemoteDataSource {
  /// Поиск (универсальный)
  Future<List<SearchResultModel>> search({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
    int limit = 20,
    int offset = 0,
  });
  
  /// Получить подсказки для автодополнения
  Future<List<String>> getSuggestions(String query);
}

class SearchRemoteDataSourceImpl implements SearchRemoteDataSource {
  final DioClient dioClient;

  SearchRemoteDataSourceImpl(this.dioClient);

  @override
  Future<List<SearchResultModel>> search({
    required String query,
    String? filter,
    String? region,
    String? sortBy,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await dioClient.get(
        ApiEndpoints.search,
        queryParameters: {
          'query': query,
          if (filter != null) 'filter': filter,
          if (region != null) 'region': region,
          if (sortBy != null) 'sort_by': sortBy,
          'limit': limit,
          'offset': offset,
        },
      );

      if (response.data == null) {
        return [];
      }

      final data = response.data;
      
      if (data is Map && data.containsKey('results')) {
        return (data['results'] as List)
            .map((json) => SearchResultModel.fromJson(json as Map<String, dynamic>))
            .toList();
      } else if (data is List) {
        return data
            .map((json) => SearchResultModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } on DioException catch (e) {
      throw Exception('Failed to search: ${e.message}');
    }
  }

  @override
  Future<List<String>> getSuggestions(String query) async {
    try {
      final response = await dioClient.get(
        ApiEndpoints.searchSuggestions,
        queryParameters: {'query': query},
      );

      if (response.data == null) {
        return [];
      }

      if (response.data is Map && response.data.containsKey('suggestions')) {
        return List<String>.from(response.data['suggestions']);
      } else if (response.data is List) {
        return List<String>.from(response.data);
      }

      return [];
    } catch (e) {
      return [];
    }
  }
}

