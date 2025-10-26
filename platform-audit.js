const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 🔍 ПОЛНЫЙ АУДИТ ПЛАТФОРМЫ MEBELPLACE
class PlatformAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      systemHealth: {},
      performanceMetrics: {},
      securityAssessment: {},
      scalabilityAnalysis: {},
      recommendations: []
    };
  }

  // Основной метод аудита
  async performFullAudit() {
    console.log('🔍 ПОЛНЫЙ АУДИТ ПЛАТФОРМЫ MEBELPLACE');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    
    await this.checkSystemHealth();
    await this.analyzePerformance();
    await this.assessSecurity();
    await this.analyzeScalability();
    await this.generateRecommendations();
    
    this.printAuditReport();
    return this.auditResults;
  }

  // Проверка здоровья системы
  async checkSystemHealth() {
    console.log('🏥 Проверка здоровья системы...');
    
    try {
      // Проверка контейнеров
      const containersResult = await execAsync('docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"');
      const containers = containersResult.stdout.trim().split('\n').map(line => {
        const parts = line.split('\t');
        return {
          name: parts[0],
          status: parts[1],
          ports: parts[2]
        };
      });
      
      this.auditResults.systemHealth.containers = containers;
      
      // Проверка базы данных
      const dbResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT version();"');
      this.auditResults.systemHealth.database = {
        status: 'healthy',
        version: dbResult.stdout.trim()
      };
      
      // Проверка Redis
      const redisResult = await execAsync('docker exec mebelplace-redis-prod redis-cli ping');
      this.auditResults.systemHealth.redis = {
        status: redisResult.stdout.trim() === 'PONG' ? 'healthy' : 'unhealthy'
      };
      
      // Проверка доступности сайта
      const siteResult = await execAsync('curl -s -o /dev/null -w "%{http_code}" https://mebelplace.com.kz');
      this.auditResults.systemHealth.website = {
        status: siteResult.stdout.trim() === '200' ? 'accessible' : 'inaccessible',
        httpCode: siteResult.stdout.trim()
      };
      
      console.log('✅ Здоровье системы проверено');
      
    } catch (error) {
      console.log(`❌ Ошибка проверки здоровья системы: ${error.message}`);
      this.auditResults.systemHealth.error = error.message;
    }
  }

  // Анализ производительности
  async analyzePerformance() {
    console.log('⚡ Анализ производительности...');
    
    try {
      // Статистика контейнеров
      const statsResult = await execAsync('docker stats --no-stream --format "{{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"');
      const stats = statsResult.stdout.trim().split('\n').map(line => {
        const parts = line.split('\t');
        return {
          container: parts[0],
          cpuPercent: parseFloat(parts[1]) || 0,
          memoryUsage: parts[2],
          memoryPercent: parseFloat(parts[3]) || 0
        };
      });
      
      this.auditResults.performanceMetrics.containerStats = stats;
      
      // Анализ нагрузки на базу данных
      const dbStatsResult = await execAsync('docker exec mebelplace-postgres-prod psql -U mebelplace -d mebelplace_prod -t -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM orders; SELECT COUNT(*) FROM videos; SELECT COUNT(*) FROM messages; SELECT COUNT(*) FROM support_tickets;"');
      const dbStats = dbStatsResult.stdout.trim().split('\n').map(line => parseInt(line.trim()) || 0);
      
      this.auditResults.performanceMetrics.databaseStats = {
        users: dbStats[0],
        orders: dbStats[1],
        videos: dbStats[2],
        messages: dbStats[3],
        supportTickets: dbStats[4]
      };
      
      // Проверка времени ответа API
      const apiResponseTime = await this.measureApiResponseTime();
      this.auditResults.performanceMetrics.apiResponseTime = apiResponseTime;
      
      console.log('✅ Производительность проанализирована');
      
    } catch (error) {
      console.log(`❌ Ошибка анализа производительности: ${error.message}`);
      this.auditResults.performanceMetrics.error = error.message;
    }
  }

  // Измерение времени ответа API
  async measureApiResponseTime() {
    try {
      const startTime = Date.now();
      await execAsync('curl -s -o /dev/null https://mebelplace.com.kz/api/health');
      const responseTime = Date.now() - startTime;
      
      return {
        healthEndpoint: responseTime,
        status: responseTime < 1000 ? 'excellent' : responseTime < 3000 ? 'good' : 'slow'
      };
    } catch (error) {
      return {
        healthEndpoint: -1,
        status: 'error',
        error: error.message
      };
    }
  }

  // Оценка безопасности
  async assessSecurity() {
    console.log('🔒 Оценка безопасности...');
    
    try {
      // Проверка SSL сертификата
      const sslResult = await execAsync('curl -s -I https://mebelplace.com.kz | grep -i "strict-transport-security"');
      this.auditResults.securityAssessment.ssl = {
        hstsEnabled: sslResult.stdout.includes('strict-transport-security'),
        status: sslResult.stdout.includes('strict-transport-security') ? 'secure' : 'needs_improvement'
      };
      
      // Проверка конфигурации nginx
      const nginxConfigResult = await execAsync('docker exec mebelplace-nginx-prod cat /etc/nginx/nginx.conf | grep -E "(rate_limit|limit_req)"');
      this.auditResults.securityAssessment.rateLimiting = {
        enabled: nginxConfigResult.stdout.includes('limit_req'),
        status: nginxConfigResult.stdout.includes('limit_req') ? 'configured' : 'not_configured'
      };
      
      // Проверка переменных окружения
      const envResult = await execAsync('docker exec mebelplace-backend-prod env | grep -E "(PASSWORD|SECRET|KEY)" | wc -l');
      this.auditResults.securityAssessment.environmentVariables = {
        sensitiveVariablesCount: parseInt(envResult.stdout.trim()) || 0,
        status: parseInt(envResult.stdout.trim()) > 0 ? 'configured' : 'needs_review'
      };
      
      console.log('✅ Безопасность оценена');
      
    } catch (error) {
      console.log(`❌ Ошибка оценки безопасности: ${error.message}`);
      this.auditResults.securityAssessment.error = error.message;
    }
  }

  // Анализ масштабируемости
  async analyzeScalability() {
    console.log('📈 Анализ масштабируемости...');
    
    try {
      // Анализ ресурсов системы
      const systemResources = await this.getSystemResources();
      this.auditResults.scalabilityAnalysis.systemResources = systemResources;
      
      // Анализ архитектуры
      this.auditResults.scalabilityAnalysis.architecture = {
        database: 'PostgreSQL (scalable)',
        cache: 'Redis (scalable)',
        backend: 'Node.js (horizontal scaling possible)',
        frontend: 'Static files (CDN ready)',
        loadBalancer: 'Nginx (scalable)',
        containerization: 'Docker (orchestration ready)'
      };
      
      // Анализ нагрузки
      const loadAnalysis = await this.analyzeLoadCapacity();
      this.auditResults.scalabilityAnalysis.loadCapacity = loadAnalysis;
      
      console.log('✅ Масштабируемость проанализирована');
      
    } catch (error) {
      console.log(`❌ Ошибка анализа масштабируемости: ${error.message}`);
      this.auditResults.scalabilityAnalysis.error = error.message;
    }
  }

  // Получение ресурсов системы
  async getSystemResources() {
    try {
      const memoryResult = await execAsync('free -h');
      const diskResult = await execAsync('df -h /');
      const cpuResult = await execAsync('nproc');
      
      return {
        memory: memoryResult.stdout.trim(),
        disk: diskResult.stdout.trim(),
        cpuCores: parseInt(cpuResult.stdout.trim()) || 0
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Анализ пропускной способности
  async analyzeLoadCapacity() {
    const dbStats = this.auditResults.performanceMetrics.databaseStats;
    const containerStats = this.auditResults.performanceMetrics.containerStats;
    
    // Анализ на основе текущих метрик
    const analysis = {
      currentLoad: {
        users: dbStats.users,
        orders: dbStats.orders,
        videos: dbStats.videos,
        messages: dbStats.messages
      },
      capacityEstimate: {
        maxConcurrentUsers: this.estimateMaxUsers(containerStats),
        maxOrdersPerMinute: this.estimateMaxOrders(containerStats),
        maxVideosPerHour: this.estimateMaxVideos(containerStats)
      },
      bottlenecks: this.identifyBottlenecks(containerStats),
      recommendations: []
    };
    
    return analysis;
  }

  // Оценка максимального количества пользователей
  estimateMaxUsers(containerStats) {
    const backendStats = containerStats.find(s => s.container.includes('backend'));
    if (!backendStats) return 'unknown';
    
    const cpuUsage = backendStats.cpuPercent;
    const memoryUsage = backendStats.memoryPercent;
    
    if (cpuUsage < 50 && memoryUsage < 50) return '1000+';
    if (cpuUsage < 80 && memoryUsage < 80) return '500-1000';
    return '100-500';
  }

  // Оценка максимального количества заказов
  estimateMaxOrders(containerStats) {
    const dbStats = containerStats.find(s => s.container.includes('postgres'));
    if (!dbStats) return 'unknown';
    
    const cpuUsage = dbStats.cpuPercent;
    const memoryUsage = dbStats.memoryPercent;
    
    if (cpuUsage < 50 && memoryUsage < 50) return '100+';
    if (cpuUsage < 80 && memoryUsage < 80) return '50-100';
    return '10-50';
  }

  // Оценка максимального количества видео
  estimateMaxVideos(containerStats) {
    const backendStats = containerStats.find(s => s.container.includes('backend'));
    if (!backendStats) return 'unknown';
    
    const cpuUsage = backendStats.cpuPercent;
    const memoryUsage = backendStats.memoryPercent;
    
    if (cpuUsage < 50 && memoryUsage < 50) return '50+';
    if (cpuUsage < 80 && memoryUsage < 80) return '20-50';
    return '5-20';
  }

  // Выявление узких мест
  identifyBottlenecks(containerStats) {
    const bottlenecks = [];
    
    containerStats.forEach(stat => {
      if (stat.cpuPercent > 80) {
        bottlenecks.push(`${stat.container}: High CPU usage (${stat.cpuPercent}%)`);
      }
      if (stat.memoryPercent > 80) {
        bottlenecks.push(`${stat.container}: High memory usage (${stat.memoryPercent}%)`);
      }
    });
    
    return bottlenecks;
  }

  // Генерация рекомендаций
  async generateRecommendations() {
    console.log('💡 Генерация рекомендаций...');
    
    const recommendations = [];
    
    // Рекомендации по производительности
    const containerStats = this.auditResults.performanceMetrics.containerStats;
    if (containerStats) {
      containerStats.forEach(stat => {
        if (stat.cpuPercent > 70) {
          recommendations.push({
            category: 'Performance',
            priority: 'High',
            recommendation: `Optimize ${stat.container} - CPU usage is ${stat.cpuPercent}%`,
            action: 'Consider scaling or optimization'
          });
        }
        if (stat.memoryPercent > 70) {
          recommendations.push({
            category: 'Performance',
            priority: 'High',
            recommendation: `Increase memory for ${stat.container} - usage is ${stat.memoryPercent}%`,
            action: 'Increase memory limits'
          });
        }
      });
    }
    
    // Рекомендации по безопасности
    if (!this.auditResults.securityAssessment.ssl?.hstsEnabled) {
      recommendations.push({
        category: 'Security',
        priority: 'Medium',
        recommendation: 'Enable HSTS headers for better security',
        action: 'Add Strict-Transport-Security header'
      });
    }
    
    // Рекомендации по масштабируемости
    const dbStats = this.auditResults.performanceMetrics.databaseStats;
    if (dbStats.users > 1000) {
      recommendations.push({
        category: 'Scalability',
        priority: 'Medium',
        recommendation: 'Consider database sharding for large user base',
        action: 'Implement horizontal database scaling'
      });
    }
    
    // Рекомендации по мониторингу
    recommendations.push({
      category: 'Monitoring',
      priority: 'Low',
      recommendation: 'Implement comprehensive monitoring and alerting',
      action: 'Set up Prometheus + Grafana monitoring'
    });
    
    this.auditResults.recommendations = recommendations;
    console.log('✅ Рекомендации сгенерированы');
  }

  // Печать отчета аудита
  printAuditReport() {
    console.log('📊 ОТЧЕТ ПОЛНОГО АУДИТА ПЛАТФОРМЫ MEBELPLACE');
    console.log('════════════════════════════════════════════════════════════════════════════════');
    
    // Здоровье системы
    console.log('🏥 ЗДОРОВЬЕ СИСТЕМЫ:');
    console.log(`   Контейнеры: ${this.auditResults.systemHealth.containers?.length || 0} запущено`);
    console.log(`   База данных: ${this.auditResults.systemHealth.database?.status || 'unknown'}`);
    console.log(`   Redis: ${this.auditResults.systemHealth.redis?.status || 'unknown'}`);
    console.log(`   Сайт: ${this.auditResults.systemHealth.website?.status || 'unknown'}`);
    
    // Производительность
    console.log('\n⚡ ПРОИЗВОДИТЕЛЬНОСТЬ:');
    const dbStats = this.auditResults.performanceMetrics.databaseStats;
    if (dbStats) {
      console.log(`   Пользователи: ${dbStats.users}`);
      console.log(`   Заказы: ${dbStats.orders}`);
      console.log(`   Видео: ${dbStats.videos}`);
      console.log(`   Сообщения: ${dbStats.messages}`);
      console.log(`   Тикеты поддержки: ${dbStats.supportTickets}`);
    }
    
    const apiTime = this.auditResults.performanceMetrics.apiResponseTime;
    if (apiTime) {
      console.log(`   Время ответа API: ${apiTime.healthEndpoint}ms (${apiTime.status})`);
    }
    
    // Безопасность
    console.log('\n🔒 БЕЗОПАСНОСТЬ:');
    console.log(`   SSL/HSTS: ${this.auditResults.securityAssessment.ssl?.status || 'unknown'}`);
    console.log(`   Rate Limiting: ${this.auditResults.securityAssessment.rateLimiting?.status || 'unknown'}`);
    console.log(`   Переменные окружения: ${this.auditResults.securityAssessment.environmentVariables?.status || 'unknown'}`);
    
    // Масштабируемость
    console.log('\n📈 МАСШТАБИРУЕМОСТЬ:');
    const loadCapacity = this.auditResults.scalabilityAnalysis.loadCapacity;
    if (loadCapacity) {
      console.log(`   Макс. пользователей: ${loadCapacity.capacityEstimate.maxConcurrentUsers}`);
      console.log(`   Макс. заказов/мин: ${loadCapacity.capacityEstimate.maxOrdersPerMinute}`);
      console.log(`   Макс. видео/час: ${loadCapacity.capacityEstimate.maxVideosPerHour}`);
      
      if (loadCapacity.bottlenecks.length > 0) {
        console.log(`   Узкие места: ${loadCapacity.bottlenecks.length}`);
        loadCapacity.bottlenecks.forEach(bottleneck => {
          console.log(`     - ${bottleneck}`);
        });
      }
    }
    
    // Рекомендации
    console.log('\n💡 РЕКОМЕНДАЦИИ:');
    this.auditResults.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.recommendation}`);
      console.log(`      Действие: ${rec.action}`);
    });
    
    console.log('\n════════════════════════════════════════════════════════════════════════════════');
    
    // Оценка общей производительности
    const overallScore = this.calculateOverallScore();
    console.log(`🎯 ОБЩАЯ ОЦЕНКА ПЛАТФОРМЫ: ${overallScore}/100`);
    
    if (overallScore >= 90) {
      console.log('🌟 ОТЛИЧНО! Платформа работает на высоком уровне');
    } else if (overallScore >= 70) {
      console.log('✅ ХОРОШО! Платформа работает стабильно');
    } else if (overallScore >= 50) {
      console.log('⚠️  УДОВЛЕТВОРИТЕЛЬНО! Есть области для улучшения');
    } else {
      console.log('❌ ТРЕБУЕТСЯ ВНИМАНИЕ! Критические проблемы обнаружены');
    }
    
    console.log('════════════════════════════════════════════════════════════════════════════════');
  }

  // Расчет общей оценки
  calculateOverallScore() {
    let score = 100;
    
    // Штрафы за проблемы
    const containerStats = this.auditResults.performanceMetrics.containerStats;
    if (containerStats) {
      containerStats.forEach(stat => {
        if (stat.cpuPercent > 80) score -= 15;
        else if (stat.cpuPercent > 60) score -= 10;
        
        if (stat.memoryPercent > 80) score -= 15;
        else if (stat.memoryPercent > 60) score -= 10;
      });
    }
    
    // Штрафы за безопасность
    if (this.auditResults.securityAssessment.ssl?.status !== 'secure') score -= 10;
    if (this.auditResults.securityAssessment.rateLimiting?.status !== 'configured') score -= 5;
    
    // Штрафы за доступность
    if (this.auditResults.systemHealth.website?.status !== 'accessible') score -= 20;
    
    return Math.max(0, score);
  }
}

// Запуск аудита
async function runPlatformAudit() {
  const auditor = new PlatformAuditor();
  const results = await auditor.performFullAudit();
  return results;
}

// Экспорт для использования
module.exports = { PlatformAuditor, runPlatformAudit };

// Запуск если файл выполняется напрямую
if (require.main === module) {
  runPlatformAudit().catch(console.error);
}
