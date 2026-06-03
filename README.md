# BeanVault 豆仓 ☕️

移动端 PWA 咖啡豆库存管理应用，核心功能是**养豆期自动计算** — 追踪每包豆子的最佳饮用窗口。

## 功能

- 豆子增删改查，支持分类（手冲/意式/订阅）和多种筛选
- 养豆期自动计算：根据生产日期 + 养豆天数，标记是否已达最佳赏味期
- 四种状态管理：架子上 / 冰箱 / 正在喝 / 已喝完
- 回收站软删除，支持恢复和永久删除
- 多维度排序：默认 / 生产日期 / 养豆状态
- 即时搜索（无 debounce，数据在内存中 < 200 条）
- JSON 导入/导出（合并 / 替换策略）
- Supabase 云同步：登录后本地与云端双向同步
- 离线优先：离线时数据存 IndexedDB，联网后自动重试
- PWA 支持，可安装到桌面
- 豆历：全球咖啡产区采收日历，可视化展示各产国最佳采收期和到港时间

## 截图

![空豆仓](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/empty-vault_(iPhone%2014%20Pro%20Max).png>)

![豆仓列表](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/%E8%B1%86%E4%BB%93%E5%88%97%E8%A1%A8_(iPhone%2014%20Pro%20Max).png>)

![豆历](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/%E8%B1%86%E5%8E%86_(iPhone%2014%20Pro%20Max).png>)

![设置](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/%E8%AE%BE%E7%BD%AE_(iPhone%2014%20Pro%20Max).png>)

![豆子详情](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/%E8%B1%86%E5%AD%90%E8%AF%A6%E6%83%85_(iPhone%2014%20Pro%20Max).png>)

![添加豆子](<https://fxpby.oss-cn-beijing.aliyuncs.com/project/bean-vault/%E6%B7%BB%E5%8A%A0%E8%B1%86%E5%AD%90_(iPhone%2014%20Pro%20Max).png>)

## 技术栈

| 层       | 技术                                         |
| -------- | -------------------------------------------- |
| 框架     | React 18 + TypeScript                        |
| 构建     | Vite 6                                       |
| 路由     | React Router v7                              |
| 状态管理 | Zustand（persist → localforage → IndexedDB） |
| UI       | Tailwind CSS v4 + Radix UI                   |
| 后端     | Supabase（Auth + PostgreSQL + RLS）          |
| 认证     | 邮箱 + 密码登录                              |
| PWA      | vite-plugin-pwa（Workbox）                   |

## 环境要求

- **Node.js**: 18+ (Vite 6 要求)
- **浏览器**: 支持 IndexedDB 和 Service Worker 的现代浏览器
  - Chrome 88+
  - Firefox 87+
  - Safari 14+
  - Edge 88+

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

同时需要在 Supabase Dashboard → Authentication → Providers 中启用 Email 登录。

若使用官方托管，有邮件速率限制，可在 Supabase Dashboard → Authentication → Providers 关闭 Confirm email。

## 部署

### Vercel 部署（推荐）

1. Fork 本仓库或推送到你的 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 点击 Deploy

### PWA 安装

部署完成后，访问你的应用 URL：

- 移动设备：浏览器会提示"添加到主屏幕"
- 桌面浏览器：地址栏右侧会显示安装图标

安装后可离线使用，数据存储在本地 IndexedDB。

## 项目结构

```
src/
├── types/bean.ts              # Bean 类型定义（含 MergeInfo 同步类型）
├── constants/index.ts          # 产国列表、风味词库、标签映射
├── utils/resting.ts            # 养豆计算、筛选、排序
├── store/beanStore.ts          # Zustand store + 同步冲突检测
├── supabase/
│   ├── client.ts               # Supabase 客户端 + Auth
│   └── sync.ts                 # 数据 CRUD 操作
├── hooks/
│   ├── useFilteredBeans.ts     # 筛选/搜索/排序状态
│   ├── useOnlineStatus.ts      # 离线检测
│   └── useSync.ts              # 启动同步 + 登录后自动同步
├── components/
│   ├── ui/                     # Toast, Dialog, SearchBar, EmptyState
│   ├── bean/                   # BeanCard, RestingBadge
│   └── layout/                 # BottomNav, TabBar, OfflineBanner
├── pages/
│   ├── HomePage.tsx            # 首页（列表 + 筛选 + FAB）
│   ├── AddBeanPage.tsx         # 添加豆子表单
│   ├── BeanDetailPage.tsx      # 豆子详情/编辑
│   └── SettingsPage.tsx        # 设置（导入导出/登录/云同步）
└── App.tsx                     # 路由 + Provider + 同步冲突弹窗
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

启动/登录 → fetchRemoteBeans → 本地 vs 云端对比：
  ├─ 云端为空 → 本地数据推送到云端（首次同步）
  ├─ 本地为空 → 下载云端数据
  └─ 双方有数据 → 弹出冲突确认弹窗，用户选择：
                    ├─ 使用本地数据（覆盖云端）
                    ├─ 使用云端数据（覆盖本地）
                    └─ 合并数据（updatedAt 最后写入优先）
```

未登录时所有数据仅存本地 IndexedDB，登录后弹出冲突确认弹窗供用户选择同步方向。

## 领域模型

| 状态       | 含义             |
| ---------- | ---------------- |
| `shelf`    | 架子上，等待开喝 |
| `fridge`   | 冰箱冷冻储存     |
| `drinking` | 正在喝           |
| `finished` | 已喝完           |

养豆计算（前端推导，不存储）：

- `restedDate = productionDate + restingDays`
- `isRested = today >= restedDate`
- 当 `isRested && status === 'shelf'` 时，卡片显示"开始喝"快捷按钮

## 设计

设计 token 基于暖奶油色 + 珊瑚色咖啡主题。映射自 Claude.com 设计系统。详见 `DESIGN.md`。

## License

MIT
