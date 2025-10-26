import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';

class TermsOfServicePage extends ConsumerStatefulWidget {
  const TermsOfServicePage({Key? key}) : super(key: key);

  @override
  ConsumerState<TermsOfServicePage> createState() => _TermsOfServicePageState();
}

class _TermsOfServicePageState extends ConsumerState<TermsOfServicePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.dark,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Условия использования',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Заголовок
            _buildHeader(),
            
            SizedBox(height: 24.h),
            
            // Содержание
            _buildContent(),
            
            SizedBox(height: 40.h),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.secondary.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.description,
            size: 48.sp,
            color: AppColors.primary,
          ),
          SizedBox(height: 16.h),
          Text(
            'Условия использования',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8.h),
          Text(
            'Последнее обновление: ${_getCurrentDate()}',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildContent() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSection(
            '1. Принятие условий',
            'Настоящие Условия использования (далее - "Условия") регулируют использование мобильного приложения MebelPlace (далее - "Приложение").\n\nИспользуя наше Приложение, вы соглашаетесь соблюдать настоящие Условия. Если вы не согласны с какими-либо положениями, пожалуйста, не используйте Приложение.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '2. Описание сервиса',
            'MebelPlace - это платформа, которая соединяет заказчиков с мастерами для выполнения работ по изготовлению и ремонту мебели.\n\nНаша платформа предоставляет:\n• Возможность размещения заявок\n• Поиск и выбор мастеров\n• Систему отзывов и рейтингов\n• Безопасные платежи\n• Систему сообщений',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '3. Регистрация и аккаунт',
            'Для использования Приложения необходимо:\n\n• Создать аккаунт с достоверной информацией\n• Подтвердить номер телефона\n• Предоставить необходимые документы (для мастеров)\n• Поддерживать актуальность данных\n\nВы несете ответственность за безопасность своего аккаунта.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '4. Обязанности пользователей',
            'Пользователи обязуются:\n\n• Предоставлять достоверную информацию\n• Соблюдать законодательство РК\n• Не нарушать права других пользователей\n• Не использовать Приложение для незаконных целей\n• Своевременно оплачивать услуги\n• Выполнять взятые обязательства',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '5. Обязанности мастеров',
            'Мастера дополнительно обязуются:\n\n• Предоставлять качественные услуги\n• Соблюдать согласованные сроки\n• Использовать качественные материалы\n• Предоставлять гарантии на работу\n• Быть доступными для связи\n• Соблюдать технику безопасности',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '6. Платежи и комиссии',
            'Платежная система:\n\n• Заказчики оплачивают услуги через Приложение\n• Комиссия платформы составляет 5-10%\n• Платежи обрабатываются безопасно\n• Возврат средств возможен в соответствии с политикой\n• Налоги и сборы оплачиваются отдельно',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '7. Отзывы и рейтинги',
            'Система оценки:\n\n• Пользователи могут оставлять отзывы\n• Рейтинги влияют на видимость в поиске\n• Запрещены ложные отзывы\n• Отзывы должны быть объективными\n• Мы оставляем право модерировать контент',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '8. Интеллектуальная собственность',
            'Все права на Приложение принадлежат MebelPlace:\n\n• Дизайн и интерфейс\n• Логотип и брендинг\n• Алгоритмы и программный код\n• База данных пользователей\n• Контент платформы\n\nПользователи не могут копировать или использовать наши материалы без разрешения.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '9. Ограничение ответственности',
            'Мы не несем ответственности за:\n\n• Качество услуг мастеров\n• Ущерб от использования услуг\n• Потерю данных пользователей\n• Работу внешних сервисов\n• Действия третьих лиц\n\nМаксимальная ответственность ограничена суммой комиссии за последний месяц.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '10. Приостановка и блокировка',
            'Мы можем приостановить или заблокировать аккаунт при:\n\n• Нарушении настоящих Условий\n• Подозрении в мошенничестве\n• Жалобах других пользователей\n• Неоплате комиссий\n• Нарушении законодательства\n\nРешение о блокировке принимается администрацией.',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '11. Изменение условий',
            'Мы можем изменять настоящие Условия:\n\n• Уведомляем пользователей заранее\n• Изменения вступают в силу через 30 дней\n• Продолжение использования означает согласие\n• Существенные изменения требуют подтверждения\n• Старые версии сохраняются в архиве',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '12. Разрешение споров',
            'Споры разрешаются:\n\n• В первую очередь путем переговоров\n• Через службу поддержки\n• В соответствии с законодательством РК\n• В судах г. Алматы\n• С использованием медиации при возможности',
          ),
          
          SizedBox(height: 24.h),
          
          _buildSection(
            '13. Контактная информация',
            'По вопросам Условий использования обращайтесь:\n\n• Email: legal@mebelplace.com.kz\n• Телефон: +7 (777) 123-45-67\n• Адрес: г. Алматы, ул. Абая 150\n• Время работы: Пн-Пт 9:00-18:00',
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms, delay: 200.ms).slideY(
      begin: 0.3,
      end: 0,
      curve: Curves.easeOut,
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 16.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 12.h),
        Text(
          content,
          style: TextStyle(
            color: Colors.white.withOpacity(0.9),
            fontSize: 14.sp,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  String _getCurrentDate() {
    final now = DateTime.now();
    return '${now.day}.${now.month}.${now.year}';
  }
}
