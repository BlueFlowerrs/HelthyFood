# Git Setup Guide for HelthyFood

Hướng dẫn khởi tạo và push project lên GitHub.

---

## 1. Tạo Repository GitHub

1. Truy cập [github.com](https://github.com)
2. Click **New repository**
3. Đặt tên: `helthyfood` (hoặc tên bạn muốn)
4. Chọn **Private** (hoặc **Public** nếu muốn public)
5. **KHÔNG** tick "Add a README file" (vì project đã có)
6. Click **Create repository**

---

## 2. Khởi tạo Git trong Project

```bash
# Di chuyển vào thư mục project
cd helthyfood

# Khởi tạo git repository
git init

# Set tên branch chính
git branch -M main

# Thêm remote
git remote add origin https://github.com/YOUR_USERNAME/helthyfood.git
```

---

## 3. Kiểm tra và Configure

```bash
# Kiểm tra trạng thái
git status

# Xem các file sẽ được commit
git status

# Configure git (nếu chưa)
git config user.name "Your Name"
git config user.email "your@email.com"
```

---

## 4. Commit lần đầu

```bash
# Add tất cả file
git add .

# Hoặc add từng phần
git add README.md
git add app/
git add components/
git add features/
git add lib/
git add hooks/
git add stores/
git add providers/
git add supabase/
git add docs/
git add Dockerfile docker-compose.yml .dockerignore .env.example
git add next.config.js tailwind.config.ts postcss.config.js tsconfig.json package.json middleware.ts
```

**QUAN TRỌNG: KHÔNG bao gồm các file sau:**
- `.env` (chứa secrets)
- `node_modules/`
- `.next/`
- `.git/` (đã có sẵn)

Kiểm tra `.gitignore` đã có đủ các mục trên.

```bash
# Commit
git commit -m "feat: initialize HelthyFood final project

- Next.js 14 App Router + Supabase
- Full e-commerce: shop, cart, checkout, orders
- Admin dashboard with charts
- VNPAY sandbox payment
- Gemini AI product descriptions
- VI/EN i18n support
- Docker + AWS VPS deployment ready"
```

---

## 5. Push lên GitHub

```bash
# Push lên remote
git push -u origin main

# Nhập GitHub credentials khi được yêu cầu
```

---

## 6. Conventional Commits

Sử dụng conventional commits để commit message rõ ràng:

### Tiền tố commit:

| Tiền tố | Mô tả |
|---------|-------|
| `feat:` | Tính năng mới |
| `fix:` | Sửa lỗi |
| `docs:` | Thay đổi tài liệu |
| `refactor:` | Refactor code (không thay đổi tính năng) |
| `chore:` | Công việc phụ (config, dependencies) |
| `style:` | Thay đổi styling |
| `perf:` | Cải thiện hiệu suất |
| `test:` | Thêm/sửa tests |

### Ví dụ:

```bash
git commit -m "feat: add Server Actions for cart mutations"
git commit -m "fix: correct RLS policies on orders table"
git commit -m "docs: update README with Docker instructions"
git commit -m "refactor: move payment logic to Server Action"
git commit -m "chore: add .dockerignore"
git commit -m "fix: prevent unauthorized payment status update"
```

---

## 7. Git Workflow hàng ngày

```bash
# Trước khi bắt đầu
git pull origin main

# Sau khi thay đổi
git add .
git commit -m "your message"
git push origin main
```

---

## 8. Tạo Branch cho Features

```bash
# Tạo branch mới
git checkout -b feature/new-feature

# Chuyển branch
git checkout main
git checkout -b fix/bug-description

# Merge branch
git checkout main
git merge feature/new-feature
git push origin main
```

---

## 9. .gitignore đã được cấu hình

File `.gitignore` hiện tại đã bao gồm:

```
.DS_Store
/node_modules/
/.next/
/.react-router/
/build/
.env
.env.local
.env.production
.vitest/
next-env.d.ts
npm-debug.log*
```

---

## Lưu ý bảo mật

- **KHÔNG BAO GIỜ** push file `.env` lên GitHub
- Nếu đã push nhầm, sử dụng:
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
  ```
- Sử dụng `.env.example` để chia sẻ cấu trúc biến môi trường
