import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'

const PrivacyPolicyPage = () => {
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
            Политика конфиденциальности
          </h1>
          
          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-400">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                пользователей платформы MebelPlace (далее — «Платформа»). Мы уважаем вашу конфиденциальность 
                и обязуемся защищать ваши персональные данные в соответствии с законодательством Республики Казахстан.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Какие данные мы собираем</h2>
              <p className="mb-2">При использовании Платформы мы можем собирать следующие категории данных:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Регистрационные данные:</strong> имя, номер телефона, адрес электронной почты</li>
                <li><strong>Профильные данные:</strong> фотография профиля, информация о роли (заказчик/мастер), специализация</li>
                <li><strong>Данные заказов:</strong> описание работ, фотографии, адрес выполнения, бюджет</li>
                <li><strong>Данные общения:</strong> сообщения в чатах, файлы, видео</li>
                <li><strong>Технические данные:</strong> IP-адрес, тип устройства, браузер, журналы доступа</li>
                <li><strong>Данные о местоположении:</strong> при создании заказов (с вашего согласия)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Цели обработки данных</h2>
              <p className="mb-2">Мы используем ваши данные для следующих целей:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Предоставление и улучшение услуг Платформы</li>
                <li>Обработка и выполнение заказов</li>
                <li>Обеспечение связи между заказчиками и мастерами</li>
                <li>Отправка уведомлений о статусе заказов и сообщений</li>
                <li>Предотвращение мошенничества и обеспечение безопасности</li>
                <li>Соблюдение законодательных требований</li>
                <li>Анализ и улучшение работы Платформы</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Правовые основания обработки</h2>
              <p className="mb-2">Мы обрабатываем ваши данные на следующих правовых основаниях:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ваше согласие на обработку персональных данных</li>
                <li>Необходимость исполнения договора между вами и Платформой</li>
                <li>Соблюдение законодательных обязательств</li>
                <li>Защита наших законных интересов</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Передача данных третьим лицам</h2>
              <p className="mb-2">
                Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением следующих случаев:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>С вашего явного согласия</li>
                <li>Для выполнения заказов (передача контактных данных между заказчиками и мастерами)</li>
                <li>Сервисным провайдерам, помогающим в работе Платформы (хостинг, аналитика, SMS-уведомления)</li>
                <li>По требованию государственных органов в соответствии с законодательством РК</li>
                <li>Для защиты прав и безопасности Платформы и пользователей</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Защита данных</h2>
              <p className="mb-2">
                Мы применяем современные технические и организационные меры для защиты ваших данных:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Шифрование данных при передаче (SSL/TLS)</li>
                <li>Ограничение доступа к персональным данным</li>
                <li>Регулярное резервное копирование</li>
                <li>Мониторинг безопасности и аудит доступа</li>
                <li>Обучение персонала правилам обработки данных</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Срок хранения данных</h2>
              <p>
                Мы храним ваши персональные данные до тех пор, пока это необходимо для целей, указанных 
                в настоящей Политике, либо до момента отзыва вашего согласия. После удаления аккаунта 
                ваши данные будут удалены в течение 30 дней, за исключением данных, которые мы обязаны 
                хранить в соответствии с законодательством РК.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Ваши права</h2>
              <p className="mb-2">Вы имеете следующие права в отношении ваших персональных данных:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Право на доступ:</strong> получить информацию о том, какие данные мы о вас храним</li>
                <li><strong>Право на исправление:</strong> исправить неточные или неполные данные</li>
                <li><strong>Право на удаление:</strong> удалить ваши данные («право быть забытым»)</li>
                <li><strong>Право на ограничение:</strong> ограничить обработку ваших данных</li>
                <li><strong>Право на возражение:</strong> возразить против обработки данных</li>
                <li><strong>Право на переносимость:</strong> получить данные в структурированном формате</li>
                <li><strong>Право на отзыв согласия:</strong> в любой момент отозвать согласие на обработку</li>
              </ul>
              <p className="mt-3">
                Для реализации ваших прав обращайтесь по адресу: <a href="mailto:privacy@mebelplace.com.kz" className="text-purple-400 hover:text-purple-300">privacy@mebelplace.com.kz</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Файлы cookie</h2>
              <p>
                Мы используем файлы cookie и аналогичные технологии для улучшения работы Платформы, 
                аналитики использования и персонализации контента. Вы можете управлять настройками 
                cookie в своем браузере, однако отключение некоторых cookie может ограничить 
                функциональность Платформы.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Дети</h2>
              <p>
                Платформа не предназначена для лиц младше 18 лет. Мы сознательно не собираем 
                персональные данные детей. Если вам стало известно, что ребенок предоставил нам 
                свои данные, просим сообщить об этом по адресу: 
                <a href="mailto:privacy@mebelplace.com.kz" className="text-purple-400 hover:text-purple-300"> privacy@mebelplace.com.kz</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Изменения в Политике</h2>
              <p>
                Мы можем периодически обновлять настоящую Политику конфиденциальности. О существенных 
                изменениях мы уведомим вас через Платформу или по электронной почте. Продолжение 
                использования Платформы после вступления изменений в силу означает ваше согласие 
                с обновленной Политикой.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Контактная информация</h2>
              <p className="mb-2">По вопросам, связанным с обработкой персональных данных, обращайтесь:</p>
              <ul className="list-none space-y-1 ml-4">
                <li>Email: <a href="mailto:privacy@mebelplace.com.kz" className="text-purple-400 hover:text-purple-300">privacy@mebelplace.com.kz</a></li>
                <li>Email: <a href="mailto:support@mebelplace.com.kz" className="text-purple-400 hover:text-purple-300">support@mebelplace.com.kz</a></li>
                <li>Сайт: <a href="https://mebelplace.com.kz" className="text-purple-400 hover:text-purple-300">https://mebelplace.com.kz</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">13. Применимое право</h2>
              <p>
                Настоящая Политика конфиденциальности регулируется законодательством Республики Казахстан, 
                в частности Законом РК «О персональных данных и их защите» от 21 мая 2013 года № 94-V.
              </p>
            </section>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default PrivacyPolicyPage

