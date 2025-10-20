import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Chip,
  Avatar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

type SearchTab = 'videos' | 'hashtags' | 'channels';

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likes: number;
  views: number;
  comments: number;
  createdAt: string;
  category?: string;
  tags?: string[];
}

interface HashtagItem {
  id: string;
  tag: string;
  videoCount: number;
  views: number;
}

interface ChannelItem {
  id: string;
  username: string;
  avatar?: string;
  followers: number;
  videoCount: number;
  bio?: string;
}

const SearchScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('videos');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [hashtags, setHashtags] = useState<HashtagItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'Все' },
    { key: 'furniture', label: 'Мебель' },
    { key: 'decor', label: 'Декор' },
    { key: 'kitchen', label: 'Кухня' },
    { key: 'bedroom', label: 'Спальня' },
    { key: 'living', label: 'Гостиная' },
  ];

  const searchTabs: { key: SearchTab; label: string; icon: string }[] = [
    { key: 'videos', label: 'Видео', icon: 'play-outline' },
    { key: 'hashtags', label: 'Хештеги', icon: 'pricetag-outline' },
    { key: 'channels', label: 'Каналы', icon: 'person-outline' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      
      if (activeTab === 'videos') {
        const response = await apiService.getVideos(1, 20);
        if (response.success) {
          setVideos(response.data);
        }
      } else if (activeTab === 'hashtags') {
        // Поиск по хештегам
        const response = await apiService.get('/search/hashtags', { 
          query: searchQuery,
          limit: 50 
        });
        if (response.success) {
          setHashtags(response.data?.hashtags || []);
        }
      } else if (activeTab === 'channels') {
        // Поиск по каналам
        const response = await apiService.get('/search/users', { 
          query: searchQuery,
          limit: 50 
        });
        if (response.success) {
          setChannels(response.data?.users || []);
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoPress = (video: VideoItem, index: number) => {
    navigation.navigate('Видео', {
      screen: 'TikTokPlayer',
      params: { videos, initialIndex: index }
    });
  };

  const handleHashtagPress = async (hashtag: HashtagItem) => {
    try {
      setIsLoading(true);
      // Загружаем видео по хештегу
      const response = await apiService.get('/videos/by-hashtag', { 
        tag: hashtag.tag,
        limit: 50 
      });
      
      if (response.success && response.data?.videos?.length > 0) {
        // Открываем TikTok плеер с видео по этому хештегу
        navigation.navigate('Видео', {
          screen: 'TikTokPlayer',
          params: { 
            videos: response.data.videos, 
            initialIndex: 0 
          }
        });
      }
    } catch (error) {
      console.error('Error loading hashtag videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelPress = async (channel: ChannelItem) => {
    try {
      setIsLoading(true);
      // Загружаем видео канала
      const response = await apiService.get(`/users/${channel.id}/videos`, { 
        limit: 50 
      });
      
      if (response.success && response.data?.videos?.length > 0) {
        // Открываем TikTok плеер с видео этого канала
        navigation.navigate('Видео', {
          screen: 'TikTokPlayer',
          params: { 
            videos: response.data.videos, 
            initialIndex: 0 
          }
        });
      }
    } catch (error) {
      console.error('Error loading channel videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => (
    <TouchableOpacity onPress={() => handleVideoPress(item, index)}>
      <Card style={styles.videoCard}>
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x225' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>@{item.author.username}</Text>
          </View>
          
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#666" />
              <Text style={styles.statText}>{formatCount(item.views)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text style={styles.statText}>{formatCount(item.likes)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.statText}>{formatCount(item.comments)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderHashtagItem = ({ item }: { item: HashtagItem }) => (
    <TouchableOpacity onPress={() => handleHashtagPress(item)}>
      <Card style={styles.hashtagCard}>
        <Card.Content style={styles.hashtagContent}>
          <View style={styles.hashtagIconContainer}>
            <Ionicons name="pricetag-outline" size={32} color="#000" />
          </View>
          
          <View style={styles.hashtagInfo}>
            <Text style={styles.hashtagTitle}>#{item.tag}</Text>
            <Text style={styles.hashtagStats}>
              {formatCount(item.videoCount)} видео • {formatCount(item.views)} просмотров
            </Text>
          </View>
          
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderChannelItem = ({ item }: { item: ChannelItem }) => (
    <TouchableOpacity onPress={() => handleChannelPress(item)}>
      <Card style={styles.channelCard}>
        <Card.Content style={styles.channelContent}>
          <View style={styles.channelAvatar}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-outline" size={32} color="#000" />
            )}
          </View>
          
          <View style={styles.channelInfo}>
            <Text style={styles.channelName}>@{item.username}</Text>
            {item.bio && (
              <Text style={styles.channelBio} numberOfLines={1}>
                {item.bio}
              </Text>
            )}
            <Text style={styles.channelStats}>
              {formatCount(item.followers)} подписчиков • {formatCount(item.videoCount)} видео
            </Text>
          </View>
          
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'videos': return 'Поиск видео...';
      case 'hashtags': return 'Поиск хештегов...';
      case 'channels': return 'Поиск каналов...';
      default: return 'Поиск...';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Поиск...</Text>
        </View>
      );
    }

    if (activeTab === 'videos') {
      if (videos.length > 0) {
        return (
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      }
    } else if (activeTab === 'hashtags') {
      if (hashtags.length > 0) {
        return (
          <FlatList
            data={hashtags}
            renderItem={renderHashtagItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      }
    } else if (activeTab === 'channels') {
      if (channels.length > 0) {
        return (
          <FlatList
            data={channels}
            renderItem={renderChannelItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      }
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={activeTab === 'videos' ? 'play-outline' : activeTab === 'hashtags' ? 'pricetag-outline' : 'person-outline'} 
          size={64} 
          color="#ccc" 
        />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Ничего не найдено' : 'Введите запрос для поиска'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Найти</Text>
        </TouchableOpacity>
      </View>

      {/* Табы типов поиска */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {searchTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#000' : '#999'} 
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Категории только для видео */}
      {activeTab === 'videos' && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((item) => (
              <Chip
                key={item.key}
                selected={selectedCategory === item.key}
                onPress={() => setSelectedCategory(item.key)}
                style={[
                  styles.categoryChip,
                  selectedCategory === item.key && styles.selectedCategoryChip
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === item.key && styles.selectedCategoryChipText
                ]}
              >
                {item.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategoryChip: {
    backgroundColor: '#000',
  },
  categoryChipText: {
    color: '#666',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  videoCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  // Hashtag styles
  hashtagCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  hashtagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  hashtagIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  hashtagStats: {
    fontSize: 14,
    color: '#666',
  },
  // Channel styles
  channelCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  channelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  channelBio: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  channelStats: {
    fontSize: 13,
    color: '#999',
  },
});

export default SearchScreen;

