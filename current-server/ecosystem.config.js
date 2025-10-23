module.exports = {
  apps: [{
    name: 'mebelplace-server',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'mebelplace',
      DB_USER: 'mebelplace',
      DB_PASSWORD: 'mebelplace123',
      JWT_SECRET: 'your_jwt_secret_here',
      CLIENT_URL: 'https://mebelplace.com.kz'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'mebelplace',
      DB_USER: 'mebelplace',
      DB_PASSWORD: 'mebelplace123',
      JWT_SECRET: 'your_jwt_secret_here',
      CLIENT_URL: 'https://mebelplace.com.kz'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};
