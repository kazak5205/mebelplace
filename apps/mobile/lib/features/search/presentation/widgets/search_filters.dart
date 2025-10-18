import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/widgets/primary_button.dart';

class SearchFilters extends StatefulWidget {
  final String? selectedFilter;
  final String? selectedRegion;
  final String? selectedSortBy;
  final Function(String?, String?, String?) onApply;

  const SearchFilters({
    super.key,
    this.selectedFilter,
    this.selectedRegion,
    this.selectedSortBy,
    required this.onApply,
  });

  @override
  State<SearchFilters> createState() => _SearchFiltersState();
}

class _SearchFiltersState extends State<SearchFilters> {
  String? _filter;
  String? _region;
  String? _sortBy;

  @override
  void initState() {
    super.initState();
    _filter = widget.selectedFilter;
    _region = widget.selectedRegion;
    _sortBy = widget.selectedSortBy;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'search.filters'.tr(),
            style: AppTextStyles.h5,
          ),
          const SizedBox(height: 24),
          
          // Тип контента
          Text('Тип контента', style: AppTextStyles.subtitle1),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _buildFilterChip('Все', null),
              _buildFilterChip('Видео', 'video'),
              _buildFilterChip('Пользователи', 'user'),
              _buildFilterChip('Хэштеги', 'hashtag'),
              _buildFilterChip('Каналы', 'channel'),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Сортировка
          Text('search.sortBy'.tr(), style: AppTextStyles.subtitle1),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _buildSortChip('По релевантности', null),
              _buildSortChip('search.popularity'.tr(), 'popularity'),
              _buildSortChip('search.date'.tr(), 'date'),
            ],
          ),
          
          const SizedBox(height: 32),
          
          // Buttons
          Row(
            children: [
              Expanded(
                child: SecondaryButton(
                  text: 'common.reset'.tr(),
                  onPressed: () {
                    setState(() {
                      _filter = null;
                      _region = null;
                      _sortBy = null;
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: PrimaryButton(
                  text: 'Применить',
                  onPressed: () {
                    widget.onApply(_filter, _region, _sortBy);
                    Navigator.pop(context);
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String? value) {
    final isSelected = _filter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _filter = selected ? value : null;
        });
      },
    );
  }

  Widget _buildSortChip(String label, String? value) {
    final isSelected = _sortBy == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _sortBy = selected ? value : null;
        });
      },
    );
  }
}

