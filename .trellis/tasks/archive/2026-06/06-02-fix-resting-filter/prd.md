# 修复可以喝了排序逻辑

## 问题

"可以喝了"排序模式下，养豆期未完成的豆子也会出现在列表中（排在后面），但用户期望只看到已养好的豆子。

## 修复

`useFilteredBeans.ts` — 当 `sortMode === 'resting'` 时，过滤掉 `isRested === false` 的豆子。

## 涉及文件

- `src/hooks/useFilteredBeans.ts`