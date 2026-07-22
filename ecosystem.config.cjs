module.exports = {
  apps: [{
    name: 'hangul-study',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/var/www/shadow',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
