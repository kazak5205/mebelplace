/**
 * SearchScreen - TikTok-style search
 * Синхронизировано с web SearchResultsPage - dark theme, orange accent
 */
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
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/apiService';
import { videoService } from '../../services/videoService';
import { FadeInView } from '../../components/TikTokAnimations';

const { width } = Dimensions.get('window');

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
        const response = await videoService.getVideos({ 
          search: searchQuery,
          limit: 50 
        });
        setVideos(response.videos || []);
      } else if (activeTab === 'hashtags') {
        const data: any = await apiService.get('/search/hashtags', { 
          query: searchQuery,
          limit: 50 
        });
        setHashtags((data.data || data).hashtags || []);
      } else if (activeTab === 'channels') {
        const data: any = await apiService.get('/search/users', { 
          query: searchQuery,
          limit: 50 
        });
        setChannels((data.data || data).users || []);
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
      const data: any = await apiService.get('/videos/by-hashtag', { 
        tag: hashtag.tag,
        limit: 50 
      });
      
      const videos = (data.data || data).videos || [];
      if (videos.length > 0) {
        navigation.navigate('Видео', {
          screen: 'TikTokPlayer',
          params: { videos, initialIndex: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading hashtag videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelPress = async (channel: ChannelItem) => {
    navigation.navigate('MasterChannel', { masterId: channel.id });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => (
    <FadeInView delay={index * 50}>
      <TouchableOpacity 
        onPress={() => handleVideoPress(item, index)}
        style={styles.videoItem}
      >
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/200x350' }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.videoOverlay}
        >
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.videoStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={14} color="#fff" />
                <Text style={styles.statText}>{formatCount(item.likes)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.statText}>{formatCount(item.views)}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </FadeInView>
  );

  const renderHashtagItem = ({ item, index }: { item: HashtagItem; index: number }) => (
    <FadeInView delay={index * 50}>
      <TouchableOpacity onPress={() => handleHashtagPress(item)} style={styles.hashtagItem}>
        <View style={styles.hashtagIcon}>
          <Ionicons name="pricetag" size={24} color="#f97316" />
        </View>
        <View style={styles.hashtagInfo}>
          <Text style={styles.hashtagTitle}>#{item.tag}</Text>
          <Text style={styles.hashtagStats}>
            {formatCount(item.videoCount)} видео • {formatCount(item.views)} просмотров
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>
    </FadeInView>
  );

  const renderChannelItem = ({ item, index }: { item: ChannelItem; index: number }) => (
    <FadeInView delay={index * 50}>
      <TouchableOpacity onPress={() => handleChannelPress(item)} style={styles.channelItem}>
        <View style={styles.channelAvatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.channelAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.channelBio} numberOfLines={1}>{item.bio}</Text>
          )}
          <Text style={styles.channelStats}>
            {formatCount(item.followers)} подписчиков • {item.videoCount} видео
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>
    </FadeInView>
  );

  return (
    <View style={styles.container}>
      {/* Search Header - TikTok Style */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск видео, хештегов, каналов..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs - TikTok Style */}
      <View style={styles.tabs}>
        {searchTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? '#f97316' : 'rgba(255,255,255,0.6)'} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <>
          {activeTab === 'videos' && videos.length > 0 && (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.videoGrid}
              contentContainerStyle={styles.listContent}
            />
          )}

          {activeTab === 'hashtags' && hashtags.length > 0 && (
            <FlatList
              data={hashtags}
              renderItem={renderHashtagItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}

          {activeTab === 'channels' && channels.length > 0 && (
            <FlatList
              data={channels}
              renderItem={renderChannelItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}

          {((activeTab === 'videos' && videos.length === 0) ||
            (activeTab === 'hashtags' && hashtags.length === 0) ||
            (activeTab === 'channels' && channels.length === 0)) &&
            searchQuery.length > 0 && !isLoading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>Ничего не найдено</Text>
                <Text style={styles.emptySubtext}>Попробуйте другой запрос</Text>
              </View>
            )}

          {searchQuery.length === 0 && !isLoading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>Начните поиск</Text>
              <Text style={styles.emptySubtext}>Введите запрос выше</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#111',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  activeTabText: {
    color: '#f97316',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#f97316',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  // Video Grid (3 columns)
  videoGrid: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  videoItem: {
    width: (width - 38) / 3,
    aspectRatio: 9 / 16,
    backgroundColor: '#1a1a1a',
    marginRight: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  videoInfo: {
    gap: 4,
  },
  videoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  videoStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: '#fff',
  },
  // Hashtag List
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  hashtagIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249,115,22,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  hashtagStats: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  // Channel List
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  channelAvatarContainer: {
    marginRight: 12,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  channelBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  channelStats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default SearchScreen;
