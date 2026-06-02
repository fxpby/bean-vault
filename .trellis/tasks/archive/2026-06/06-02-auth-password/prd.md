# 邮箱 OTP → 用户名密码登录

## 原因

Supabase 免费版邮件发送有频率限制，邮箱验证码/magic link 不适合免费版使用。

## 改动

### client.ts
- 删除 `signInWithOtp`, `verifyOtp`
- 新增 `signUp(email, password)` — 注册
- 新增 `signIn(email, password)` — 登录
- 删除 `siteUrl` 变量
- `detectSessionInUrl` 改为 `false`（不再需要）

### SettingsPage.tsx
- 删除两步验证 UI（email → code），改为单步 email + password 表单
- 增加"登录"和"注册"模式切换
- 简化状态：删除 `authCode`, `authStep`, 新增 `authPassword`, `isSignUp`

## 涉及文件
- `src/supabase/client.ts`
- `src/pages/SettingsPage.tsx`