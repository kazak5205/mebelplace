import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <GlassCard className="p-8">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Пользовательское соглашение
          </h1>
          
          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Общие положения</h2>
              <p className="mb-2">
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует использование 
                платформы MebelPlace (далее — «Платформа», «Сервис»), расположенной по адресу 
                <a href="https://mebelplace.com.kz" className="text-orange-400 hover:text-purple-300"> https://mebelplace.com.kz</a>.
              </p>
              <p>
                Используя Платформу, вы соглашаетесь с условиями настоящего Соглашения. Если вы не согласны 
                с каким-либо из условий, пожалуйста, не используйте Платформу.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Определения</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Платформа</strong> — онлайн-сервис MebelPlace для поиска мастеров и размещения заказов</li>
                <li><strong>Пользователь</strong> — любое лицо, использующее Платформу</li>
                <li><strong>Заказчик</strong> — пользователь, размещающий заказы на выполнение работ</li>
                <li><strong>Мастер</strong> — пользователь, предлагающий свои услуги по выполнению работ</li>
                <li><strong>Заказ</strong> — запрос на выполнение работ, размещенный на Платформе</li>
                <li><strong>Аккаунт</strong> — учетная запись пользователя на Платформе</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Регистрация и аккаунт</h2>
              <p className="mb-2">3.1. Для использования полного функционала Платформы необходимо пройти регистрацию.</p>
              <p className="mb-2">3.2. При регистрации вы обязуетесь:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставлять точную и актуальную информацию</li>
                <li>Поддерживать актуальность данных в профиле</li>
                <li>Обеспечить безопасность своего пароля</li>
                <li>Немедленно сообщать о несанкционированном доступе к аккаунту</li>
              </ul>
              <p className="mt-2">
                3.3. Вы несете полную ответственность за все действия, совершенные через ваш аккаунт.
              </p>
              <p className="mt-2">
                3.4. Регистрация допускается только для лиц старше 18 лет.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Услуги Платформы</h2>
              <p className="mb-2">4.1. Платформа предоставляет следующие услуги:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Размещение заказов на выполнение работ</li>
                <li>Поиск мастеров по специализациям</li>
                <li>Система откликов на заказы</li>
                <li>Встроенный чат для общения</li>
                <li>Обмен фотографиями и видео</li>
                <li>Просмотр профилей и портфолио мастеров</li>
                <li>Система уведомлений</li>
              </ul>
              <p className="mt-2">
                4.2. Платформа является посредником между заказчиками и мастерами и не несет ответственности 
                за качество выполненных работ, сроки, стоимость и другие аспекты взаимодействия между пользователями.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Обязанности пользователей</h2>
              
              <h3 className="text-lg font-semibold text-white mt-4 mb-2">5.1. Все пользователи обязуются:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Соблюдать законодательство Республики Казахстан</li>
                <li>Не нарушать права других пользователей</li>
                <li>Не размещать запрещенный контент (незаконный, оскорбительный, порнографический и т.д.)</li>
                <li>Не распространять спам и рекламу без разрешения</li>
                <li>Не использовать Платформу в мошеннических целях</li>
                <li>Не пытаться получить несанкционированный доступ к системе</li>
                <li>Вести себя уважительно в общении с другими пользователями</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-4 mb-2">5.2. Заказчики дополнительно обязуются:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставлять точное и полное описание работ</li>
                <li>Указывать реальный бюджет и сроки</li>
                <li>Своевременно отвечать на отклики мастеров</li>
                <li>Оплачивать выполненные работы согласно договоренности</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-4 mb-2">5.3. Мастера дополнительно обязуются:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставлять достоверную информацию о своих навыках и опыте</li>
                <li>Размещать реальные примеры выполненных работ</li>
                <li>Выполнять взятые на себя обязательства</li>
                <li>Соблюдать профессиональную этику</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Запрещенные действия</h2>
              <p className="mb-2">На Платформе запрещается:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Создание нескольких аккаунтов одним лицом</li>
                <li>Использование ботов и автоматизированных систем</li>
                <li>Размещение фиктивных заказов</li>
                <li>Накрутка рейтингов и отзывов</li>
                <li>Попытки обхода системы комиссий (если применимо)</li>
                <li>Копирование и использование контента Платформы без разрешения</li>
                <li>Обратная инженерия, декомпиляция программного обеспечения</li>
                <li>Использование уязвимостей системы</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Интеллектуальная собственность</h2>
              <p className="mb-2">
                7.1. Все права на Платформу, включая дизайн, код, логотипы, товарные знаки, принадлежат 
                владельцам MebelPlace.
              </p>
              <p className="mb-2">
                7.2. Пользовательский контент (фото, видео, описания) остается собственностью пользователей, 
                однако загружая контент на Платформу, вы предоставляете нам неисключительную лицензию на его 
                использование для работы и продвижения Сервиса.
              </p>
              <p>
                7.3. Вы гарантируете, что загружаемый контент не нарушает права третьих лиц.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Конфиденциальность</h2>
              <p>
                Обработка персональных данных регулируется нашей 
                <a href="/privacy" className="text-orange-400 hover:text-purple-300"> Политикой конфиденциальности</a>, 
                которая является неотъемлемой частью настоящего Соглашения.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Ответственность</h2>
              <p className="mb-2">
                9.1. Платформа предоставляется «как есть» без каких-либо гарантий.
              </p>
              <p className="mb-2">
                9.2. Мы не несем ответственности за:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Качество работ, выполненных мастерами</li>
                <li>Действия и бездействие пользователей</li>
                <li>Финансовые споры между пользователями</li>
                <li>Технические сбои и перерывы в работе Сервиса</li>
                <li>Потерю данных</li>
                <li>Косвенный или случайный ущерб</li>
              </ul>
              <p className="mt-2">
                9.3. Взаимодействие между заказчиками и мастерами осуществляется на их собственный риск.
              </p>
              <p className="mt-2">
                9.4. Максимальная ответственность Платформы ограничена суммой, уплаченной пользователем 
                за использование платных услуг (если применимо).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Модерация и санкции</h2>
              <p className="mb-2">
                10.1. Мы оставляем за собой право модерировать контент и действия пользователей.
              </p>
              <p className="mb-2">
                10.2. При нарушении условий Соглашения мы можем:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Удалить нарушающий контент</li>
                <li>Ограничить функционал аккаунта</li>
                <li>Временно заблокировать аккаунт</li>
                <li>Удалить аккаунт без возможности восстановления</li>
              </ul>
              <p className="mt-2">
                10.3. В серьезных случаях (мошенничество, преступная деятельность) мы можем передать 
                информацию правоохранительным органам.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Разрешение споров</h2>
              <p className="mb-2">
                11.1. Споры между пользователями решаются ими самостоятельно. Платформа может выступать 
                в качестве посредника, но не обязана этого делать.
              </p>
              <p className="mb-2">
                11.2. Претензии к Платформе направляются по адресу: 
                <a href="mailto:bekaron.company@gmail.com" className="text-orange-400 hover:text-purple-300"> bekaron.company@gmail.com</a>
              </p>
              <p>
                11.3. При невозможности досудебного урегулирования споры рассматриваются в соответствии 
                с законодательством Республики Казахстан.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Изменения в Соглашении</h2>
              <p className="mb-2">
                12.1. Мы оставляем за собой право изменять настоящее Соглашение в любое время.
              </p>
              <p className="mb-2">
                12.2. О существенных изменениях мы уведомим пользователей через Платформу или по электронной почте.
              </p>
              <p>
                12.3. Продолжение использования Платформы после внесения изменений означает ваше согласие 
                с новыми условиями.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">13. Прекращение использования</h2>
              <p className="mb-2">
                13.1. Вы можете в любой момент удалить свой аккаунт через настройки профиля.
              </p>
              <p className="mb-2">
                13.2. Мы можем прекратить предоставление услуг или удалить ваш аккаунт:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>При нарушении условий Соглашения</li>
                <li>По вашему запросу</li>
                <li>При длительной неактивности (более 2 лет)</li>
                <li>При прекращении работы Платформы</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">14. Применимое право и юрисдикция</h2>
              <p className="mb-2">
                14.1. Настоящее Соглашение регулируется законодательством Республики Казахстан.
              </p>
              <p>
                14.2. Все споры, вытекающие из настоящего Соглашения, подлежат рассмотрению в судах 
                Республики Казахстан по месту нахождения Платформы.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">15. Контактная информация</h2>
              <p className="mb-2">По всем вопросам обращайтесь:</p>
              <ul className="list-none space-y-1 ml-4">
                <li>Email: <a href="mailto:bekaron.company@gmail.com" className="text-orange-400 hover:text-purple-300">bekaron.company@gmail.com</a></li>
                <li>Email: <a href="mailto:legal@mebelplace.com.kz" className="text-orange-400 hover:text-purple-300">legal@mebelplace.com.kz</a></li>
                <li>Сайт: <a href="https://mebelplace.com.kz" className="text-orange-400 hover:text-purple-300">https://mebelplace.com.kz</a></li>
              </ul>
            </section>

            <section className="border-t border-gray-700 pt-6 mt-8">
              <p className="text-sm text-gray-400 italic">
                Используя Платформу MebelPlace, вы подтверждаете, что прочитали, поняли и согласны 
                с условиями настоящего Пользовательского соглашения.
              </p>
            </section>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default TermsOfServicePage

