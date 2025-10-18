/**
 * Bundle Size Analysis Script
 * Analyzes bundle size of UI components
 */

const fs = require('fs')
const path = require('path')

const componentsDir = path.join(__dirname, '../src/components/ui')

console.log('📦 Bundle Size Analysis\n')

const components = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.stories.'))

let totalSize = 0

components.forEach(component => {
  const filePath = path.join(componentsDir, component)
  const stats = fs.statSync(filePath)
  const sizeKB = (stats.size / 1024).toFixed(2)
  totalSize += stats.size
  
  console.log(`  ${component.padEnd(25)} ${sizeKB.padStart(8)} KB`)
})

console.log('\n' + '─'.repeat(40))
console.log(`  TOTAL${' '.repeat(19)} ${(totalSize / 1024).toFixed(2).padStart(8)} KB`)

// Check if any component is too large
const MAX_SIZE_KB = 50
let violations = 0

console.log('\n🚨 Size Violations (>50KB):\n')

components.forEach(component => {
  const filePath = path.join(componentsDir, component)
  const stats = fs.statSync(filePath)
  const sizeKB = stats.size / 1024
  
  if (sizeKB > MAX_SIZE_KB) {
    console.log(`  ❌ ${component}: ${sizeKB.toFixed(2)} KB`)
    violations++
  }
})

if (violations === 0) {
  console.log('  ✅ No violations! All components <50KB')
}

console.log('\n✅ Analysis complete!')

