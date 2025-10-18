'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  RefreshCw,
  Settings,
  Columns,
  Grid,
  List
} from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface TableAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: any) => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: (row: any) => boolean;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

export interface GlassDataTableProps {
  columns: TableColumn[];
  data: TableRow[];
  loading?: boolean;
  error?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  showFooter?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  showBulkActions?: boolean;
  showColumnSelector?: boolean;
  showViewToggle?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  searchQuery?: string;
  selectedRows?: string[];
  className?: string;
  onSort?: (column: string, direction: SortDirection) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onRowClick?: (row: TableRow) => void;
  onRowDoubleClick?: (row: TableRow) => void;
  onAction?: (actionId: string, row: TableRow) => void;
  onBulkAction?: (actionId: string, selectedRows: string[]) => void;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  actions?: TableAction[];
  bulkActions?: TableAction[];
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-2',
    cellPadding: 'px-2 py-1',
    headerPadding: 'px-2 py-2',
    fontSize: 'text-xs',
    headerFontSize: 'text-xs',
    spacing: 'space-y-1'
  },
  md: {
    padding: 'p-4',
    cellPadding: 'px-3 py-2',
    headerPadding: 'px-3 py-3',
    fontSize: 'text-sm',
    headerFontSize: 'text-sm',
    spacing: 'space-y-2'
  },
  lg: {
    padding: 'p-6',
    cellPadding: 'px-4 py-3',
    headerPadding: 'px-4 py-4',
    fontSize: 'text-base',
    headerFontSize: 'text-base',
    spacing: 'space-y-3'
  }
};

// Animation variants
const rowVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const sortVariants = {
  asc: { rotate: 0 },
  desc: { rotate: 180 },
  none: { rotate: 0 }
};

export const GlassDataTable: React.FC<GlassDataTableProps> = ({
  columns,
  data,
  loading = false,
  error,
  variant = 'default',
  size = 'md',
  showHeader = true,
  showFooter = true,
  showPagination = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  showBulkActions = true,
  showColumnSelector = true,
  showViewToggle = true,
  showRefresh = true,
  showExport = true,
  pageSize = 10,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  sortBy,
  sortDirection,
  searchQuery = '',
  selectedRows = [],
  className,
  onSort,
  onSearch,
  onFilter,
  onPageChange,
  onPageSizeChange,
  onRowSelect,
  onSelectAll,
  onRowClick,
  onRowDoubleClick,
  onAction,
  onBulkAction,
  onRefresh,
  onExport,
  actions = [],
  bulkActions = [],
  emptyMessage = 'Нет данных для отображения',
  loadingMessage = 'Загрузка...',
  errorMessage = 'Произошла ошибка при загрузке данных'
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortDirection, setLocalSortDirection] = useState<SortDirection>(sortDirection || 'asc');
  const [localSelectedRows, setLocalSelectedRows] = useState<string[]>(selectedRows);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const config = sizeConfig[size];

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Search filter
    if (localSearchQuery) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          if (!column.searchable) return false;
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(localSearchQuery.toLowerCase());
        })
      );
    }

    // Sort
    if (localSortBy && localSortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[localSortBy];
        const bValue = b[localSortBy];
        
        if (aValue < bValue) return localSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return localSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, localSearchQuery, localSortBy, localSortDirection, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = useCallback((column: string) => {
    const columnConfig = columns.find(col => col.key === column);
    if (!columnConfig?.sortable) return;

    let newDirection: SortDirection = 'asc';
    if (localSortBy === column) {
      if (localSortDirection === 'asc') {
        newDirection = 'desc';
      } else if (localSortDirection === 'desc') {
        newDirection = null;
      }
    }

    setLocalSortBy(newDirection ? column : undefined);
    setLocalSortDirection(newDirection);
    onSort?.(column, newDirection);
  }, [columns, localSortBy, localSortDirection, onSort]);

  const handleSearch = useCallback((query: string) => {
    setLocalSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  const handleRowSelect = useCallback((rowId: string, selected: boolean) => {
    const newSelected = selected
      ? [...localSelectedRows, rowId]
      : localSelectedRows.filter(id => id !== rowId);
    
    setLocalSelectedRows(newSelected);
    onRowSelect?.(rowId, selected);
  }, [localSelectedRows, onRowSelect]);

  const handleSelectAll = useCallback((selected: boolean) => {
    const newSelected = selected ? paginatedData.map(row => row.id) : [];
    setLocalSelectedRows(newSelected);
    onSelectAll?.(selected);
  }, [paginatedData, onSelectAll]);

  const handleAction = useCallback((actionId: string, row: TableRow) => {
    onAction?.(actionId, row);
  }, [onAction]);

  const handleBulkAction = useCallback((actionId: string) => {
    onBulkAction?.(actionId, localSelectedRows);
    setShowBulkMenu(false);
  }, [onBulkAction, localSelectedRows]);

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="space-y-4">
        {/* Search and filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={localSearchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                />
              </div>
            )}

            {showFilters && (
              <button className="flex items-center space-x-2 px-3 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg transition-colors duration-200">
                <Filter className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/80">Фильтры</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            )}

            {showExport && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/80">Экспорт</span>
                </button>

                <AnimatePresence>
                  {showBulkMenu && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-32 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg overflow-hidden z-10"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    >
                      <button
                        onClick={() => onExport?.('csv')}
                        className="w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => onExport?.('excel')}
                        className="w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                      >
                        Excel
                      </button>
                      <button
                        onClick={() => onExport?.('pdf')}
                        className="w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                      >
                        PDF
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {showViewToggle && (
              <div className="flex items-center bg-glass-secondary/30 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'p-1.5 rounded transition-colors duration-200',
                    viewMode === 'table' ? 'bg-glass-accent/30 text-orange-300' : 'text-white/60 hover:text-white'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded transition-colors duration-200',
                    viewMode === 'grid' ? 'bg-glass-accent/30 text-orange-300' : 'text-white/60 hover:text-white'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            )}

            {showColumnSelector && (
              <button className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200">
                <Columns className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk actions */}
        {showBulkActions && localSelectedRows.length > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-glass-accent/20 border border-glass-accent/30 rounded-lg">
            <span className="text-sm text-white/80">
              Выбрано: {localSelectedRows.length}
            </span>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleBulkAction(action.id)}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors duration-200',
                    action.variant === 'danger'
                      ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      : action.variant === 'primary'
                      ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                      : 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50'
                  )}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="border-b border-glass-border/30">
          {showBulkActions && (
            <th className={cn('text-left', config.headerPadding)}>
              <input
                type="checkbox"
                checked={localSelectedRows.length === paginatedData.length && paginatedData.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-orange-500 bg-glass-secondary/30 border-glass-border/50 rounded focus:ring-orange-400/50"
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                'text-left font-medium text-white/80',
                config.headerPadding,
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:text-white transition-colors duration-200'
              )}
              style={{ width: column.width }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center space-x-2">
                {column.headerRender ? (
                  column.headerRender()
                ) : (
                  <span className={config.headerFontSize}>{column.title}</span>
                )}
                {column.sortable && (
                  <motion.div
                    variants={sortVariants}
                    animate={localSortBy === column.key ? (localSortDirection === 'asc' ? 'asc' : 'desc') : undefined}
                    transition={{ duration: 0.2 }}
                  >
                    {localSortBy === column.key ? (
                      localSortDirection === 'asc' ? (
                        <SortAsc className="w-4 h-4 text-orange-400" />
                      ) : (
                        <SortDesc className="w-4 h-4 text-orange-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-white/40" />
                    )}
                  </motion.div>
                )}
              </div>
            </th>
          ))}
          {showActions && actions.length > 0 && (
            <th className={cn('text-right', config.headerPadding)}>
              <span className={config.headerFontSize}>Действия</span>
            </th>
          )}
        </tr>
      </thead>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (showBulkActions ? 1 : 0) + (showActions ? 1 : 0)} className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
                <span className="text-white/60">{loadingMessage}</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (showBulkActions ? 1 : 0) + (showActions ? 1 : 0)} className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{errorMessage}</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (showBulkActions ? 1 : 0) + (showActions ? 1 : 0)} className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <Info className="w-5 h-5 text-white/60" />
                <span className="text-white/60">{emptyMessage}</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        <AnimatePresence>
          {paginatedData.map((row, index) => (
            <motion.tr
              key={row.id}
              className={cn(
                'border-b border-glass-border/20 hover:bg-glass-secondary/20 transition-colors duration-200',
                onRowClick && 'cursor-pointer'
              )}
              variants={rowVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover="hover"
              onClick={() => onRowClick?.(row)}
              onDoubleClick={() => onRowDoubleClick?.(row)}
            >
              {showBulkActions && (
                <td className={config.cellPadding}>
                  <input
                    type="checkbox"
                    checked={localSelectedRows.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRowSelect(row.id, e.target.checked);
                    }}
                    className="w-4 h-4 text-orange-500 bg-glass-secondary/30 border-glass-border/50 rounded focus:ring-orange-400/50"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'text-white/80',
                    config.cellPadding,
                    config.fontSize,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.render ? (
                    column.render(row[column.key], row, index)
                  ) : (
                    <span>{row[column.key]}</span>
                  )}
                </td>
              ))}
              {showActions && actions.length > 0 && (
                <td className={cn('text-right', config.cellPadding)}>
                  <div className="flex items-center justify-end space-x-1">
                    {actions.slice(0, 2).map((action) => (
                      <button
                        key={action.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(action.id, row);
                        }}
                        disabled={action.disabled?.(row)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors duration-200',
                          action.variant === 'danger'
                            ? 'text-red-400 hover:bg-red-500/20'
                            : action.variant === 'primary'
                            ? 'text-orange-400 hover:bg-orange-500/20'
                            : 'text-white/60 hover:bg-glass-secondary/30 hover:text-white'
                        )}
                      >
                        {action.icon ? (
                          <action.icon className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{action.label}</span>
                        )}
                      </button>
                    ))}
                    {actions.length > 2 && (
                      <div className="relative">
                        <button className="p-1.5 text-white/60 hover:bg-glass-secondary/30 hover:text-white rounded-lg transition-colors duration-200">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    );
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/60">
            Показано {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} из {totalItems}
          </span>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/60">Строк на странице:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="px-2 py-1 bg-glass-secondary/30 border border-glass-border/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={cn(
                    'px-3 py-1 text-sm rounded transition-colors duration-200',
                    currentPage === page
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'text-white/60 hover:text-white hover:bg-glass-secondary/30'
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'text-xs';
      case 'minimal':
        return 'border-0';
      case 'detailed':
        return 'text-base';
      default:
        return '';
    }
  };

  return (
    <div className={cn(
      'bg-glass-primary/80 backdrop-blur-xl',
      'border border-glass-border/50',
      'rounded-2xl shadow-glass-lg',
      'overflow-hidden',
      getVariantStyles(),
      className
    )}>
      <div className={config.padding}>
        {/* Header */}
        {renderHeader()}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {renderTableHeader()}
            {renderTableBody()}
          </table>
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="mt-4 pt-4 border-t border-glass-border/30">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience components
export const GlassDataTableCompact: React.FC<Omit<GlassDataTableProps, 'variant' | 'size'>> = (props) => (
  <GlassDataTable {...props} variant="compact" size="sm" />
);

export const GlassDataTableDetailed: React.FC<Omit<GlassDataTableProps, 'variant' | 'size'>> = (props) => (
  <GlassDataTable {...props} variant="detailed" size="lg" />
);

export const GlassDataTableMinimal: React.FC<Omit<GlassDataTableProps, 'variant'>> = (props) => (
  <GlassDataTable {...props} variant="minimal" showHeader={false} showFooter={false} showPagination={false} />
);

// Example usage component
export const GlassDataTableExample: React.FC = () => {
  const sampleColumns: TableColumn[] = [
    {
      key: 'id',
      title: 'ID',
      sortable: true,
      width: '80px'
    },
    {
      key: 'name',
      title: 'Имя',
      sortable: true,
      searchable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      searchable: true
    },
    {
      key: 'role',
      title: 'Роль',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          value === 'admin' 
            ? 'bg-red-500/20 text-red-300' 
            : value === 'user'
            ? 'bg-blue-500/20 text-blue-300'
            : 'bg-gray-500/20 text-gray-300'
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Статус',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            value === 'active' ? 'bg-green-500' : 'bg-gray-500'
          )} />
          <span className="capitalize">{value}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Дата создания',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('ru-RU')
    }
  ];

  const sampleData: TableRow[] = [
    {
      id: '1',
      name: 'Алексей Иванов',
      email: 'alex@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Мария Петрова',
      email: 'maria@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      name: 'Дмитрий Сидоров',
      email: 'dmitry@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-01-13'
    },
    {
      id: '4',
      name: 'Анна Козлова',
      email: 'anna@example.com',
      role: 'moderator',
      status: 'active',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      name: 'Петр Волков',
      email: 'petr@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-11'
    }
  ];

  const sampleActions: TableAction[] = [
    {
      id: 'view',
      label: 'Просмотр',
      icon: Eye,
      onClick: (row) => console.log('View:', row.name)
    },
    {
      id: 'edit',
      label: 'Редактировать',
      icon: Edit,
      onClick: (row) => console.log('Edit:', row.name)
    },
    {
      id: 'delete',
      label: 'Удалить',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => console.log('Delete:', row.name)
    }
  ];

  const sampleBulkActions: TableAction[] = [
    {
      id: 'export',
      label: 'Экспорт',
      onClick: () => console.log('Export selected')
    },
    {
      id: 'delete',
      label: 'Удалить',
      variant: 'danger',
      onClick: () => console.log('Delete selected')
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычная таблица</h3>
        <GlassDataTable
          columns={sampleColumns}
          data={sampleData}
          showHeader
          showFooter
          showPagination
          showSearch
          showFilters
          showActions
          showBulkActions
          showColumnSelector
          showViewToggle
          showRefresh
          showExport
          pageSize={10}
          currentPage={1}
          totalPages={1}
          totalItems={sampleData.length}
          actions={sampleActions}
          bulkActions={sampleBulkActions}
          onSort={(column, direction) => console.log('Sort:', column, direction)}
          onSearch={(query) => console.log('Search:', query)}
          onPageChange={(page) => console.log('Page:', page)}
          onRowSelect={(rowId, selected) => console.log('Row select:', rowId, selected)}
          onRowClick={(row) => console.log('Row click:', row.name)}
          onAction={(actionId, row) => console.log('Action:', actionId, row.name)}
          onBulkAction={(actionId, selectedRows) => console.log('Bulk action:', actionId, selectedRows)}
          onRefresh={() => console.log('Refresh')}
          onExport={(format) => console.log('Export:', format)}
        />
      </div>

      {/* Compact table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактная таблица</h3>
        <GlassDataTableCompact
          columns={sampleColumns}
          data={sampleData}
          showActions
          actions={sampleActions}
          onAction={(actionId, row) => console.log('Compact action:', actionId, row.name)}
        />
      </div>

      {/* Minimal table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальная таблица</h3>
        <GlassDataTableMinimal
          columns={sampleColumns.slice(0, 4)}
          data={sampleData}
          onRowClick={(row) => console.log('Minimal row click:', row.name)}
        />
      </div>
    </div>
  );
};

