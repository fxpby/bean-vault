# 回收站彻底删除 & 豆卡分享功能

## 需求

### 1. 回收站彻底删除

回收站 Tab 中每条豆子目前只有"恢复"按钮，缺少"彻底删除"按钮。

**改动点**:
- `BeanCard.tsx` — 在 trash 模式下的"恢复"按钮旁边添加"彻底删除"按钮（红色文字）
- 点击后弹出 ConfirmDialog 确认（variant="danger"），确认后调用 `permanentlyDeleteBean`
- Store 中已有 `permanentlyDeleteBean` action，无需改动 store

### 2. 豆卡分享功能

用户可以将豆子的详细信息复制到剪贴板，方便分享给其他人。

**改动点**:
- `BeanCard.tsx` — 在卡片底部信息栏添加分享按钮（图标）
- 点击后将豆子信息格式化为易读文本，写入剪贴板
- 使用 `navigator.clipboard.writeText()` + toast 提示"已复制到剪贴板"

**分享文本格式**:
```
☕ {name} {flag}
产区：{country} · {estate}
豆种：{variety}
处理法：{process}  烘焙度：{roastLevel}
风味：{flavorNotes}
养豆：{restingDays} 天  生产日期：{productionDate}
克单价：¥{pricePerGram}/克
```

## 涉及文件

- `src/components/bean/BeanCard.tsx` — 主要改动文件