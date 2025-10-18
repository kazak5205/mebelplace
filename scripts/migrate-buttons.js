#!/usr/bin/env node

/**
 * Скрипт для миграции Button компонентов на UnifiedButton
 * Обновляет все импорты и использование кнопок
 */

const fs = require('fs');
const path = require('path');

// Паттерны для поиска файлов
const FILE_PATTERNS = [
  'apps/frontend-nextjs/src/**/*.{ts,tsx}',
  'apps/frontend-nextjs/src/**/*.{js,jsx}',
];

// Маппинг старых импортов на новые
const IMPORT_MAPPINGS = {
  // Старые импорты -> новые импорты
  "import { Button } from '@/components/ui/Button'": "import { Button } from '@/components/ui'",
  "import { Button } from '@/components/ui'": "import { Button } from '@/components/ui'", // уже правильный
  "import { GlassButton } from '@/components/ui/GlassButton'": "import { GlassButton } from '@/components/ui'",
  "import { PremiumButton } from '@/components/ui/PremiumButton'": "import { PremiumButton } from '@/components/ui'",
  "import { A11yButton } from '@/components/ui/A11yButton'": "import { A11yButton } from '@/components/ui'",
  "import { IconButton } from '@/components/ui/IconButton'": "import { IconButton } from '@/components/ui'",
  
  // Относительные импорты
  "from './Button'": "from '@/components/ui'",
  "from './GlassButton'": "from '@/components/ui'",
  "from './PremiumButton'": "from '@/components/ui'",
  "from './A11yButton'": "from '@/components/ui'",
  "from './IconButton'": "from '@/components/ui'",
  
  // Импорты типов
  "import type { ButtonProps } from '@/components/ui/Button'": "import type { ButtonProps } from '@/components/ui'",
  "import type { ButtonProps } from '@/components/ui'": "import type { ButtonProps } from '@/components/ui'", // уже правильный
};

// Компоненты для замены
const COMPONENT_MAPPINGS = {
  // Старые компоненты -> новые (если нужно изменить логику)
  '<Button ': '<Button ',
  '<GlassButton ': '<GlassButton ',
  '<PremiumButton ': '<PremiumButton ',
  '<A11yButton ': '<A11yButton ',
  '<IconButton ': '<IconButton ',
};

// Функция для обновления файла
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Обновляем импорты
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        hasChanges = true;
        console.log(`  ✅ Updated import: ${oldImport} -> ${newImport}`);
      }
    }
    
    // Обновляем компоненты (если нужно)
    for (const [oldComponent, newComponent] of Object.entries(COMPONENT_MAPPINGS)) {
      if (content.includes(oldComponent)) {
        content = content.replace(new RegExp(oldComponent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newComponent);
        hasChanges = true;
        console.log(`  ✅ Updated component: ${oldComponent} -> ${newComponent}`);
      }
    }
    
    // Записываем обновленный файл
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Игнорируем ошибки доступа
  }
  
  return files;
}

// Основная функция
function main() {
  console.log('🔄 Migrating Button components to UnifiedButton...');
  
  const frontendDir = path.join(process.cwd(), 'apps/frontend-nextjs/src');
  const files = findFiles(frontendDir);
  console.log(`📁 Found ${files.length} files to check`);
  
  let updatedFiles = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    // Пропускаем сам UnifiedButton файл
    if (file.includes('UnifiedButton')) {
      continue;
    }
    
    console.log(`\n📄 Checking: ${file}`);
    
    if (updateFile(file)) {
      updatedFiles++;
      totalChanges++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  📁 Files checked: ${files.length}`);
  console.log(`  ✅ Files updated: ${updatedFiles}`);
  console.log(`  🔄 Total changes: ${totalChanges}`);
  
  if (updatedFiles > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run tests to ensure everything works');
    console.log('  2. Remove old Button component files if no longer needed');
    console.log('  3. Update documentation');
  } else {
    console.log('\n✅ No files needed updates - all imports are already correct!');
  }
}

// Запускаем миграцию
if (require.main === module) {
  main();
}

module.exports = { updateFile, findFiles };
