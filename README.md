# BeanVault 豆仓

移动端 PWA 咖啡豆库存管理应用，核心功能是**养豆期自动计算** — 追踪每包豆子的最佳饮用窗口。

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 路由 | React Router v7 |
| 状态管理 | Zustand (persist → localforage → IndexedDB) |
| UI | Tailwind CSS v4 + Radix UI 原语 |
| 动画 | Motion |
| 后端 | Supabase (Auth + PostgreSQL + RLS) |
| 认证 | 邮箱 OTP 验证码 |
| PWA | vite-plugin-pwa (Workbox) |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 Supabase URL 和 anon key

# 启动开发服务器
npm run dev
```

## 环境变量

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase 初始化

在 Supabase SQL Editor 中执行 `supabase/migrations/001_create_beans.sql` 创建 `beans` 表并配置 RLS。

## 项目结构

```
src/
├── types/bean.ts            # Bean 类型定义
├── constants/index.ts        # 产国列表、风味词库、标签映射
├── utils/resting.ts          # 养豆计算、筛选、排序
├── store/beanStore.ts        # Zustand store + 双向同步
├── supabase/
│   ├── client.ts             # Supabase 客户端 + Auth
│   └── sync.ts               # 数据 CRUD 操作
├── hooks/
│   ├── useFilteredBeans.ts   # 筛选/搜索/排序状态
│   ├── useOnlineStatus.ts    # 离线检测
│   └── useSync.ts            # 启动同步
├── components/
│   ├── ui/                   # Toast, Dialog, SearchBar, EmptyState
│   ├── bean/                 # BeanCard, RestingBadge
│   └── layout/               # BottomNav, TabBar, OfflineBanner
├── pages/
│   ├── HomePage.tsx          # 首页（列表 + 筛选 + FAB）
│   ├── AddBeanPage.tsx       # 添加豆子表单
│   ├── BeanDetailPage.tsx    # 豆子详情/编辑
│   └── SettingsPage.tsx      # 设置（导入导出/云同步）
└── App.tsx                   # 路由 + Provider
```

## 脚本

```bash
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
npm run test      # 运行测试
npm run lint      # 代码检查
```

## 同步策略

```
本地增删改 → IndexedDB 乐观更新 → 推送 Supabase
                                ↘ 离线 → syncQueue → 联网重试
启动时 → fetchRemoteBeans → updatedAt 比较 → 新的覆盖旧的
```

未登录时所有数据仅存本地 IndexedDB，登录后自动推送并合并。

## 设计

设计 token 基于暖奶油色 + 珊瑚色咖啡主题，映射自 Claude.com 设计系统。详见 `DESIGN.md`。

## License

MIT