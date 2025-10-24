import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                MebelPlace
              </span>
            </div>
            <p className="text-sm text-gray-400">
              © {currentYear} MebelPlace. Все права защищены.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
            >
              Политика конфиденциальности
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
            >
              Пользовательское соглашение
            </Link>
            <a
              href="mailto:bekaron.company@gmail.com"
              className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
            >
              Поддержка
            </a>
          </div>

          {/* Social Links (optional) */}
          <div className="flex items-center gap-4">
            <a
              href="https://mebelplace.com.kz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-400 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Платформа для поиска мастеров и размещения заказов в Казахстане
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer

