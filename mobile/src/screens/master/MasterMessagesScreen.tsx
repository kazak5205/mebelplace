import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
  orderId?: string;
  orderTitle?: string;
}

const MasterMessagesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();
      if (response.success) {
        setChats(response.data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('Chat' as never, { chatId: chat.id } as never);
  };

  const handleDeleteChat = async (chatId: string) => {
    Alert.alert(
      'Удалить чат',
      'Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.leaveChat(chatId);
              setChats(prev => prev.filter(chat => chat.id !== chatId));
              Alert.alert('Успех', 'Чат удален');
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Ошибка', 'Не удалось удалить чат');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = async (participantId: string) => {
    Alert.alert(
      'Заблокировать пользователя',
      'Вы уверены, что хотите заблокировать этого пользователя?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Заблокировать',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement block user API
              Alert.alert('Успех', 'Пользователь заблокирован');
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Ошибка', 'Не удалось заблокировать пользователя');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const otherParticipant = item.participants.find(p => p.id !== user?.id);
    
    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.chatHeader}>
          <Image 
            source={{ 
              uri: otherParticipant?.avatar 
                ? `https://mebelplace.com.kz${otherParticipant.avatar}` 
                : 'https://via.placeholder.com/50'
            }}
            style={styles.avatar}
          />
          <View style={styles.chatInfo}>
            <Text style={styles.chatName} numberOfLines={1}>
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </Text>
            {item.orderTitle && (
              <Text style={styles.orderTitle} numberOfLines={1}>
                Заявка: {item.orderTitle}
              </Text>
            )}
            <Text style={styles.chatLastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          <View style={styles.chatMeta}>
            <Text style={styles.chatTime}>
              {formatTime(item.lastMessageTime)}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteChat(item.id)}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
            <Text style={styles.actionButtonText}>Удалить</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleBlockUser(otherParticipant?.id || '')}
          >
            <Ionicons name="ban" size={16} color="#f59e0b" />
            <Text style={styles.actionButtonText}>Заблокировать</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка чатов...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мессенджер</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Нет сообщений</Text>
          <Text style={styles.emptyDescription}>
            Когда клиенты начнут общаться с вами, ваши чаты появятся здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  chatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  orderTitle: {
    fontSize: 12,
    color: '#f97316',
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export default MasterMessagesScreen;
