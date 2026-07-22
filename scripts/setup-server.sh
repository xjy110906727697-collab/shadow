#!/bin/bash
set -e

echo "=== Setting up Ali ECS for ShadowVideo ==="

sudo yum update -y

echo "Installing git..."
sudo yum install -y git

echo "Installing Node.js 20.x..."
sudo yum install -y nodejs || {
  echo "Default repo Node.js not found, downloading from npmmirror..."
  curl -fsSL https://npmmirror.com/mirrors/node/v20.18.0/node-v20.18.0-linux-x64.tar.xz -o /tmp/node.tar.xz
  sudo tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
  rm /tmp/node.tar.xz
}

echo "Configuring npm to use npmmirror..."
npm config set registry https://registry.npmmirror.com

echo "Installing PostgreSQL..."
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb || true

echo "Installing Nginx (from source)..."
# Alinux 3 blocks nginx via module system, compile from source instead
sudo yum install -y gcc gcc-c++ make pcre-devel openssl-devel zlib-devel
NGINX_VERSION="1.24.0"
curl -fsSL "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -o /tmp/nginx.tar.gz
cd /tmp && tar -xzf nginx.tar.gz && cd "nginx-${NGINX_VERSION}"
./configure --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --with-http_ssl_module --with-http_v2_module
make -j$(nproc)
sudo make install
cd / && sudo rm -rf /tmp/nginx*

# Create systemd service for nginx
cat > /tmp/nginx.service << 'SERVICE'
[Unit]
Description=nginx - high performance web server
After=network.target

[Service]
Type=forking
PIDFile=/var/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE
sudo mv /tmp/nginx.service /etc/systemd/system/nginx.service
sudo systemctl daemon-reload

echo "Installing PM2..."
sudo npm install -g pm2

echo "Installing Certbot..."
sudo yum install -y certbot python3-certbot-nginx

sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www

echo "Configuring PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER admin WITH PASSWORD 'CHANGE_ME';" || true
sudo -u postgres psql -c "CREATE DATABASE ShadowVideo OWNER admin;" || true

sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== Server setup complete ==="
echo "Next steps:"
echo "  1. Set PostgreSQL password: sudo -u postgres psql -c \"ALTER USER admin WITH PASSWORD 'your-password';\""
echo "  2. Clone repo: git clone <repo-url> /var/www/shadow"
echo "  3. cd /var/www/shadow && cp .env.example .env  (edit .env with real values)"
echo "  4. npm ci && npx prisma generate && npx prisma db push"
echo "  5. npm run build"
echo "  6. sudo cp deploy/nginx/shadow.conf /etc/nginx/conf.d/"
echo "  7. Edit /etc/nginx/conf.d/shadow.conf: replace yourdomain.com"
echo "  8. sudo nginx -t && sudo systemctl reload nginx"
echo "  9. sudo certbot --nginx -d yourdomain.com"
echo " 10. pm2 start ecosystem.config.cjs && pm2 save && pm2 startup"
