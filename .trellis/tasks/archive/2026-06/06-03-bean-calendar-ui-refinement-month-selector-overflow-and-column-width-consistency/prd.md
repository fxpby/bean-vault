# Bean Calendar UI Refinement

## Summary

优化豆历页面的两个 UI 问题：(1) 月份选择器改为两行布局，移除横向滚动；(2) 矩阵图月份标题改为纯数字格式，统一列宽视觉效果。

## Goal

优化豆历页面的两个 UI 问题，提升移动端用户体验：
1. **月份选择器横向滚动** — 移除页面顶部月份 pills 的横向滚动条（移动端不佳体验）
2. **矩阵图列宽不一致** — 修复 10/11/12 月份列宽度与 1-9 月不一致的问题

## What I Already Know

### Current Implementation

**BeanCalendarPage.tsx (lines 36-54)**:
- 顶部有月份选择器（pills 样式）
- 使用 `overflow-x-auto scrollbar-hide`，12 个按钮横向排列
- 按钮使用 `flex-shrink-0` 防止压缩

**HeatmapCalendar.tsx**:
- Grid 布局：`grid-template-columns: "78px repeat(12, minmax(18px, 36px))"`
- 月份标题行（第 84-103 行）：使用 Grid `contents` 让按钮直接参与 Grid 列对齐
- 月份标签来自 `getMonthLabel(month)`，返回中文（如 "一月"、"二月"、...、"十月"、"十一月"、"十二月"）

### The Problems

**Problem 1: 月份选择器横向滚动**
- 12 个 pill 按钮在小屏幕上需要横向滚动
- `overflow-x-auto` 会显示滚动条（即使用了 `scrollbar-hide`，仍然可以滚动）
- 移动端用户需要左右滑动才能看到所有月份

**Problem 2: 10/11/12 月列宽不一致**
- "十月" = 2 个字
- "十一月" = 3 个字
- "十二月" = 3 个字
- 其他月份 "一月"~"九月" = 2 个字

矩阵图的月份标题按钮（HeatmapCalendar 内）没有固定宽度，文字长度不同会导致视觉宽度不一致，即使 Grid 列宽是一致的，文字溢出或换行会影响视觉效果。

## Assumptions (temporary)

- 用户希望月份选择器在移动端无需滚动（或更好的替代方案）
- 矩阵图的 12 个月份列应该视觉宽度一致
- 保持现有的交互方式（点击选择月份）

## Open Questions

(All questions resolved ✅)

### Q2: 矩阵图列宽不一致 — 月份标签如何统一？

**Option A: 使用缩写（一个字）**
- "1月"、"2月"、...、"10月"、"11月"、"12月"
- 或者 "1"、"2"、...、"12"（纯数字）
- 优点：字符数一致，宽度完全一致
- 缺点：可读性略降低（但月份很容易识别）

**Option B: 固定按钮宽度，文字居中**
- 给月份按钮设置固定 `min-w-*`，文字居中
- 优点：保持中文全称，视觉一致
- 缺点：2 字月份会有额外留白

**Option C: 使用等宽字体（monospace）**
- 强制所有月份标签使用等宽字体
- 优点：技术简单
- 缺点：中文等宽字体效果可能不自然

**Option D: 调整文字大小/字距，让长月份压缩**
- 对 "十一月"、"十二月" 使用略小的 `font-size` 或 `letter-spacing`
- 优点：保持中文全称
- 缺点：不一致的字号，可能更丑

你希望如何处理月份标签的宽度一致性？

## Requirements (evolving)

- [x] **月份选择器布局**: 改为两行显示
  - 上行：1-6 月
  - 下行：7-12 月
  - 每行 6 个按钮，移动端宽度足够
  - 移除横向滚动
  - 保持中文全称（"一月"~"十二月"）
- [x] **矩阵图月份标题**: 使用纯数字格式（"1"~"12"）
  - 移除中文全称
  - 统一使用阿拉伯数字
  - 配合 Grid 列宽，视觉一致
- [x] **MVP 范围**: 仅修改两个位置，不统一全站月份标签
- [ ] 保持现有的月份选择交互
- [ ] 移动端优先（iPhone SE 375px 为基准）

## Acceptance Criteria (evolving)

- [ ] 页面顶部月份选择器在 375px 宽度屏幕上无需横向滚动
- [ ] 月份选择器两行布局：上行 1-6 月，下行 7-12 月
- [ ] 月份选择器保持中文全称（"一月"~"十二月"）
- [ ] 矩阵图月份标题改为纯数字（"1"~"12"）
- [ ] 矩阵图 12 个月份列宽度视觉一致
- [ ] 不影响现有的月份选择交互（点击切换月份）
- [ ] TypeScript 编译通过
- [ ] 在多个屏幕宽度下测试（iPhone SE, iPhone 14 Pro, iPad）

## Definition of Done

- Tests added/updated (if applicable)
- Lint / typecheck / CI green
- Tested on multiple viewport widths (DevTools responsive mode)
- No visual regression

## Out of Scope (explicit)

- 改变月份选择的交互逻辑
- 添加动画效果
- 改变矩阵图的 Grid 布局结构
- 国际化（保持中文月份标签）
- **统一全站月份标签格式** — 页面顶部 pills 保持中文全称，矩阵图使用数字，两者用途不同可以接受不一致
- **RecommendationCards 的月份标签** — 保持现有格式不变
- **横屏模式优化** — 当前两行布局在横屏下也适用，无需特殊处理

## Technical Notes

### Files to modify
- `src/pages/BeanCalendarPage.tsx` — 月份选择器（pills）
- `src/components/calendar/HeatmapCalendar.tsx` — 矩阵图月份标题行
- Possibly `src/utils/calendar.ts` — 如果需要修改 `getMonthLabel`

### Constraints
- Tailwind CSS
- React 18+
- Mobile-first approach
- 保持现有的设计 token（colors, spacing）

### Research Notes

**Decision 1: Month Selector Layout** ✅
- **Chosen**: 两行显示（上行 1-6 月，下行 7-12 月）
- **Rationale**: 所有月份一目了然，无需滚动，移动端宽度足够
- **Implementation**: 修改 BeanCalendarPage.tsx 的月份选择器，拆分为两个 flex row

**Decision 2: Matrix Month Label Format** ✅
- **Chosen**: 纯数字格式（"1"~"12"）
- **Rationale**: 
  - 最简洁，字符数最少（1 或 2 个字符）
  - 配合 Grid 列宽可以统一视觉效果
  - 在日历/热力图上下文中语义清晰
- **Implementation**: 修改 HeatmapCalendar.tsx 的月份标题按钮，直接显示 `month` 数字而非 `getMonthLabel(month)`

**Decision 3: MVP Scope** ✅
- **Chosen**: 仅修改两个位置，不统一全站月份标签
- **Rationale**: 
  - 页面顶部 pills 用途是主要导航，保持中文全称更友好
  - 矩阵图月份标题用途是列标识，简洁数字即可
  - 两者用途不同，可以接受不一致
- **Out of Scope**: RecommendationCards、其他页面的月份标签
