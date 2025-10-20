import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Searchbar,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Заявки',
    question: 'Как создать заявку на мебель?',
    answer: 'Нажмите кнопку "Создать заявку" на главном экране, заполните описание, добавьте фото и укажите ваш регион.',
  },
  {
    id: '2',
    category: 'Заявки',
    question: 'Сколько времени рассматривается заявка?',
    answer: 'Обычно поставщики откликаются в течение 24 часов. Вы получите уведомление о каждом новом отклике.',
  },
  {
    id: '3',
    category: 'Заявки',
    question: 'Можно ли редактировать заявку?',
    answer: 'Да, вы можете редактировать заявку до тех пор, пока не примете один из откликов.',
  },
  {
    id: '4',
    category: 'Видео',
    question: 'Как загрузить видео?',
    answer: 'Перейдите в раздел "Видео", нажмите кнопку загрузки, выберите видео и добавьте описание.',
  },
  {
    id: '5',
    category: 'Видео',
    question: 'Какие форматы видео поддерживаются?',
    answer: 'Мы поддерживаем MP4, MOV, AVI. Максимальный размер файла - 500 МБ.',
  },
  {
    id: '6',
    category: 'Видео',
    question: 'Как набрать больше просмотров?',
    answer: 'Снимайте качественный контент, используйте хештеги, публикуйте регулярно и взаимодействуйте с аудиторией.',
  },
  {
    id: '7',
    category: 'Чат',
    question: 'Как начать переписку с поставщиком?',
    answer: 'Откликнитесь на заявку или найдите поставщика в каталоге и нажмите "Написать".',
  },
  {
    id: '8',
    category: 'Чат',
    question: 'Можно ли отправлять файлы в чате?',
    answer: 'Да, вы можете отправлять изображения, документы и голосовые сообщения.',
  },
  {
    id: '9',
    category: 'Аккаунт',
    question: 'Как изменить роль (покупатель/поставщик)?',
    answer: 'Для изменения роли свяжитесь с поддержкой через форму обратной связи.',
  },
  {
    id: '10',
    category: 'Аккаунт',
    question: 'Как удалить аккаунт?',
    answer: 'Перейдите в Настройки → Безопасность → Удалить аккаунт. Это действие необратимо.',
  },
  {
    id: '11',
    category: 'Оплата',
    question: 'Как оплатить заказ?',
    answer: 'Мы поддерживаем оплату по карте, через Kaspi и наличными при встрече.',
  },
  {
    id: '12',
    category: 'Оплата',
    question: 'Безопасна ли оплата через приложение?',
    answer: 'Да, мы используем защищенное соединение и не храним данные карт.',
  },
];

const HelpScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@mebelplace.com.kz?subject=Помощь');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/77001234567');
  };

  const handleTelegram = () => {
    Linking.openURL('https://t.me/mebelplace_support');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Search */}
        <Searchbar
          placeholder="Поиск по вопросам..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Свяжитесь с нами</Text>
            
            <Button
              mode="outlined"
              onPress={handleContactSupport}
              style={styles.contactButton}
              icon="email"
            >
              Написать в поддержку
            </Button>

            <View style={styles.socialButtons}>
              <Button
                mode="contained-tonal"
                onPress={handleWhatsApp}
                style={styles.socialButton}
                icon="whatsapp"
                buttonColor="#25D366"
                textColor="white"
              >
                WhatsApp
              </Button>

              <Button
                mode="contained-tonal"
                onPress={handleTelegram}
                style={styles.socialButton}
                icon="send"
                buttonColor="#0088cc"
                textColor="white"
              >
                Telegram
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* FAQ by Category */}
        <Text style={styles.mainTitle}>Часто задаваемые вопросы</Text>

        {searchQuery ? (
          // Show filtered results
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.resultsCount}>
                Найдено результатов: {filteredFAQ.length}
              </Text>
              {filteredFAQ.map((item) => (
                <List.Accordion
                  key={item.id}
                  title={item.question}
                  titleNumberOfLines={2}
                  expanded={expandedId === item.id}
                  onPress={() => handleToggle(item.id)}
                  left={(props) => <List.Icon {...props} icon="help-circle" />}
                >
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                  </View>
                </List.Accordion>
              ))}
            </Card.Content>
          </Card>
        ) : (
          // Show by categories
          categories.map((category) => {
            const categoryItems = faqData.filter(item => item.category === category);
            return (
              <Card key={category} style={styles.card}>
                <Card.Content>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {categoryItems.map((item) => (
                    <List.Accordion
                      key={item.id}
                      title={item.question}
                      titleNumberOfLines={2}
                      expanded={expandedId === item.id}
                      onPress={() => handleToggle(item.id)}
                      left={(props) => <List.Icon {...props} icon="help-circle" />}
                    >
                      <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{item.answer}</Text>
                      </View>
                    </List.Accordion>
                  ))}
                </Card.Content>
              </Card>
            );
          })
        )}

        {/* Contact Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Контактная информация</Text>
            
            <View style={styles.contactInfo}>
              <Ionicons name="mail" size={20} color="#f97316" />
              <Text style={styles.contactText}>support@mebelplace.com.kz</Text>
            </View>

            <View style={styles.contactInfo}>
              <Ionicons name="call" size={20} color="#f97316" />
              <Text style={styles.contactText}>+7 (700) 123-45-67</Text>
            </View>

            <View style={styles.contactInfo}>
              <Ionicons name="time" size={20} color="#f97316" />
              <Text style={styles.contactText}>Пн-Пт: 9:00 - 18:00</Text>
            </View>

            <View style={styles.contactInfo}>
              <Ionicons name="location" size={20} color="#f97316" />
              <Text style={styles.contactText}>г. Алматы, пр. Абая 150</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f97316',
  },
  contactButton: {
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  categoryBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#333',
  },
});

export default HelpScreen;

