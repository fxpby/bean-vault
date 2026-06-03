# 登录后同步冲突确认弹窗

## 需求

登录后本地和云端都有数据时，不再静默 merge，而是弹出确认弹窗列出：
- 本地豆子数量（活跃/回收站）
- 云端豆子数量（活跃/回收站）
- 三个选项：使用本地 / 使用云端 / 合并（last-write-wins）

## 涉及文件
- `src/store/beanStore.ts` — 添加 merge 检测 + resolve 逻辑
- `src/pages/SettingsPage.tsx` — 显示确认弹窗