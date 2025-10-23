# 🎨 MebelPlace UI Components Library

Единая библиотека UI компонентов для web и mobile приложений MebelPlace.

## 📦 Установка

```typescript
import { Button, Card, Modal, Loading } from '@shared/components';
```

## 🧩 Компоненты

### Button
Универсальная кнопка с различными вариантами стилей.

```tsx
import { Button } from '@shared/components';

<Button variant="primary" size="md" onClick={() => console.log('Clicked!')}>
  Нажми меня
</Button>

// С иконкой и загрузкой
<Button 
  variant="primary" 
  loading={isLoading}
  icon={<IconComponent />}
  iconPosition="left"
>
  Загрузка...
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

---

### Card
Контейнер с различными вариантами стилей и эффектов.

```tsx
import { Card } from '@shared/components';

<Card variant="glass" padding="md" hover onClick={() => {}}>
  <h3>Заголовок карточки</h3>
  <p>Содержимое карточки</p>
</Card>

// Стеклянная карточка с полной шириной
<Card variant="glass" padding="lg" fullWidth>
  Контент
</Card>
```

**Props:**
- `variant`: `'default' | 'glass' | 'elevated'`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `onClick`: () => void
- `hover`: boolean - эффект при наведении
- `fullWidth`: boolean

---

### Modal
Модальное окно с backdrop и управлением фокусом.

```tsx
import { Modal } from '@shared/components';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Заголовок модального окна"
  size="md"
  closeOnBackdrop
  closeOnEscape
>
  <p>Содержимое модального окна</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (опционально)
- `size`: `'sm' | 'md' | 'lg' | 'full'`
- `closeOnBackdrop`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Features:**
- Блокировка прокрутки body
- Закрытие по ESC
- Закрытие по клику на backdrop
- Анимации появления/исчезновения

---

### Loading
Индикаторы загрузки различных типов.

```tsx
import { Loading } from '@shared/components';

// Spinner
<Loading variant="spinner" size="md" text="Загрузка..." />

// Dots
<Loading variant="dots" size="lg" />

// Pulse
<Loading variant="pulse" size="sm" />

// Fullscreen загрузка
<Loading variant="spinner" size="lg" fullScreen text="Пожалуйста, подождите..." />
```

**Props:**
- `variant`: `'spinner' | 'dots' | 'pulse'`
- `size`: `'sm' | 'md' | 'lg'`
- `text`: string (опционально)
- `fullScreen`: boolean

---

### Skeleton
Skeleton loader для состояний загрузки.

```tsx
import { Skeleton } from '@shared/components';

// Текстовый skeleton
<Skeleton variant="text" width="100%" />

// Круглый skeleton (для аватаров)
<Skeleton variant="circular" width={40} height={40} />

// Прямоугольный skeleton
<Skeleton variant="rectangular" width={200} height={100} />

// Множественные skeleton
<Skeleton variant="text" count={3} animation="wave" />
```

**Props:**
- `variant`: `'text' | 'circular' | 'rectangular'`
- `animation`: `'pulse' | 'wave'`
- `width`: string | number
- `height`: string | number
- `count`: number - количество элементов

---

### Badge
Бейдж для отображения счетчиков и статусов.

```tsx
import { Badge } from '@shared/components';

// С числом
<Badge count={5} variant="primary" />

// С максимальным значением
<Badge count={150} max={99} variant="error" />

// Dot indicator
<Badge count={1} dot variant="success" />

// С child элементом (позиционированный бейдж)
<Badge count={10} variant="primary" position="top-right">
  <IconBell />
</Badge>

// Inline бейдж
<Badge count={3} variant="error" inline />
```

**Props:**
- `count`: number
- `max`: number (default: 99)
- `variant`: `'primary' | 'secondary' | 'error' | 'success' | 'warning'`
- `dot`: boolean - показывать только точку
- `size`: `'sm' | 'md' | 'lg'`
- `position`: `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`
- `inline`: boolean

---

### Avatar
Аватар пользователя с fallback на инициалы.

```tsx
import { Avatar } from '@shared/components';

// С изображением
<Avatar src="/avatar.jpg" name="Иван Иванов" size="md" />

// С инициалами (автоматически)
<Avatar name="Мария Петрова" size="lg" />

// С онлайн статусом
<Avatar name="Петр Сидоров" size="md" online />

// Различные формы
<Avatar name="User" size="xl" shape="circle" />
<Avatar name="User" size="md" shape="rounded" />
<Avatar name="User" size="sm" shape="square" />

// Кликабельный аватар
<Avatar name="User" size="md" onClick={() => {}} />
```

**Props:**
- `src`: string - URL изображения
- `name`: string - имя (для инициалов)
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`
- `fallback`: string - кастомный текст вместо инициалов
- `online`: boolean - показать онлайн индикатор
- `shape`: `'circle' | 'rounded' | 'square'`
- `onClick`: () => void

**Features:**
- Автоматическая генерация инициалов
- Цвет background на основе имени
- Обработка ошибок загрузки изображения
- Онлайн/офлайн индикатор

---

### Divider
Разделитель горизонтальный и вертикальный.

```tsx
import { Divider } from '@shared/components';

// Горизонтальный
<Divider />

// С текстом
<Divider text="или" textAlign="center" />
<Divider text="Дополнительно" textAlign="left" />

// Вертикальный
<div className="flex">
  <span>Left</span>
  <Divider orientation="vertical" spacing="md" />
  <span>Right</span>
</div>

// Различные стили
<Divider variant="dashed" />
<Divider variant="dotted" />
```

**Props:**
- `orientation`: `'horizontal' | 'vertical'`
- `variant`: `'solid' | 'dashed' | 'dotted'`
- `text`: string (только для horizontal)
- `textAlign`: `'left' | 'center' | 'right'`
- `spacing`: `'none' | 'sm' | 'md' | 'lg'`

---

### EmptyState
Пустое состояние с иконкой и action.

```tsx
import { EmptyState } from '@shared/components';

// Базовое использование
<EmptyState
  title="Нет заказов"
  description="Вы еще не создали ни одного заказа"
/>

// С action кнопкой
<EmptyState
  title="Корзина пуста"
  description="Добавьте товары в корзину"
  action={{
    label: "Начать покупки",
    onClick: () => navigate('/catalog'),
    variant: 'primary'
  }}
/>

// С кастомной иконкой
<EmptyState
  title="Нет результатов"
  description="Попробуйте изменить параметры поиска"
  icon={<SearchIcon />}
  size="lg"
/>
```

**Props:**
- `title`: string
- `description`: string (опционально)
- `icon`: React.ReactNode (опционально)
- `action`: object (опционально)
  - `label`: string
  - `onClick`: () => void
  - `variant`: 'primary' | 'secondary' | 'outline'
- `size`: `'sm' | 'md' | 'lg'`

---

### Input
Поле ввода (уже существующий компонент).

```tsx
import { Input } from '@shared/components';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  helperText="Мы никогда не передадим ваш email третьим лицам"
/>

// С иконками
<Input
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
  placeholder="Поиск..."
/>
```

---

## 🎨 Design Tokens

Все компоненты используют единую систему design tokens:

```typescript
import { designTokens } from '@shared/design-system/tokens';

const { colors, spacing, borderRadius, shadows } = designTokens;
```

### Основные цвета
- **Primary Orange:** `#f97316` - основной цвет бренда
- **Success:** `#22c55e`
- **Error:** `#ef4444`
- **Warning:** `#f59e0b`

### Dark Mode
Все компоненты полностью поддерживают темную тему.

---

## 📱 Responsive Design

Все компоненты адаптивны и корректно работают на:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

---

## ♿ Доступность

Компоненты следуют принципам a11y:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

---

## 🔧 Кастомизация

### Через className
```tsx
<Button className="custom-class">
  Custom Button
</Button>
```

### Через стили
```tsx
<Card style={{ backgroundColor: 'custom-color' }}>
  Custom Card
</Card>
```

---

## 🏗️ Структура проекта

```
shared/
├── components/
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Divider.tsx
│   ├── EmptyState.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   ├── index.ts
│   └── README.md (этот файл)
└── design-system/
    └── tokens.ts
```

---

## 💡 Best Practices

1. **Используйте TypeScript** - все компоненты полностью типизированы
2. **Следуйте design tokens** - не используйте хардкод цветов
3. **Проверяйте accessibility** - используйте ARIA и semantic HTML
4. **Тестируйте на всех экранах** - убедитесь что UI responsive
5. **Dark mode** - всегда проверяйте в обеих темах

---

## 🐛 Troubleshooting

### Компоненты не стилизуются
Убедитесь что Tailwind CSS правильно настроен и включает путь к `shared/components`

### Анимации не работают
Проверьте что CSS animations загружены (Modal, Skeleton)

### TypeScript ошибки
Убедитесь что `tsconfig.json` правильно настроен с path aliases

---

## 📝 Changelog

### v1.0.0 (2025-10-20)
- ✨ Добавлены все базовые компоненты
- 🎨 Полная поддержка design tokens
- 🌙 Dark mode support
- 📱 Full responsive design
- ♿ Accessibility improvements

---

## 👥 Контрибьюторы

MebelPlace Development Team

---

## 📄 License

Proprietary - MebelPlace © 2025

