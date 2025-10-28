#!/usr/bin/env python3
"""
Скрипт для удаления альфа-канала из PNG изображений (для iOS App Store иконок)
"""
from PIL import Image
import os
import sys

def remove_alpha_channel(image_path, background_color=(255, 255, 255)):
    """Удаляет альфа-канал из PNG изображения, заменяя прозрачность на фон"""
    print(f"Processing: {image_path}")
    
    # Открываем изображение
    img = Image.open(image_path)
    
    # Если нет альфа-канала, ничего не делаем
    if img.mode != 'RGBA':
        print(f"  ✓ No alpha channel, skipping")
        return
    
    # Создаем новое изображение с белым фоном
    rgb_img = Image.new('RGB', img.size, background_color)
    
    # Накладываем изображение с учетом альфа-канала
    rgb_img.paste(img, mask=img.split()[3])  # 3 - это альфа-канал
    
    # Сохраняем
    rgb_img.save(image_path, 'PNG')
    print(f"  ✓ Alpha channel removed")

def main():
    # Путь к папке с иконками
    icon_dir = 'ios/Runner/Assets.xcassets/AppIcon.appiconset'
    
    if not os.path.exists(icon_dir):
        print(f"Error: Directory {icon_dir} not found")
        sys.exit(1)
    
    # Обрабатываем все PNG файлы
    for filename in os.listdir(icon_dir):
        if filename.endswith('.png'):
            filepath = os.path.join(icon_dir, filename)
            try:
                remove_alpha_channel(filepath)
            except Exception as e:
                print(f"  ✗ Error: {e}")
    
    print("\n✓ All icons processed successfully!")

if __name__ == '__main__':
    main()

