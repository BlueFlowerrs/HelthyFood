# Deploy HelthyFood lên AWS Debian VPS

Hướng dẫn triển khai HelthyFood lên AWS EC2 Debian VPS sử dụng Docker.

---

## 1. Chuẩn bị AWS Debian VPS

### 1.1 Tạo EC2 Instance

1. Đăng nhập AWS Console → EC2 → **Launch Instance**
2. Chọn **Debian 12** (Free tier eligible) hoặc Ubuntu 22.04 LTS
3. Chọn instance type: `t3.micro` (Free tier) hoặc lớn hơn
4. Tạo key pair (`.pem`) để SSH
5. Configure Security Group:
   - **SSH (22)**: Your IP
   - **HTTP (80)**: 0.0.0.0/0
   - **HTTPS (443)**: 0.0.0.0/0
   - **Custom TCP (3000)**: 0.0.0.0/0 (tạm thời cho debug)
6. Launch instance

### 1.2 Kết nối SSH

```bash
ssh -i your-key.pem debian@YOUR_INSTANCE_IP
```

---

## 2. Cài đặt Docker + Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker debian

# Verify
docker --version
docker compose version
```

**Logout và login lại** để áp dụng quyền docker.

---

## 3. Cài đặt Nginx

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Cấu hình Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/helthyfood
```

Thêm cấu hình:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/helthyfood /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

---

## 4. Clone Project từ GitHub

```bash
# Cài git nếu chưa có
sudo apt install -y git

# Clone repo (thay YOUR_USERNAME và repo name)
git clone https://github.com/YOUR_USERNAME/helthyfood.git
cd helthyfood
```

---

## 5. Cấu hình Environment Variables

```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa
nano .env
```

Nội dung `.env`:

```env
# Supabase (lấy từ Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# VNPAY Sandbox
VNPAY_SANDBOX_SECRET=generate-a-random-secret-here
```

**Tạo secret ngẫu nhiên:**
```bash
openssl rand -hex 32
```

---

## 6. Chạy ứng dụng với Docker

```bash
# Build và chạy
docker compose up -d --build

# Kiểm tra trạng thái
docker compose ps

# Xem logs
docker compose logs -f app

# Kiểm tra health
curl http://localhost:3000
```

Ứng dụng sẽ chạy tại `http://YOUR_IP:3000`

---

## 7. Cấu hình SSL với Certbot

```bash
# Cấu hình domain trỏ A record về IP VPS trước
# Sau đó chạy certbot

sudo certbot --nginx -d your-domain.com
```

Certbot sẽ tự động cập nhật Nginx config với SSL.

### Auto-renewal (Certbot tự động renew nhưng kiểm tra):

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## 8. Kiểm tra Production

Sau khi build và SSL hoàn tất:

```bash
# Kiểm tra HTTPS
curl -I https://your-domain.com

# Kiểm tra app response
curl https://your-domain.com | head -50
```

Mở trình duyệt: `https://your-domain.com`

---

## 9. Troubleshooting thường gặp

### Lỗi "Cannot connect to database"
- Kiểm tra Supabase URL và ANON_KEY đúng trong `.env`
- Kiểm tra Supabase project còn hoạt động
- Kiểm tra RLS policies trong Supabase Dashboard

### Lỗi "Module not found"
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Logs không hiển thị
```bash
docker compose logs --tail=100 app
```

### Port 3000 đã bị chiếm
```bash
# Kill existing process
sudo lsof -ti:3000 | xargs kill -9
# Hoặc đổi port trong docker-compose.yml
```

### Certbot không xác thực domain
- Kiểm tra DNS A record đã trỏ đúng chưa
- Đợi DNS propagate (có thể 24-48h)
- Mở port 80: Kiểm tra Security Group AWS

### Docker out of memory
```bash
# Tăng swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 10. Cấu hình Firewall (UFW)

```bash
# Mở các port cần thiết
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Bật UFW
sudo ufw enable

# Kiểm tra
sudo ufw status
```

---

## 11. CI/CD cơ bản (tùy chọn)

### Setup webhook để auto-deploy:

```bash
# Tạo webhook script
sudo nano /opt/deploy.sh
```

```bash
#!/bin/bash
cd /home/debian/helthyfood
git pull origin main
docker compose build app
docker compose up -d app
docker image prune -f
```

```bash
sudo chmod +x /opt/deploy.sh
```

---

## Checklist

- [ ] EC2 instance đang chạy
- [ ] Docker + Docker Compose cài đặt
- [ ] Nginx chạy reverse proxy
- [ ] Supabase project tạo và chạy migrations
- [ ] `.env` file cấu hình đúng
- [ ] `docker compose up --build` thành công
- [ ] Domain trỏ A record về IP VPS
- [ ] Certbot SSL certificate được cấp
- [ ] HTTPS hoạt động
- [ ] Kiểm tra app tại https://your-domain.com
