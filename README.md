# Wenlan · 公众号排版

把 Markdown 按 [`isjiamu/gzh-design-skill`](https://github.com/isjiamu/gzh-design-skill) 的主题组件配置，实时转换为可直接复制到微信公众号编辑器的内联 HTML。

## 已实现

- Markdown 实时解析：标题、引言、章节、子标题、引用、列表、代码、图片与待补素材。
- 7 套主题骨架：摸鱼绿、红白色系、石墨极简、留白禅意、摸鱼票据、橄榄手记、克莱因蓝艺术展册。
- 文章类型配方：教程、清单、观点、访谈、数据、随笔、案例；右侧展示每套主题自己的核心与点缀组件。
- 智能处理：章节编号、每段关键词下划线、精选目录、末章编号变体和签名合并。
- 预览与复制使用同一份 HTML；支持一键复制富文本和导出纯 `<section>` 正文文件。
- 客户端合规检查：内联样式、`span leaf`、禁用标签与定位规则。

## 本地运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

## 配置来源与许可

主题骨架、组件语义、文章配方和公众号兼容规则源自 [`isjiamu/gzh-design-skill`](https://github.com/isjiamu/gzh-design-skill) 的 `SKILL.md`、`references/theme-*.md` 与 `references/common-components.md`。本工具保留原项目版权与联名署名：**AGPL-3.0 © 2026 甲木 × 摸鱼小李**（[LICENSE](https://github.com/isjiamu/gzh-design-skill/blob/main/LICENSE)）。

当前版本聚焦 7 套内置主题的可视化排版闭环，并登记了首套本地生成主题；原技能中的 Word/PDF 归一化和浏览器内“生成全新主题组件库”流程尚未接入。
