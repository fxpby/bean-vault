# Fix false sync conflict trigger on app resume from background

## Goal

修复移动端真机测试中的 bug：浏览器从后台切回来时，即使数据没有变化也会触发同步冲突弹窗。

## What I Already Know

### Current Behavior (Bug)

**Symptom**: 
- 用户在移动设备上将浏览器切到后台
- 再切回来时，会弹出同步冲突确认弹窗
- 即使本地和云端数据完全一致，没有任何变化

### Root Cause Analysis (from code inspection)

**File**: `src/store/beanStore.ts` (lines 174-217)

**Current `syncFromRemote` logic**:

```typescript
syncFromRemote: async () => {
  const remoteBeans = await fetchRemoteBeans();
  if (remoteBeans.length === 0) {
    // Push all local to remote (first-time sync)
    ...
  } else {
    const localBeans = get().beans;
    if (localBeans.length === 0) {
      // First-time sync FROM cloud
      set({ beans: remoteBeans });
    } else if (get().pendingMerge) {
      // Already has pending merge — skip
    } else {
      // ⚠️ PROBLEM: Both local and remote have data → ALWAYS trigger conflict dialog
      set({ pendingMerge: { ... } });
    }
  }
}
```

**The Problem**: 在第 200-209 行，只要本地和云端都有数据，就**无条件**触发冲突弹窗，没有检查数据是否真的有差异。

**Trigger Scenario**:
- App 启动或从后台恢复 → `useSync.ts` 中的 `syncFromRemote()` 被调用
- 如果用户已登录且本地有数据，云端也有数据 → 立即触发 `pendingMerge`
- 即使两边数据完全相同

### Why This Happens on Background Resume

**File**: `src/hooks/useSync.ts` (lines 10-31)

- `useSyncOnStartup` hook 在 component mount 时调用 `syncFromRemote()`
- 在某些移动浏览器中，从后台恢复可能触发 component remount 或 state change
- 或者 auth state change listener 被触发（第 22-26 行）
- 导致重复调用 `syncFromRemote()`

### Expected Behavior

- 只有在本地和云端数据**真的有差异**时，才弹出冲突确认弹窗
- 如果数据完全一致，静默同步成功，不打扰用户

## Assumptions (temporary)

- 数据一致性判断标准：比较 bean 的 `id` 和 `updatedAt` 字段
- 如果所有 bean 的 `id` 集合相同，且每个 bean 的 `updatedAt` 都一致，则认为无冲突
- 需要保留"有差异时弹窗"的逻辑（这是正确的设计）

## Open Questions

(All questions resolved ✅)

## Requirements (evolving)

- [x] **数据一致性判断**: 比较 ID 集合 + updatedAt
  - 构建本地和云端的 bean Map（ID → updatedAt）
  - 比较 ID 集合是否相同
  - 对于相同 ID 的 bean，比较 `updatedAt` 是否一致
  - 只有存在差异时才触发冲突弹窗
- [x] **冲突判断位置**: 在 `syncFromRemote` 函数中
  - 在 `beanStore.ts` 的 `syncFromRemote` 函数中添加差异检测
  - 在设置 `pendingMerge` 之前判断
- [x] **后台恢复策略**: 保持现有逻辑，只修复误触发
  - 不改变同步触发时机
  - 不添加 debounce 或 visibility API
  - 仅修复差异检测逻辑
- [ ] 修复无差异时误触发冲突弹窗的 bug
- [ ] 保留有差异时的冲突确认逻辑
- [ ] 不影响首次同步逻辑（云端空 / 本地空的情况）
- [ ] 不影响离线队列重试逻辑

## Acceptance Criteria (evolving)

- [ ] 本地和云端数据完全一致时，`syncFromRemote()` 不触发 `pendingMerge`
- [ ] 本地和云端数据有差异时，仍然正确触发冲突确认弹窗
- [ ] 后台恢复时不会出现误触发
- [ ] 首次同步逻辑不受影响
- [ ] TypeScript 编译通过
- [ ] 在真机上测试验证

## Definition of Done

- Tests added/updated (if applicable)
- Lint / typecheck / CI green
- 真机测试验证修复有效
- No regression on existing sync flows

## Out of Scope (explicit)

- 改变同步策略（仍然使用 last-write-wins）
- 优化同步性能（如增量同步）
- 添加同步日志或 debug 模式
- 处理网络错误重试逻辑（已有 syncQueue）

## Technical Notes

### Files to modify
- `src/store/beanStore.ts` — `syncFromRemote` 函数，添加数据差异检测

### Files to review
- `src/hooks/useSync.ts` — 可能需要优化触发时机
- `src/types/bean.ts` — 确认 Bean 类型定义

### Constraints
- 保持现有的 Zustand store 结构
- 不引入新的依赖
- 保持向后兼容

### Research Notes

**Decision 1: Data Consistency Check** ✅
- **Chosen**: 比较 ID 集合 + updatedAt
- **Rationale**: 
  - 简单高效，性能好
  - 符合现有的 last-write-wins 同步策略
  - `updatedAt` 是同步冲突判断的核心字段
- **Implementation**: 
  - 构建两个 Map: `local: Map<id, updatedAt>`, `remote: Map<id, updatedAt>`
  - 检查 ID 集合是否相同：`localIds.size === remoteIds.size && [...localIds].every(id => remoteIds.has(id))`
  - 对于每个相同的 ID，检查 `updatedAt` 是否一致
  - 如果所有检查通过 → 无冲突，不触发弹窗

**Decision 2: Conflict Detection Location** ✅
- **Chosen**: 在 `syncFromRemote` 函数中判断
- **Rationale**: 
  - 逻辑集中在一处，易于维护
  - 不需要额外的网络请求
  - 修改范围小，风险低
- **Implementation**: 
  - 在 `beanStore.ts` 第 200 行之前添加差异检测函数
  - 只有检测到差异时才设置 `pendingMerge`

**Decision 3: Background Resume Strategy** ✅
- **Chosen**: 保持现有逻辑，只修复误触发
- **Rationale**: 
  - 简单，风险低
  - 不改变用户预期的同步行为
  - 专注于修复 bug，不引入新功能
- **Out of Scope**: 
  - 不添加 debounce 或节流
  - 不使用 visibility API
  - 不优化网络请求频率
