# 编辑模式隐藏状态按钮 & 主页排序标签增强

## 需求

### 1. 详情页编辑模式隐藏状态操作按钮

编辑模式下，详情页上方已展示状态操作按钮（"开始喝"/"喝完了"/"放回架子"等），下方编辑表单中也有状态选择器，造成冲突。编辑模式下隐藏状态操作按钮区域。

**改动**: `BeanDetailPage.tsx` — 状态操作区域加 `!isEditing` 条件

### 2. 主页排序标签按钮

当前排序只有一个切换按钮（生产日期 ↔ 可以喝了），不够直观。改为 3 个标签按钮组：

- **默认排序** — 按添加时间倒序（最新添加在前）
- **生产日期** — 按生产日期倒序
- **可以喝了** — 养豆完成的优先，未完成的按剩余天数排序

**改动**:
- `types/bean.ts` — `SortMode` 增加 `'default'`
- `utils/resting.ts` — 增加 `compareByCreatedAt` 函数
- `hooks/useFilteredBeans.ts` — 处理 `default` sort mode
- `pages/HomePage.tsx` — 替换 sort toggle 按钮为 3 标签按钮组

## 涉及文件

- `src/pages/BeanDetailPage.tsx`
- `src/types/bean.ts`
- `src/utils/resting.ts`
- `src/hooks/useFilteredBeans.ts`
- `src/pages/HomePage.tsx`