# 墨排 AI 编辑器

一个独立的本地公众号文章生成工具。用户只需输入一句话需求，系统通过用户自己的 OpenAI 兼容接口生成完整 Markdown 文章和结构化排版决策，再由本地排版引擎生成可复制的公众号 HTML。

排版阶段直接读取并使用 [`isjiamu/gzh-design-skill`](https://github.com/isjiamu/gzh-design-skill) 的原始主题组件库，不使用近似 CSS 模板。原始组件文件及 AGPL-3.0 许可证保存在 `vendor/gzh-design-skill`。

## 启动

```powershell
npm install
npm run dev
```

打开 `http://127.0.0.1:5174`。开发命令会同时启动 Vite 前端和本地接口代理。

## 接口配置

在页面右上角打开“接口设置”，填写：

- Base URL，例如 `https://api.openai.com/v1`
- API Key
- OpenAI 兼容模型名

API Key 只保存在当前页面内存中，不写入 localStorage、日志或项目文件。Base URL 应包含版本路径；程序会自动追加 `/chat/completions`。

## 使用流程

1. 输入一句话，例如“写一篇普通人如何用 Skills 提升工作效率的公众号文章，观点犀利，约 1500 字”。
2. 点击“生成完整文章”。
3. AI 自动完成标题、导语、章节、正文、结尾和主题决策，并读取所选主题的原始组件库装配 HTML。
4. 在左侧继续修改文章，或在右侧微调主题和排版。
5. 复制到公众号或导出 HTML。

修改正文或切换主题后，点击右侧“重新应用原组件”，系统会再次读取对应主题组件库装配成品。

## 验证

```powershell
npm test
npm run typecheck
npm run build
```

## 项目边界

本项目所有文件均位于 `mopai-ai-editor` 文件夹中，与父目录中的原版墨排项目相互独立。
