'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share2, 
  Heart, 
  Eye,
  Grid3X3,
  List,
  Maximize,
  Minimize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  MoreHorizontal
} from 'lucide-react';

export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  type?: 'image' | 'video';
  duration?: number;
  isLiked?: boolean;
  likesCount?: number;
  viewsCount?: number;
  tags?: string[];
  metadata?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
    dateTaken?: string;
    location?: string;
  };
}

export interface GlassImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  variant?: 'default' | 'grid' | 'masonry' | 'carousel' | 'lightbox';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  columns?: number;
  showThumbnails?: boolean;
  showControls?: boolean;
  showLightbox?: boolean;
  showZoom?: boolean;
  showFullscreen?: boolean;
  showDownload?: boolean;
  showShare?: boolean;
  showLike?: boolean;
  showViews?: boolean;
  showMetadata?: boolean;
  showTags?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
  onImageLike?: (imageId: string, isLiked: boolean) => void;
  onImageShare?: (image: GalleryImage) => void;
  onImageDownload?: (image: GalleryImage) => void;
  onImageView?: (imageId: string) => void;
  onLightboxOpen?: (index: number) => void;
  onLightboxClose?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    imageSize: 'w-32 h-32',
    thumbnailSize: 'w-16 h-16',
    spacing: 'gap-2',
    padding: 'p-2'
  },
  md: {
    imageSize: 'w-48 h-48',
    thumbnailSize: 'w-20 h-20',
    spacing: 'gap-3',
    padding: 'p-3'
  },
  lg: {
    imageSize: 'w-64 h-64',
    thumbnailSize: 'w-24 h-24',
    spacing: 'gap-4',
    padding: 'p-4'
  },
  xl: {
    imageSize: 'w-80 h-80',
    thumbnailSize: 'w-28 h-28',
    spacing: 'gap-6',
    padding: 'p-6'
  }
};

// Animation variants
const imageVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const lightboxVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const zoomVariants = {
  initial: { scale: 1 },
  zoomed: { 
    scale: 2,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassImageGallery: React.FC<GlassImageGalleryProps> = ({
  images,
  initialIndex = 0,
  variant = 'default',
  size = 'md',
  columns = 3,
  showThumbnails = true,
  showControls = true,
  showLightbox = true,
  showZoom = true,
  showFullscreen = true,
  showDownload = true,
  showShare = true,
  showLike = true,
  showViews = true,
  showMetadata = false,
  showTags = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  className,
  onImageClick,
  onImageLike,
  onImageShare,
  onImageDownload,
  onImageView,
  onLightboxOpen,
  onLightboxClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showImageInfo, setShowImageInfo] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const config = sizeConfig[size];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && isLightboxOpen) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, isLightboxOpen, images.length, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case 'Escape':
          handleCloseLightbox();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'f':
        case 'F':
          handleFullscreen();
          break;
        case '+':
        case '=':
          handleZoom();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, isPlaying]);

  const handleImageClick = (image: GalleryImage, index: number) => {
    setCurrentIndex(index);
    if (showLightbox) {
      setIsLightboxOpen(true);
      onLightboxOpen?.(index);
    }
    onImageClick?.(image, index);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setIsFullscreen(false);
    setDragOffset({ x: 0, y: 0 });
    onLightboxClose?.();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleZoomOut = () => {
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLike = (imageId: string, isLiked: boolean) => {
    onImageLike?.(imageId, isLiked);
  };

  const handleShare = (image: GalleryImage) => {
    onImageShare?.(image);
  };

  const handleDownload = (image: GalleryImage) => {
    onImageDownload?.(image);
  };

  const handleDragStart = (event: React.MouseEvent) => {
    if (!isZoomed) return;
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleDragMove = (event: React.MouseEvent) => {
    if (!isZoomed) return;
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    setDragStart({ x: 0, y: 0 });
  };

  const renderImage = (image: GalleryImage, index: number) => {
    const isVideo = image.type === 'video';

    return (
      <motion.div
        key={image.id}
        className={cn(
          'relative group cursor-pointer overflow-hidden rounded-xl',
          'bg-glass-primary/30 backdrop-blur-sm',
          'border border-glass-border/50',
          'shadow-glass-sm',
          config.imageSize
        )}
        variants={imageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        onClick={() => handleImageClick(image, index)}
      >
        {/* Image/Video */}
        {isVideo ? (
          <video
            className="w-full h-full object-cover"
            poster={image.thumbnail || image.src}
            muted
            loop
          >
            <source src={image.src} type="video/mp4" />
          </video>
        ) : (
          <img
            src={image.src}
            alt={image.alt || image.title || `Image ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Video indicator */}
        {isVideo && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
            <Play className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          {image.title && (
            <h3 className="text-sm font-medium text-white truncate mb-1">
              {image.title}
            </h3>
          )}
          {image.description && (
            <p className="text-xs text-white/80 line-clamp-2">
              {image.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              {showLike && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(image.id, !image.isLiked);
                  }}
                  className={cn(
                    'flex items-center space-x-1 text-xs',
                    image.isLiked ? 'text-red-400' : 'text-white/60'
                  )}
                >
                  <Heart className={cn('w-3 h-3', image.isLiked && 'fill-current')} />
                  <span>{image.likesCount || 0}</span>
                </button>
              )}
              
              {showViews && (
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <Eye className="w-3 h-3" />
                  <span>{image.viewsCount || 0}</span>
                </div>
              )}
            </div>
            
            {image.duration && (
              <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                {Math.floor(image.duration / 60)}:{(image.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {showDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(image);
              }}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-colors duration-200"
            >
              <Download className="w-3 h-3 text-white" />
            </button>
          )}
          
          {showShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(image);
              }}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-colors duration-200"
            >
              <Share2 className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGrid = () => {
    const gridCols = variant === 'masonry' ? 'columns-2 md:columns-3 lg:columns-4' : `grid-cols-${columns}`;
    
    return (
      <div className={cn(
        'grid',
        variant === 'masonry' ? gridCols : `grid-cols-${columns}`,
        config.spacing
      )}>
        {images.map((image, index) => renderImage(image, index))}
      </div>
    );
  };

  const renderCarousel = () => {
    return (
      <div className="relative">
        <div className="overflow-hidden rounded-2xl">
          <motion.div
            className="flex"
            animate={{ x: -currentIndex * 100 + '%' }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {images.map((image, index) => (
              <div key={image.id} className="w-full flex-shrink-0">
                {renderImage(image, index)}
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Carousel controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
        
        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-200',
                  index === currentIndex ? 'bg-orange-500' : 'bg-white/30'
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLightbox = () => {
    if (!isLightboxOpen || !images[currentIndex]) return null;

    const currentImage = images[currentIndex];

    return (
      <AnimatePresence>
        <motion.div
          ref={lightboxRef}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/90 backdrop-blur-sm',
            isFullscreen && 'bg-black'
          )}
          variants={lightboxVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleCloseLightbox}
        >
          {/* Close button */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200 z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image container */}
          <div className="relative max-w-7xl max-h-full mx-4">
            <motion.div
              className="relative"
              variants={zoomVariants}
              animate={isZoomed ? 'zoomed' : 'initial'}
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {currentImage.type === 'video' ? (
                <video
                  ref={imageRef as any}
                  className="max-w-full max-h-full object-contain"
                  src={currentImage.src}
                  controls
                  autoPlay
                />
              ) : (
                <img
                  ref={imageRef}
                  src={currentImage.src}
                  alt={currentImage.alt || currentImage.title || `Image ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </motion.div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 p-3 bg-black/50 rounded-full">
              {showZoom && (
                <button
                  onClick={handleZoom}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  {isZoomed ? (
                    <ZoomOut className="w-5 h-5 text-white" />
                  ) : (
                    <ZoomIn className="w-5 h-5 text-white" />
                  )}
                </button>
              )}

              {showFullscreen && (
                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              )}

              {showDownload && (
                <button
                  onClick={() => handleDownload(currentImage)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              )}

              {showShare && (
                <button
                  onClick={() => handleShare(currentImage)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              )}

              {showLike && (
                <button
                  onClick={() => handleLike(currentImage.id, !currentImage.isLiked)}
                  className={cn(
                    'p-2 hover:bg-white/10 rounded-lg transition-colors duration-200',
                    currentImage.isLiked ? 'text-red-400' : 'text-white'
                  )}
                >
                  <Heart className={cn('w-5 h-5', currentImage.isLiked && 'fill-current')} />
                </button>
              )}

              {images.length > 1 && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
            </div>

            {/* Image info */}
            {showImageInfo && (
              <div className="absolute top-4 left-4 max-w-md p-4 bg-black/50 rounded-xl">
                {currentImage.title && (
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {currentImage.title}
                  </h3>
                )}
                {currentImage.description && (
                  <p className="text-sm text-white/80 mb-3">
                    {currentImage.description}
                  </p>
                )}
                
                {showMetadata && currentImage.metadata && (
                  <div className="space-y-1 text-xs text-white/60">
                    {currentImage.metadata.camera && (
                      <p>Камера: {currentImage.metadata.camera}</p>
                    )}
                    {currentImage.metadata.lens && (
                      <p>Объектив: {currentImage.metadata.lens}</p>
                    )}
                    {currentImage.metadata.aperture && (
                      <p>Диафрагма: {currentImage.metadata.aperture}</p>
                    )}
                    {currentImage.metadata.shutterSpeed && (
                      <p>Выдержка: {currentImage.metadata.shutterSpeed}</p>
                    )}
                    {currentImage.metadata.iso && (
                      <p>ISO: {currentImage.metadata.iso}</p>
                    )}
                  </div>
                )}
                
                {showTags && currentImage.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {currentImage.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderThumbnails = () => {
    if (!showThumbnails || images.length <= 1) return null;

    return (
      <div className="flex space-x-2 overflow-x-auto py-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors duration-200',
              index === currentIndex 
                ? 'border-orange-500' 
                : 'border-transparent hover:border-white/30',
              config.thumbnailSize
            )}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'grid':
        return 'grid';
      case 'masonry':
        return 'columns';
      case 'carousel':
        return 'carousel';
      case 'lightbox':
        return 'lightbox';
      default:
        return 'grid';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main gallery */}
      <div className={cn(
        'bg-glass-primary/50 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        config.padding
      )}>
        {variant === 'carousel' ? renderCarousel() : renderGrid()}
        
        {/* Thumbnails */}
        {renderThumbnails()}
      </div>

      {/* Lightbox */}
      {renderLightbox()}
    </div>
  );
};

// Convenience components
export const GlassImageGalleryGrid: React.FC<Omit<GlassImageGalleryProps, 'variant'>> = (props) => (
  <GlassImageGallery {...props} variant="grid" />
);

export const GlassImageGalleryMasonry: React.FC<Omit<GlassImageGalleryProps, 'variant'>> = (props) => (
  <GlassImageGallery {...props} variant="masonry" />
);

export const GlassImageGalleryCarousel: React.FC<Omit<GlassImageGalleryProps, 'variant'>> = (props) => (
  <GlassImageGallery {...props} variant="carousel" />
);

export const GlassImageGalleryLightbox: React.FC<Omit<GlassImageGalleryProps, 'variant'>> = (props) => (
  <GlassImageGallery {...props} variant="lightbox" />
);

// Example usage component
export const GlassImageGalleryExample: React.FC = () => {
  const sampleImages: GalleryImage[] = [
    {
      id: '1',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Современная кухня',
      title: 'Кухня в современном стиле',
      description: 'Изготовление кухни с барной стойкой и островом',
      width: 800,
      height: 600,
      isLiked: false,
      likesCount: 24,
      viewsCount: 156,
      tags: ['кухня', 'современный стиль', 'барная стойка'],
      metadata: {
        camera: 'Canon EOS R5',
        lens: '24-70mm f/2.8',
        aperture: 'f/4',
        shutterSpeed: '1/60s',
        iso: '400',
        focalLength: '35mm',
        dateTaken: '2024-01-15',
        location: 'Алматы, Казахстан'
      }
    },
    {
      id: '2',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Спальня',
      title: 'Спальня в классическом стиле',
      description: 'Дизайн спальни с деревянной мебелью',
      width: 800,
      height: 600,
      isLiked: true,
      likesCount: 18,
      viewsCount: 89,
      tags: ['спальня', 'классический стиль', 'дерево']
    },
    {
      id: '3',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Гостиная',
      title: 'Гостиная с камином',
      description: 'Уютная гостиная с современным камином',
      width: 800,
      height: 600,
      isLiked: false,
      likesCount: 32,
      viewsCount: 234,
      tags: ['гостиная', 'камин', 'уют']
    },
    {
      id: '4',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Офис',
      title: 'Рабочий кабинет',
      description: 'Современный офис с эргономичной мебелью',
      width: 800,
      height: 600,
      isLiked: false,
      likesCount: 15,
      viewsCount: 67,
      tags: ['офис', 'эргономика', 'рабочее место']
    },
    {
      id: '5',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Ванная комната',
      title: 'Ванная в стиле минимализм',
      description: 'Современная ванная комната с душевой кабиной',
      width: 800,
      height: 600,
      isLiked: true,
      likesCount: 28,
      viewsCount: 145,
      tags: ['ванная', 'минимализм', 'душевая кабина']
    },
    {
      id: '6',
      src: '/api/placeholder/800/600',
      thumbnail: '/api/placeholder/200/150',
      alt: 'Прихожая',
      title: 'Прихожая с шкафом-купе',
      description: 'Практичная прихожая с встроенным шкафом',
      width: 800,
      height: 600,
      isLiked: false,
      likesCount: 12,
      viewsCount: 78,
      tags: ['прихожая', 'шкаф-купе', 'встроенная мебель']
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Grid gallery */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Сетка изображений</h3>
        <GlassImageGalleryGrid
          images={sampleImages}
          columns={3}
          size="md"
          showThumbnails
          showControls
          showLightbox
          showZoom
          showFullscreen
          showDownload
          showShare
          showLike
          showViews
          showMetadata
          showTags
          onImageClick={(image, index) => console.log('Image clicked:', image.title, index)}
          onImageLike={(imageId, isLiked) => console.log('Image liked:', imageId, isLiked)}
          onImageShare={(image) => console.log('Image shared:', image.title)}
          onImageDownload={(image) => console.log('Image downloaded:', image.title)}
        />
      </div>

      {/* Carousel gallery */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Карусель изображений</h3>
        <div className="max-w-2xl">
          <GlassImageGalleryCarousel
            images={sampleImages}
            size="lg"
            showControls
            showLightbox
            autoPlay
            autoPlayInterval={4000}
            onImageClick={(image, index) => console.log('Carousel image clicked:', image.title, index)}
          />
        </div>
      </div>

      {/* Masonry gallery */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Masonry галерея</h3>
        <GlassImageGalleryMasonry
          images={sampleImages}
          size="md"
          showThumbnails
          showLightbox
          showLike
          showViews
          onImageClick={(image, index) => console.log('Masonry image clicked:', image.title, index)}
        />
      </div>
    </div>
  );
};

