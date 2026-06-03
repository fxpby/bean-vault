# Bean Calendar Matrix Responsive Layout

## Summary

将豆历页面热力图矩阵从固定 22px 单元格改为响应式 Grid 布局，自动填充可用宽度，保持 1:1 正方形单元格，gap 根据单元格大小成比例调整（8%），加入性能优化避免首屏 Layout Shift 和 resize 卡顿。

## Goal

优化豆历页面的热力图矩阵 UI，使其能够响应式地适配不同机型宽度，而不是使用固定的 22px 单元格尺寸。矩阵图应该横向自动填充可用宽度，在不同屏幕尺寸下都保持美观。

## What I Already Know

### Current Implementation (from codebase inspection)

**File**: `src/components/calendar/HeatmapCalendar.tsx`

**Current Layout**:
- 整个矩阵包裹在 `min-w-[340px]` 的容器中
- 月份标题行和单元格都使用固定宽度 `w-[22px]`（第 46 行和第 74 行）
- 国家标签固定宽度 `w-[72px]`（第 38 行和第 62 行）
- 每个单元格固定高度 `h-[22px]`（第 74 行）
- 使用 `overflow-x-auto` 处理横向滚动

**Structure**:
- 13 个国家（行） × 12 个月份（列）
- 左侧有国家标签列（flag + name）
- 顶部有月份标题行

**Design Constraints**:
- 使用 Tailwind CSS
- 已有的设计 token（colors, spacing）
- 需要保持单元格的圆角 `rounded-[3px]`、ring 高亮等效果

### Layout Challenge

当前固定 22px 宽度存在的问题：
1. 在宽屏设备（iPad、大屏手机）上，矩阵显得过小，左右留白过多
2. 在小屏设备上，可能需要横向滚动
3. 无法充分利用可用空间

## Assumptions (temporary)

- 希望单元格保持正方形（宽高比 1:1）
- 国家标签列宽度可能需要保持固定（或有最小宽度）
- 在极小屏幕下仍然保留横向滚动作为 fallback

## Open Questions

(All questions resolved ✅)

## Requirements (evolving)

- [x] **响应式策略**: 使用 CSS Grid + `fr` 单位
  - 重构布局为 Grid: `grid-template-columns: 78px repeat(12, minmax(18px, 36px))`
  - 让 12 个月份列自动分配剩余宽度，带最小/最大宽度限制
- [x] **国家标签列宽度**: 固定 78px（可容纳 emoji + 5 个汉字）
- [x] **单元格宽高比**: 保持正方形 1:1
  - 使用 CSS `aspect-ratio: 1 / 1`
  - 高度随宽度自适应
- [x] **单元格尺寸限制**: 最小 18px，最大 36px
  - 小屏保证可读性，大屏保持视觉密度
  - 使用 Grid `minmax(18px, 36px)` 实现
- [x] **Gap 间距**: 根据单元格大小成比例调整
  - 使用 `useRef` 获取单元格实际渲染宽度
  - 计算比例 gap（例如：单元格宽度的 8%）
  - 通过内联 style 或 CSS 变量动态设置 Grid `gap`
- [x] **性能优化**:
  - 用 `debounce`（~150ms）优化 ResizeObserver 回调，避免频繁重绘
  - 设置初始 gap 默认值（如 `2px`），避免首屏 Layout Shift
- [ ] 移除硬编码的 `w-[22px]` 和 `h-[22px]`
- [ ] 月份标题行按钮对齐单元格列
- [ ] 保持现有的视觉效果（颜色、圆角、ring 高亮等）
- [ ] 在不同设备宽度下测试（iPhone SE, iPhone 14 Pro, iPad Mini, iPad Pro）

## Acceptance Criteria (evolving)

- [ ] 在 375px 宽度屏幕（iPhone SE）上，矩阵能够合理显示
  - 单元格不小于 18px
  - Gap 比例合理（约 8% 单元格宽度）
- [ ] 在 768px 宽度屏幕（iPad Mini）上，矩阵充分利用空间
  - 单元格不超过 36px
  - 视觉密度适中
- [ ] 单元格保持正方形 1:1 宽高比
- [ ] 月份标题按钮和单元格列精确对齐
- [ ] 不影响现有交互（点击选择月份、ring 高亮等）
- [ ] 首屏无明显 Layout Shift（初始 gap 默认值生效）
- [ ] 窗口 resize 时响应流畅（debounce 生效，无卡顿）
- [ ] 所有 Tailwind 硬编码宽度移除（`w-[22px]`, `h-[22px]`）

## Definition of Done

- Tests added/updated (if applicable, unit test for layout calculations)
- Lint / typecheck / CI green
- Tested on multiple viewport widths (DevTools responsive mode)
- No layout shift or overflow issues

## Out of Scope (explicit)

- 改变矩阵的行数或列数
- 改变国家顺序或数据源
- 添加新的交互功能
- 垂直方向的响应式优化（目前只关注横向）
- **横屏模式（landscape）专门优化** — 当前 minmax(18px, 36px) 在横屏下也适用，无需特殊处理
- **动态增减国家行数** — 假设 13 个国家固定
- **gap 比例可配置化** — 使用固定 8% 比例，不暴露为配置项

## Technical Notes

### Files to modify
- `src/components/calendar/HeatmapCalendar.tsx` (main layout)
- Possibly `tailwind.config.ts` if need custom utilities

### Constraints
- Tailwind CSS (must use Tailwind classes or extend config)
- React 18+
- Mobile-first approach

### Research Notes
**Decision 1: Responsive Strategy** ✅
- **Chosen**: CSS Grid + `fr` unit
- **Rationale**: 浏览器原生支持，性能好，代码简洁，最适合矩阵布局
- **Implementation**: `grid-template-columns: 78px repeat(12, minmax(18px, 36px))` — 左侧标签列固定 78px，12 个月份列平分剩余宽度

**Decision 2: Country Label Column Width** ✅
- **Chosen**: 固定 78px（从 72px 调整）
- **Rationale**: 可以正好显示 emoji + 5 个汉字，避免截断

**Decision 3: Cell Aspect Ratio** ✅
- **Chosen**: 正方形 1:1
- **Rationale**: 视觉一致，矩阵更规整
- **Implementation**: 使用 CSS `aspect-ratio: 1 / 1` 让高度随宽度自适应

**Decision 4: Cell Size Constraints** ✅
- **Chosen**: 最小 18px，最大 36px
- **Rationale**: 
  - 最小宽度保证小屏（iPhone SE）可读性
  - 最大宽度避免大屏（iPad Pro）单元格过大、稀疏
- **Implementation**: `minmax(18px, 36px)` in grid-template-columns

**Decision 5: Gap Spacing** ✅
- **Chosen**: 根据单元格大小成比例调整（8% 比例）
- **Rationale**: 保持视觉比例一致，无论单元格大小
- **Implementation**: 
  - 使用 `useRef` + `useEffect` + `ResizeObserver` 监听单元格实际宽度
  - 计算 `gap = cellWidth * 0.08`（8% 比例）
  - 通过 CSS 变量 `--grid-gap` 动态设置
  - Debounce 150ms 优化性能
  - 初始默认 gap: 2px（避免首屏 Layout Shift）

**Decision 6: Performance Optimization** ✅
- **Included**: 
  - ResizeObserver 回调 debounce（150ms）
  - 初始 gap 默认值 2px
- **Excluded** (Out of Scope):
  - 横屏模式专门优化（当前方案已适用）
  - 动态国家行数支持
