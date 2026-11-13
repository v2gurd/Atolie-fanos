# آتلیه فانوس

سوپابیس وصل و تنظیم شده است (پروژه Qab، جدول‌ها با پیشوند `fanos_`).

1. فایل‌ها را روی GitHub بگذار و GitHub Pages را روشن کن (Settings > Pages).
2. در Supabase: Authentication > URL Configuration آدرس سایت GitHub Pages را در Site URL و Redirect URLs بگذار.
3. در سایت یک بار با ایمیل خودت «ساخت حساب» بزن.
4. بعد در SQL Editor این را اجرا کن تا مدیر شوی (ایمیل را عوض کن):
   `update fanos_profiles set is_admin=true where id=(select id from auth.users where email='YOU@EXAMPLE.COM');`
5. پنل مدیریت: `آدرس-سایت/#admin`، سپس «بارگذاری نمونه اولیه» را بزن.
