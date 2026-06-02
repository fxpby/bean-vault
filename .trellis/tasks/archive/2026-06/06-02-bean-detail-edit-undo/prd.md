# 豆子详情页编辑增强 & 状态误操作防护

## 需求

### 1. 编辑模式增强

当前 `BeanDetailPage` 编辑模式只能修改 name, estate, variety, pricePerGram, restingDays, flavorNotes。需要扩展到所有字段：

**新增可编辑字段**:
- 分类 (category) — 按钮组，同 AddBeanPage
- 产国 (country) — 搜索下拉，同 AddBeanPage
- 处理法 (process) — 按钮组
- 烘焙度 (roastLevel) — 按钮组
- 生产日期 (productionDate) — date input
- 状态 (status) — 按钮组

### 2. 状态误操作防护

从详情页点击"喝完了"后，没有撤销能力。需要防护：

**方案**:
- "喝完了"按钮点击后弹出 ConfirmDialog 确认
- 已喝完的豆子显示"重新开始喝"按钮，可改回 drinking
- 正在喝的豆子显示"放回架子"按钮，可改回 shelf
- 冰箱中的豆子保留"拿出来喝"按钮，增加"放回架子"按钮

## 涉及文件

- `src/pages/BeanDetailPage.tsx` — 主要改动
- 引入 `COUNTRIES`, `CATEGORY_OPTIONS`, `PROCESS_OPTIONS`, `ROAST_OPTIONS`, `STATUS_OPTIONS` 常量
- 引入 `todayString` 工具函数