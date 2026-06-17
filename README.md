# 射了没

面向成年男性的私密身体记录应用。它用很轻的方式记录一次射精事件，并把频率、原因、释放槽、射后状态和诱因整理成可读的趋势。

这个项目的调性是坦荡、有梗、克制：不羞辱、不低俗、不做医学诊断，也不把性体验包装成竞技评分。v0.01bata 先跑通一个本地优先、可安装、可自己玩起来的闭环，后续再逐步接入真实 AI、隐私锁、云端同步和更完整的健康管理。

## 当前版本

- 版本：`v0.01bata`
- 形态：React + Vite PWA，Capacitor Android debug 包
- 数据：默认本地保存，使用 `localStorage`
- AI：当前使用本地 `MockAiProvider`，不调用真实模型
- 发布页：[v0.01bata](https://github.com/xiabu123/shelemei-pwa/releases/tag/v0.01bata)

## 它现在能做什么

- 首页直接展示距离上次发射、本周次数、平均释放槽、最近记录和 AI 教练提示。
- 右下角一个固定的 `冲` 按钮进入快捷记录，默认 10 秒完成一条记录。
- 记录弹层支持选择 `撸啊撸` / `干一炮`、释放槽、事后状态、反应标签、诱因标签和备注。
- AI射页展示 7/30 天周期分析、原因统计、释放槽趋势、常见反应和 AI 周期总结。
- 记录页支持查看、编辑、删除历史记录。
- PWA 可构建为 Web 静态资源，也已经通过 Capacitor 封装为 Android debug APK。

## 产品原则

- 快捷记录优先：进入应用后，最重要的事情是能立刻记一条。
- 本地隐私优先：当前版本不做账号、不做云同步、不上传记录。
- 数据感优先：让用户看懂自己的节奏，而不是被分数绑架。
- AI 克制使用：AI 只做模式观察和轻建议，不做医学判断。
- 表达坦荡但不油腻：可以有梗，但不靠擦边和羞辱制造记忆点。

## 主要页面

**首页**

首页不显示大标题栏，直接进入核心状态：距离上次发射、最近 7 天节奏条、本周次数、平均释放槽、最近记录和 AI 教练卡。右下角固定 `冲` 作为唯一记录入口。

**快捷记录弹层**

默认展示最少字段：原因、时间、释放槽、事后感觉、事后反应。展开后可以补充诱因、更多反应和自由备注。保存后数据立即写入本地，并刷新首页、AI射页和记录页。

**AI射**

AI射页专注周期复盘。当前版本用 mock 逻辑生成 7/30 天总结，展示次数、平均间隔、原因统计、释放槽趋势和常见后续反应。右下角使用固定竖向 `7/30` 切换。

**记录**

记录页直接展示历史列表，不显示顶部总数条。每条记录可编辑或删除，删除后所有派生指标实时重新计算。

## 隐私边界

当前版本默认只保存在本机，不做账号、云同步和真实 AI 上传。

仍然需要注意：

- 自由备注是本地明文数据，请避免记录姓名、联系方式或可识别他人的信息。
- 当前 Android 包是 debug APK，适合个人试玩，不适合作为正式分发包。
- 这不是医疗工具，不提供诊断、治疗建议或性功能判断。
- 后续接入真实 AI 时，浏览器内不会放 OpenAI API Key，应该通过后端接口发送必要摘要。

## 技术栈

- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- lucide-react
- Capacitor Android
- localStorage repository
- Mock AI provider

## 本地运行

主工程在 `source/shelemei-pwa/`。

```bash
cd source/shelemei-pwa
npm install
npm run dev
```

构建 PWA：

```bash
cd source/shelemei-pwa
npm run build
```

运行测试：

```bash
cd source/shelemei-pwa
npm test
```

构建 Android debug APK：

```bash
cd source/shelemei-pwa
npm run android:build:debug
```

## 仓库结构

```text
.
├── source/shelemei-pwa/     # React + Vite + Capacitor 主工程
├── docs/                    # 产品文档、设计文档、版本复盘
├── release/v0.01bata/       # 当前版本发布包与校验文件
├── builds/                  # Web 与 Android 构建产物
├── references/              # 早期 PRD、设计稿和 Android 说明
└── LICENSE
```

## 当前不包含

- 账号体系
- 云同步
- 数据导出/导入
- 真实 AI 后端
- 推送通知
- 应用内隐私锁
- 正式签名 Android release 包
- 医学诊断或治疗建议
- 伴侣/对象档案

## v0.02 方向

下一版优先考虑这些能力：

1. 隐私模式：PIN/生物识别、后台模糊、快速隐藏。
2. 数据导出：JSON 导出/导入，避免本地记录丢失。
3. 编辑体验：更清晰的记录详情和编辑状态。
4. 真实 AI 后端：只发送必要摘要，支持单次反馈和周期总结。
5. 统计深化：诱因趋势、时间段分布、连续无射天数。
6. Android release：签名、版本号、图标和启动页优化。

## 开源许可

MIT License

