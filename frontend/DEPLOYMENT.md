# Hướng dẫn Deploy Frontend lên Vercel

## Vấn đề: 404 Not Found khi redirect từ Google OAuth

### Nguyên nhân:
1. Vercel không biết cách xử lý routing cho Single Page Application (SPA)
2. Google OAuth redirect URI chưa được cấu hình đúng
3. Environment variables chưa được set cho production

### Giải pháp:

## 1. Đã tạo `vercel.json` để xử lý SPA routing ✅

File `vercel.json` đã được tạo với cấu hình rewrite tất cả routes về `index.html`.

## 2. Cấu hình Environment Variables trên Vercel

Vào Vercel Dashboard → Project Settings → Environment Variables, thêm các biến sau:

```
VITE_API_URL=<URL_BACKEND_PRODUCTION>
VITE_GOOGLE_CLIENT_ID=511379344101-pq0g4isrg9mfos1sij34t5a3n136u55n.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
VITE_GOOGLE_REDIRECT_URI=https://cnpmnc-251.vercel.app/authenticate
```

**Lưu ý:** Thay `<URL_BACKEND_PRODUCTION>` bằng URL backend thực tế của bạn.

## 3. Cấu hình Google OAuth (QUAN TRỌNG!)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services** → **Credentials**
4. Chọn OAuth 2.0 Client ID: `511379344101-pq0g4isrg9mfos1sij34t5a3n136u55n`
5. Trong **Authorized JavaScript origins**, thêm:
   ```
   https://cnpmnc-251.vercel.app
   ```
6. Trong **Authorized redirect URIs**, thêm:
   ```
   https://cnpmnc-251.vercel.app/authenticate
   ```
7. Nhấn **Save**

## 4. Deploy Backend và cập nhật CORS

Backend cũng cần:
1. Được deploy lên một platform (Railway, Render, Heroku, etc.)
2. Cấu hình CORS cho phép origin từ Vercel:
   ```
   CORS_ALLOWED_ORIGINS=https://cnpmnc-251.vercel.app
   ```
3. Cấu hình Google OAuth redirect URI cho backend:
   ```
   GOOGLE_REDIRECT_URI=https://cnpmnc-251.vercel.app/authenticate
   ```

## 5. Redeploy

Sau khi:
- ✅ Đã push code với `vercel.json`
- ✅ Đã cấu hình environment variables trên Vercel
- ✅ Đã cập nhật Google OAuth settings
- ✅ Backend đã được deploy và URL đã được cập nhật

Redeploy project trên Vercel:
```bash
git add .
git commit -m "fix: Add vercel.json for SPA routing and OAuth configuration"
git push origin main
```

Vercel sẽ tự động redeploy.

## Kiểm tra

1. Truy cập https://cnpmnc-251.vercel.app/authenticate trực tiếp → Không còn 404
2. Thử login bằng Google → Redirect về `/authenticate` → Xác thực thành công

## Troubleshooting

Nếu vẫn gặp lỗi:
1. Check Vercel deployment logs
2. Check browser console để xem error details
3. Verify Google OAuth settings đã save
4. Verify environment variables trên Vercel đã set đúng
