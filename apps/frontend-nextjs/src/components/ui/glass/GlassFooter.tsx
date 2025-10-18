'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Bookmark,
  Flag,
  Target,
  Zap,
  Shield,
  Bell,
  Heart,
  Star,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Folder,
  File,
  FolderOpen,
  FolderPlus,
  FilePlus,
  FileMinus,
  FolderMinus,
  Trash,
  BookmarkPlus,
  BookmarkMinus,
  ShieldPlus,
  ShieldMinus,
  Check,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Home as HomeIcon,
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Bell as BellIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  RefreshCw as RefreshIcon,
  Loader as LoaderIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share2 as ShareIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Folder as FolderIcon,
  File as FileIcon,
  FolderOpen as FolderOpenIcon,
  FolderPlus as FolderPlusIcon,
  FilePlus as FilePlusIcon,
  FileMinus as FileMinusIcon,
  FolderMinus as FolderMinusIcon,
  Trash as TrashIcon2,
  BookmarkPlus as BookmarkPlusIcon,
  BookmarkMinus as BookmarkMinusIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  Check as CheckIcon,
  X as XIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Lightbulb as LightbulbIcon,
  BookOpen as BookOpenIcon,
  Menu as MenuIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Globe,
  Languages,
  Sun,
  Moon,
  Monitor,
  Heart as HeartIcon2,
  Star as StarIcon2,
  Bookmark as BookmarkIcon2,
  Share as ShareIcon2,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Edit as EditIcon2,
  Trash as TrashIcon3,
  Plus as PlusIcon2,
  Minus as MinusIcon2,
  Check as CheckIcon2,
  X as XIcon2,
  AlertCircle as AlertCircleIcon2,
  CheckCircle as CheckCircleIcon2,
  Info as InfoIcon3,
  HelpCircle as HelpCircleIcon3,
  AlertTriangle as AlertTriangleIcon2,
  Lightbulb as LightbulbIcon2,
  BookOpen as BookOpenIcon2
} from 'lucide-react';

export interface FooterLink {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  external?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FooterSocial {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface FooterContact {
  type: 'email' | 'phone' | 'address' | 'website';
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
}

export interface FooterState {
  collapsedSections: Set<string>;
  isNewsletterSubscribed: boolean;
  newsletterEmail: string;
}

export interface GlassFooterProps {
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'transparent' | 'fixed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showLogo?: boolean;
  showSections?: boolean;
  showSocial?: boolean;
  showContact?: boolean;
  showNewsletter?: boolean;
  showCopyright?: boolean;
  showBackToTop?: boolean;
  allowCollapse?: boolean;
  allowNewsletter?: boolean;
  allowBackToTop?: boolean;
  isSticky?: boolean;
  isTransparent?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  sections?: FooterSection[];
  social?: FooterSocial[];
  contact?: FooterContact[];
  copyright?: string;
  backToTopText?: string;
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  onLinkClick?: (link: FooterLink) => void;
  onSocialClick?: (social: FooterSocial) => void;
  onContactClick?: (contact: FooterContact) => void;
  onNewsletterSubmit?: (email: string) => void;
  onBackToTop?: () => void;
  onSectionToggle?: (sectionId: string, collapsed: boolean) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm',
    sectionTitleSize: 'text-sm',
    linkSize: 'text-sm',
    iconSize: 'w-4 h-4',
    socialIconSize: 'w-5 h-5',
    spacing: 'space-y-4',
    sectionSpacing: 'space-y-3'
  },
  md: {
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-xl',
    descriptionSize: 'text-base',
    sectionTitleSize: 'text-base',
    linkSize: 'text-sm',
    iconSize: 'w-5 h-5',
    socialIconSize: 'w-6 h-6',
    spacing: 'space-y-6',
    sectionSpacing: 'space-y-4'
  },
  lg: {
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg',
    sectionTitleSize: 'text-lg',
    linkSize: 'text-base',
    iconSize: 'w-6 h-6',
    socialIconSize: 'w-7 h-7',
    spacing: 'space-y-8',
    sectionSpacing: 'space-y-6'
  },
  xl: {
    padding: 'p-10',
    headerPadding: 'p-10 pb-8',
    footerPadding: 'p-10 pt-8',
    titleSize: 'text-3xl',
    descriptionSize: 'text-xl',
    sectionTitleSize: 'text-xl',
    linkSize: 'text-lg',
    iconSize: 'w-7 h-7',
    socialIconSize: 'w-8 h-8',
    spacing: 'space-y-10',
    sectionSpacing: 'space-y-8'
  }
};

// Animation variants
const footerVariants = {
  initial: { 
    opacity: 0, 
    y: 20
  },
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
  }
};

const sectionVariants = {
  initial: { 
    opacity: 0, 
    x: -20
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassFooter: React.FC<GlassFooterProps> = ({
  children,
  variant = 'default',
  size = 'md',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showLogo = true,
  showSections = true,
  showSocial = true,
  showContact = true,
  showNewsletter = false,
  showCopyright = true,
  showBackToTop = true,
  allowCollapse = false,
  allowNewsletter = false,
  allowBackToTop = false,
  isSticky = false,
  isTransparent = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  logo,
  title,
  description,
  sections = [],
  social = [],
  contact = [],
  copyright = '© 2024 MebelPlace. Все права защищены.',
  backToTopText = 'Наверх',
  newsletterTitle = 'Подписка на новости',
  newsletterDescription = 'Получайте последние новости и обновления',
  newsletterPlaceholder = 'Введите ваш email',
  newsletterButtonText = 'Подписаться',
  onLinkClick,
  onSocialClick,
  onContactClick,
  onNewsletterSubmit,
  onBackToTop,
  onSectionToggle
}) => {
  const [footerState, setFooterState] = useState<FooterState>({
    collapsedSections: new Set(),
    isNewsletterSubscribed: false,
    newsletterEmail: ''
  });

  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

  const footerRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsBackToTopVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    setFooterState(prev => {
      const newCollapsed = new Set(prev.collapsedSections);
      if (newCollapsed.has(sectionId)) {
        newCollapsed.delete(sectionId);
      } else {
        newCollapsed.add(sectionId);
      }
      return {
        ...prev,
        collapsedSections: newCollapsed
      };
    });

    const isCollapsed = footerState.collapsedSections.has(sectionId);
    onSectionToggle?.(sectionId, !isCollapsed);
  };

  // Handle newsletter submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerState.newsletterEmail) {
      onNewsletterSubmit?.(footerState.newsletterEmail);
      setFooterState(prev => ({
        ...prev,
        isNewsletterSubscribed: true,
        newsletterEmail: ''
      }));
    }
  };

  // Handle back to top
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onBackToTop?.();
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-b border-glass-border/50',
        config.headerPadding,
        headerClassName
      )}>
        {/* Logo and title */}
        <div className="flex items-center space-x-4">
          {logo && showLogo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          {showTitle && title && (
            <div>
              <h2 className={cn(
                'font-semibold text-white',
                config.titleSize
              )}>
                {title}
              </h2>
              {showDescription && description && (
                <p className={cn(
                  'text-white/80',
                  config.descriptionSize
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Back to top button */}
        {allowBackToTop && showBackToTop && (
          <AnimatePresence>
            {isBackToTopVisible && (
              <motion.button
                onClick={handleBackToTop}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-colors duration-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">{backToTopText}</span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  // Render sections
  const renderSections = () => {
    if (!showSections || sections.length === 0) return null;

    return (
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
        config.sectionSpacing
      )}>
        {sections.map((section) => {
          const isCollapsed = footerState.collapsedSections.has(section.id);

          return (
            <motion.div
              key={section.id}
              className="space-y-4"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Section header */}
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  'font-semibold text-white',
                  config.sectionTitleSize
                )}>
                  {section.title}
                </h3>

                {/* Collapse button */}
                {section.collapsible && allowCollapse && (
                  <button
                    onClick={() => handleSectionToggle(section.id)}
                    className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200 md:hidden"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Section links */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {section.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => {
                          onLinkClick?.(link);
                          link.onClick?.();
                        }}
                        disabled={link.disabled}
                        className={cn(
                          'flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-200',
                          config.linkSize,
                          link.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {link.icon && (
                          <link.icon className={config.iconSize} />
                        )}
                        <span>{link.label}</span>
                        {link.external && (
                          <ExternalLink className="w-3 h-3 text-white/40" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render social
  const renderSocial = () => {
    if (!showSocial || social.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className={cn(
          'font-semibold text-white',
          config.sectionTitleSize
        )}>
          Мы в социальных сетях
        </h3>
        <div className="flex items-center space-x-4">
          {social.map((socialItem) => (
            <button
              key={socialItem.id}
              onClick={() => onSocialClick?.(socialItem)}
              className={cn(
                'p-3 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200',
                socialItem.color && `hover:${socialItem.color}`
              )}
              title={socialItem.name}
            >
              <socialItem.icon className={config.socialIconSize} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render contact
  const renderContact = () => {
    if (!showContact || contact.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className={cn(
          'font-semibold text-white',
          config.sectionTitleSize
        )}>
          Контакты
        </h3>
        <div className="space-y-3">
          {contact.map((contactItem, index) => (
            <div
              key={index}
              className="flex items-center space-x-3"
            >
              {contactItem.icon && (
                <contactItem.icon className={cn(
                  config.iconSize,
                  'text-white/60'
                )} />
              )}
              <div>
                <p className="text-white/60 text-sm">{contactItem.label}</p>
                {contactItem.href ? (
                  <a
                    href={contactItem.href}
                    onClick={() => onContactClick?.(contactItem)}
                    className="text-white hover:text-orange-300 transition-colors duration-200"
                  >
                    {contactItem.value}
                  </a>
                ) : (
                  <p className="text-white">{contactItem.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render newsletter
  const renderNewsletter = () => {
    if (!allowNewsletter || !showNewsletter) return null;

    return (
      <div className="space-y-4">
        <div>
          <h3 className={cn(
            'font-semibold text-white',
            config.sectionTitleSize
          )}>
            {newsletterTitle}
          </h3>
          <p className={cn(
            'text-white/80',
            config.descriptionSize
          )}>
            {newsletterDescription}
          </p>
        </div>

        {footerState.isNewsletterSubscribed ? (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Вы успешно подписались!</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder={newsletterPlaceholder}
                value={footerState.newsletterEmail}
                onChange={(e) => setFooterState(prev => ({ ...prev, newsletterEmail: e.target.value }))}
                className="flex-1 px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-colors duration-200 text-sm"
              >
                {newsletterButtonText}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-t border-glass-border/50',
        config.footerPadding,
        footerClassName
      )}>
        {/* Copyright */}
        {showCopyright && (
          <div className="text-white/60 text-sm">
            {copyright}
          </div>
        )}

        {/* Additional info */}
        <div className="flex items-center space-x-4 text-white/60 text-sm">
          <span>Сделано с ❤️ в Казахстане</span>
        </div>
      </div>
    );
  };

  // Get footer classes
  const getFooterClasses = () => {
    return cn(
      'bg-glass-primary/90 backdrop-blur-xl border-t border-glass-border/50',
      'flex flex-col',
      config.padding,
      isSticky && 'sticky bottom-0 z-50',
      isTransparent && 'bg-transparent border-transparent',
      className
    );
  };

  return (
    <motion.footer
      ref={footerRef}
      className={getFooterClasses()}
      variants={footerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      {renderHeader()}

      {/* Body */}
      <div className={cn(
        'flex-1',
        config.spacing,
        bodyClassName
      )}>
        {/* Sections */}
        {renderSections()}

        {/* Social and contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderSocial()}
          {renderContact()}
        </div>

        {/* Newsletter */}
        {renderNewsletter()}

        {/* Custom children */}
        {children}
      </div>

      {/* Footer */}
      {renderFooter()}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.footer>
  );
};

// Convenience components
export const GlassFooterCompact: React.FC<Omit<GlassFooterProps, 'variant' | 'size'>> = (props) => (
  <GlassFooter {...props} variant="compact" size="sm" />
);

export const GlassFooterDetailed: React.FC<Omit<GlassFooterProps, 'variant' | 'size'>> = (props) => (
  <GlassFooter {...props} variant="detailed" size="lg" />
);

export const GlassFooterMinimal: React.FC<Omit<GlassFooterProps, 'variant'>> = (props) => (
  <GlassFooter {...props} variant="minimal" showSections={false} showSocial={false} showContact={false} showNewsletter={false} />
);

export const GlassFooterTransparent: React.FC<Omit<GlassFooterProps, 'variant'>> = (props) => (
  <GlassFooter {...props} variant="transparent" isTransparent />
);

export const GlassFooterFixed: React.FC<Omit<GlassFooterProps, 'variant'>> = (props) => (
  <GlassFooter {...props} variant="fixed" isSticky />
);

// Example usage component
export const GlassFooterExample: React.FC = () => {
  const sampleSections: FooterSection[] = [
    {
      id: 'company',
      title: 'Компания',
      links: [
        { id: 'about', label: 'О нас', href: '/about' },
        { id: 'careers', label: 'Карьера', href: '/careers' },
        { id: 'news', label: 'Новости', href: '/news' },
        { id: 'press', label: 'Пресса', href: '/press' }
      ],
      collapsible: true
    },
    {
      id: 'products',
      title: 'Продукты',
      links: [
        { id: 'furniture', label: 'Мебель', href: '/furniture' },
        { id: 'kitchens', label: 'Кухни', href: '/kitchens' },
        { id: 'wardrobes', label: 'Шкафы', href: '/wardrobes' },
        { id: 'custom', label: 'На заказ', href: '/custom' }
      ],
      collapsible: true
    },
    {
      id: 'support',
      title: 'Поддержка',
      links: [
        { id: 'help', label: 'Помощь', href: '/help' },
        { id: 'contact', label: 'Контакты', href: '/contact' },
        { id: 'faq', label: 'FAQ', href: '/faq' },
        { id: 'support', label: 'Техподдержка', href: '/support' }
      ],
      collapsible: true
    },
    {
      id: 'legal',
      title: 'Правовая информация',
      links: [
        { id: 'privacy', label: 'Конфиденциальность', href: '/privacy' },
        { id: 'terms', label: 'Условия использования', href: '/terms' },
        { id: 'cookies', label: 'Cookies', href: '/cookies' },
        { id: 'gdpr', label: 'GDPR', href: '/gdpr' }
      ],
      collapsible: true
    }
  ];

  const sampleSocial: FooterSocial[] = [
    { id: 'facebook', name: 'Facebook', href: 'https://facebook.com', icon: Facebook, color: 'hover:text-blue-500' },
    { id: 'twitter', name: 'Twitter', href: 'https://twitter.com', icon: Twitter, color: 'hover:text-blue-400' },
    { id: 'instagram', name: 'Instagram', href: 'https://instagram.com', icon: Instagram, color: 'hover:text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, color: 'hover:text-blue-600' },
    { id: 'youtube', name: 'YouTube', href: 'https://youtube.com', icon: Youtube, color: 'hover:text-red-500' }
  ];

  const sampleContact: FooterContact[] = [
    { type: 'email', label: 'Email', value: 'info@mebelplace.kz', icon: Mail, href: 'mailto:info@mebelplace.kz' },
    { type: 'phone', label: 'Телефон', value: '+7 (727) 123-45-67', icon: Phone, href: 'tel:+77271234567' },
    { type: 'address', label: 'Адрес', value: 'г. Алматы, ул. Абая 150', icon: MapPin },
    { type: 'website', label: 'Сайт', value: 'www.mebelplace.kz', icon: Globe, href: 'https://mebelplace.kz' }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Footer examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Подвалы</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычный подвал
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактный подвал
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальный подвал
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальный подвал
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Прозрачный подвал
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Фиксированный подвал
          </button>
        </div>
      </div>

      {/* Default footer */}
      <GlassFooter
        title="MebelPlace"
        description="Платформа для заказа мебели на заказ"
        sections={sampleSections}
        social={sampleSocial}
        contact={sampleContact}
        variant="default"
        size="md"
        showHeader
        showFooter
        showTitle
        showDescription
        showLogo
        showSections
        showSocial
        showContact
        showNewsletter
        showCopyright
        showBackToTop
        allowCollapse
        allowNewsletter
        allowBackToTop
        newsletterTitle="Подписка на новости"
        newsletterDescription="Получайте последние новости и обновления"
        onLinkClick={(link) => console.log('Link clicked:', link)}
        onSocialClick={(social) => console.log('Social clicked:', social)}
        onContactClick={(contact) => console.log('Contact clicked:', contact)}
        onNewsletterSubmit={(email) => console.log('Newsletter submitted:', email)}
        onBackToTop={() => console.log('Back to top clicked')}
        onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
      />

      {/* Compact footer */}
      <GlassFooterCompact
        title="MebelPlace"
        sections={sampleSections.slice(0, 2)}
        social={sampleSocial.slice(0, 3)}
        contact={sampleContact.slice(0, 2)}
        showHeader
        showTitle
        showSections
        showSocial
        showContact
        showCopyright
        allowCollapse
        onLinkClick={(link) => console.log('Link clicked:', link)}
        onSocialClick={(social) => console.log('Social clicked:', social)}
        onContactClick={(contact) => console.log('Contact clicked:', contact)}
      />

      {/* Detailed footer */}
      <GlassFooterDetailed
        title="MebelPlace"
        description="Платформа для заказа мебели на заказ в Казахстане"
        sections={sampleSections}
        social={sampleSocial}
        contact={sampleContact}
        showHeader
        showFooter
        showTitle
        showDescription
        showLogo
        showSections
        showSocial
        showContact
        showNewsletter
        showCopyright
        showBackToTop
        allowCollapse
        allowNewsletter
        allowBackToTop
        newsletterTitle="Подписка на новости"
        newsletterDescription="Получайте последние новости и обновления"
        onLinkClick={(link) => console.log('Link clicked:', link)}
        onSocialClick={(social) => console.log('Social clicked:', social)}
        onContactClick={(contact) => console.log('Contact clicked:', contact)}
        onNewsletterSubmit={(email) => console.log('Newsletter submitted:', email)}
        onBackToTop={() => console.log('Back to top clicked')}
        onSectionToggle={(sectionId, collapsed) => console.log('Section toggled:', sectionId, collapsed)}
      />

      {/* Minimal footer */}
      <GlassFooterMinimal
        title="MebelPlace"
        showHeader
        showTitle
        showCopyright
        onBackToTop={() => console.log('Back to top clicked')}
      />

      {/* Transparent footer */}
      <GlassFooterTransparent
        title="MebelPlace"
        sections={sampleSections.slice(0, 2)}
        social={sampleSocial.slice(0, 3)}
        showHeader
        showTitle
        showSections
        showSocial
        showCopyright
        allowCollapse
        onLinkClick={(link) => console.log('Link clicked:', link)}
        onSocialClick={(social) => console.log('Social clicked:', social)}
      />

      {/* Fixed footer */}
      <GlassFooterFixed
        title="MebelPlace"
        sections={sampleSections.slice(0, 2)}
        social={sampleSocial.slice(0, 3)}
        showHeader
        showTitle
        showSections
        showSocial
        showCopyright
        allowCollapse
        onLinkClick={(link) => console.log('Link clicked:', link)}
        onSocialClick={(social) => console.log('Social clicked:', social)}
      />
    </div>
  );
};
