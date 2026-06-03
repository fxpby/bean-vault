# Update and enhance README.md documentation

## Goal

更新和增强 README.md 文档，补充缺失的重要信息，提升项目文档的完整性和可读性。

## What I Already Know

### Current README.md Status

**File**: `README.md` (135 lines)

**Existing Content**:
- ✅ 项目名称和一句话介绍
- ✅ 核心功能列表（17 项）
- ✅ 技术栈表格
- ✅ 快速开始指南（安装 + 环境变量 + 启动）
- ✅ Supabase 初始化说明
- ✅ 项目结构（目录树 + 文件说明）
- ✅ 脚本命令列表
- ✅ 同步策略流程图
- ✅ 领域模型（状态 + 养豆计算）
- ✅ 设计说明（指向 DESIGN.md）
- ✅ License

### Potentially Missing Content

Based on standard README best practices and the project's complexity:

1. **Screenshots / Demo**
   - 目前无任何截图或 demo 链接
   - 用户无法直观了解 UI 外观

2. **Deployment / Production Build**
   - 只有 `npm run build` 和 `npm run preview`
   - 没有 PWA 安装说明
   - 没有部署到生产环境的指导（Vercel / Netlify / 自托管）

3. **Contributing / Development Guidelines**
   - 没有贡献指南
   - 没有开发规范说明

4. **Troubleshooting / FAQ**
   - 没有常见问题解答
   - 没有故障排查指导

5. **Changelog / Roadmap**
   - 没有版本历史
   - 没有未来计划说明

6. **Badge / Status Indicators**
   - 没有 build status, version, license badge

7. **Dependencies / Requirements**
   - Node.js 版本要求未明确
   - 浏览器兼容性未说明（PWA / IndexedDB 依赖）

8. **Testing**
   - 虽然有 `npm run test` 脚本，但没有测试覆盖率说明
   - 没有测试编写指南

9. **豆历 (Bean Calendar) 功能**
   - README 功能列表中没有提及豆历页面
   - 这是最近新增的重要功能

10. **国际化**
    - 项目主要是中文，但没有说明是否支持其他语言

## Assumptions (temporary)

- 用户希望补充缺失的重要信息
- 优先级：Screenshots > Deployment > 豆历功能 > 其他
- 保持现有中文风格

## Open Questions

## Requirements (evolving)

- [x] **补充范围**: 最小补充（Option A）
  - 添加豆历功能说明
  - 添加 Screenshots 章节（使用 `docs/screenshots/*.png`）
  - 添加 Deployment 指导
  - 明确 Node.js 和浏览器版本要求
- [x] **Node.js 版本要求**: 最低 Node.js 18+
- [x] **Deployment 平台**: 推荐 Vercel
- [x] **Screenshots**: 嵌入 `docs/screenshots/*.png` 截图文件
- [ ] 更新 README.md 补充缺失信息
- [ ] 保持现有中文风格和格式
- [ ] 不改变现有章节的顺序和结构（除非必要）

## Acceptance Criteria (evolving)

- [ ] README.md 添加**豆历功能**说明（在功能列表中）
- [ ] README.md 添加 **Screenshots** 章节，嵌入 `docs/screenshots/*.png`
- [ ] README.md 添加 **版本要求** 章节：
  - Node.js 18+
  - 浏览器要求（支持 IndexedDB, Service Worker）
- [ ] README.md 添加 **部署指南** 章节：
  - Vercel 部署步骤
  - 环境变量配置
  - PWA 安装说明
- [ ] README.md 包含所有必要的项目信息
- [ ] 格式清晰，易于阅读
- [ ] Markdown 语法正确
- [ ] 不包含过时信息

## Definition of Done

- Lint / typecheck / CI green
- README.md 格式正确
- 用户确认补充内容完整

## Out of Scope (explicit)

- 翻译成英文版本（可以在后续任务中进行）
- 制作 demo 视频（需要额外工具和时间）
- 编写完整的 API 文档（项目主要是 UI，无需详细 API 文档）

## Technical Notes

### Files to modify
- `README.md` — 主文档

### Reference Files
- `CLAUDE.md` — 项目技术概览
- `package.json` — 脚本命令和依赖
- Recent commits — 了解最新功能（如豆历）

### Constraints
- 保持 Markdown 格式
- 使用中文
- 与现有风格一致

### Research Notes

**Decision 1: Supplement Scope** ✅
- **Chosen**: 最小补充（Option A）
- **Rationale**: 快速补充最重要的缺失内容，避免文档过度膨胀
- **Content**:
  1. 豆历功能说明
  2. Screenshots 章节
  3. Deployment 指导
  4. Node.js 和浏览器版本要求

**Decision 2: Node.js Version Requirement** ✅
- **Chosen**: Node.js 18+
- **Rationale**: Vite 6 requires Node.js 18+, 兼容性广泛

**Decision 3: Deployment Platform** ✅
- **Chosen**: 推荐 Vercel
- **Rationale**: 一键部署，自动 HTTPS，对前端项目友好，支持环境变量

**Decision 4: Screenshots** ✅
- **Chosen**: 嵌入具体截图文件
- **Files**: `docs/screenshots/*.png`
- **Implementation**: 在 README 中使用 Markdown 图片语法嵌入截图
