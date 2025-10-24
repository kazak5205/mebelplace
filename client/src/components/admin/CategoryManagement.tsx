import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

interface CategoryManagementProps {}

const CategoryManagement: React.FC<CategoryManagementProps> = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    sort_order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<any>('/admin/categories');
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/admin/categories', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
        sort_order: 0
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Ошибка создания категории');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      await apiService.put(`/admin/categories/${editingCategory.id}`, formData);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
        sort_order: 0
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Ошибка обновления категории');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      await apiService.delete(`/admin/categories/${categoryId}`);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Ошибка удаления категории');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      sort_order: category.sort_order
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Управление категориями</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Создать категорию
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-600 rounded"></div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Категории не найдены</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">{category.description}</p>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Slug:</span>
                  <span className="font-mono">{category.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span>Порядок:</span>
                  <span>{category.sort_order}</span>
                </div>
                <div className="flex justify-between">
                  <span>Видео:</span>
                  <span>{category.video_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Статус:</span>
                  <span className={category.is_active ? 'text-green-400' : 'text-red-400'}>
                    {category.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Создана:</span>
                  <span>{formatDate(category.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Создать категорию</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Цвет</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-8 border border-gray-600 rounded bg-gray-700"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Создать
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Редактировать категорию</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Цвет</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-8 border border-gray-600 rounded bg-gray-700"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active}
                      onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                      className="rounded border-gray-600 text-orange-500 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-300">Активна</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
