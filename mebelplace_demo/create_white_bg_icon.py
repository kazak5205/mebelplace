#!/usr/bin/env python3
"""
Создает версию логотипа с белым фоном для iOS App Store
"""
from PIL import Image

# Открываем исходный логотип
logo = Image.open('логотип.png')

# Создаем новое изображение с белым фоном того же размера
white_bg = Image.new('RGB', logo.size, (255, 255, 255))

# Если у логотипа есть альфа-канал, накладываем его на белый фон
if logo.mode == 'RGBA':
    white_bg.paste(logo, (0, 0), logo)
else:
    white_bg.paste(logo, (0, 0))

# Сохраняем новую версию
white_bg.save('логотип_белый_фон.png', 'PNG')
print("✓ Created логотип_белый_фон.png with white background")

