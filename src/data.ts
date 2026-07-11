import type { ArticleType, EditorSettings, RecipeDefinition, ThemeDefinition } from './types'

const recipe = (name: string, core: string[], accents: string[]): RecipeDefinition => ({ name, core, accents })

const greenRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['步骤标签', '代码块', '编号列表'], ['踩坑提示', '流程卡']),
  list: recipe('盘点 / 工具清单', ['工具标签', '说明卡', '要点列表'], ['数据表', '亮点卡']),
  opinion: recipe('观点 / 深度分析', ['主题引言', '编号章节', '金句引用'], ['居中金句', '旁注']),
  interview: recipe('访谈 / 人物特稿', ['人物引言', '章节叙事', '时间线'], ['金句卡', '轻量旁注']),
  data: recipe('数据复盘 / 报告', ['数据卡', '对照表', '编号列表'], ['信息提示', '重点高亮']),
  essay: recipe('生活 / 情感随笔', ['留白正文', '居中金句', '章节分隔'], ['轻量引用']),
  case: recipe('案例实战', ['案例标签', '步骤结构', '结论卡'], ['流程图', '风险提示']),
}

const redRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['步骤标签', '深色代码块', '红色编号列表'], ['红色提示', '工具卡']),
  list: recipe('盘点 / 工具清单', ['工具标签', '条目说明卡', '红点列表'], ['数据卡', '标签胶囊']),
  opinion: recipe('观点 / 深度分析', ['正文段落', '粉底金句引用', '居中金句'], ['浅红引用', '踩坑提示']),
  interview: recipe('访谈 / 人物特稿', ['正文段落', '人物金句', '经历时间线'], ['居中金句', '灰底旁注']),
  data: recipe('数据复盘 / 报告', ['红色数据卡', '真实数据表', '编号列表'], ['红色提示', '荧光笔']),
  essay: recipe('生活 / 情感随笔', ['正文段落', '居中金句', '灰底旁注'], ['粉底金句']),
  case: recipe('案例实战', ['案例标签', '案例时间线', '步骤标签'], ['浅红引用', '踩坑提示']),
}

const graphiteRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['石墨步骤标签', '深色代码块', '编号列表'], ['石墨提示', '线框工具卡']),
  list: recipe('盘点 / 工具清单', ['工具编号标签', '线框工具卡', '圆点列表'], ['线框数据卡', '描边胶囊']),
  opinion: recipe('观点 / 深度分析', ['正文段落', '石墨竖条金句', '居中金句'], ['浅灰引用', '轻量旁注']),
  interview: recipe('访谈 / 人物特稿', ['正文段落', '石墨人物引语', '经历时间线'], ['居中金句', '辅助旁注']),
  data: recipe('数据复盘 / 报告', ['线框数据卡', '极简表格', '编号列表'], ['石墨提示', '荧光笔']),
  essay: recipe('生活 / 情感随笔', ['正文段落', '居中金句', '辅助旁注'], ['石墨金句']),
  case: recipe('案例实战', ['案例标签', '时间线', '步骤标签'], ['浅灰引用', '踩坑提示']),
}

const zenRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 清单（弱契合）', ['留白正文', '极简要点列表', 'NOTE 提示'], ['细线数据卡', '建议改用摸鱼绿']),
  list: recipe('读书笔记 / 知识整理', ['留白正文', '要点列表', '浅墨绿标签'], ['NOTE 提示']),
  opinion: recipe('观点 / 深度随笔', ['留白正文', '居中衬线引用', '加粗结论段'], ['极细线旁注']),
  interview: recipe('访谈 / 人物特稿', ['留白正文', '左竖条引语', '居中人物金句'], ['极细线旁注']),
  data: recipe('数据复盘', ['留白正文', '衬线数据卡', '细线分隔'], ['加粗结论段']),
  essay: recipe('生活 / 情感 / 禅意', ['留白正文', '居中衬线引用', '超大章节留白'], ['左竖条引用']),
  case: recipe('案例实战（弱契合）', ['留白正文', '要点列表', '细线结论'], ['建议改用橄榄手记']),
}

const ticketRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['编号特点卡', '案例标题', '结论卡'], ['图片票根', '代码标签']),
  list: recipe('盘点 / 工具清单', ['标签组', '编号特点卡', '核心观点卡'], ['图片票根', '结论卡']),
  opinion: recipe('观点 / 深度分析', ['正文段落', '结论卡', '硬阴影观点卡'], ['左竖条小标题', '绿色高亮']),
  interview: recipe('访谈 / 人物特稿', ['正文段落', '人物 Case 标题', '结论卡'], ['硬阴影引语卡']),
  data: recipe('数据复盘 / 报告', ['大数字观点卡', '编号特点卡', '结论卡'], ['指标代码标签']),
  essay: recipe('生活 / 情感随笔', ['正文段落', '核心观点卡', '少量结论卡'], ['左竖条小标题']),
  case: recipe('案例实战', ['Case 标题', '图片票根', '结论卡'], ['编号特点卡', '核心观点卡']),
}

const oliveRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['头图卡', '步骤内联标题', '正文与代码'], ['流程示意图', 'FAQ', '图片卡']),
  list: recipe('盘点 / 工具清单', ['头图卡', '条目列表卡', '精简对照表'], ['路线胶囊', '信任墙']),
  opinion: recipe('观点 / 深度分析', ['头图卡', '强调标题', '重点观点卡'], ['编者按', '新旧对照', '暗色收束']),
  interview: recipe('访谈 / 人物特稿', ['头图卡', '编者按', '案例时间线'], ['作者签名条', '暗色引语收束']),
  data: recipe('数据复盘 / 报告', ['期号徽章', '图表占位卡', '精简对照表'], ['暗色摘要分栏', '流程图']),
  essay: recipe('生活 / 情感随笔', ['头图卡', '内刊标签条', '分割点'], ['重点观点卡', '摘要横幅']),
  case: recipe('案例实战', ['头图卡', '案例时间线', '对比摘要卡'], ['结尾内容块', '信任墙']),
}

const kleinBlueRecipes: Record<ArticleType, RecipeDefinition> = {
  tutorial: recipe('教程 / 操作指南', ['蓝色步骤卡', '深蓝代码块', '信息提示卡'], ['流程概览', '图片占位']),
  list: recipe('盘点 / 工具清单', ['蓝色编号列表', '检查清单', '指标卡'], ['标签组', '浅蓝提示']),
  opinion: recipe('观点 / 深度分析', ['宣言封面', '编号章节', '克莱因蓝引用'], ['星芒分隔', '结论卡']),
  interview: recipe('访谈 / 人物特稿', ['宣言封面', '人物引语', '经历时间线'], ['作者卡', '细线旁注']),
  data: recipe('数据复盘 / 报告', ['编号封面', '指标卡', '数据表格'], ['进度条', '摘要卡']),
  essay: recipe('生活 / 艺术随笔', ['宣言封面', '留白正文', '居中金句'], ['星芒分隔', '轻蓝引言']),
  case: recipe('案例实战', ['宣言封面', '流程概览', '结论卡'], ['对比图卡', '推荐卡']),
}

const kleinBlueComponentGroups = [
  { name: '开篇与封面', items: ['展册刊头', '纯蓝宣言封面', '编号索引封面', '专题摘要导读', '三段目录索引'] },
  { name: '标题体系', items: ['经典章节标题', '编号章节标题', '结语章节标题', '蓝点小节标题', '左线小节标题', '居中标签标题'] },
  { name: '正文与引用', items: ['标准正文段落', '关键词下划线段落', '强调引导段落', '行内代码说明段落', '深蓝金句引用', '左线长引用', '居中引言分隔'] },
  { name: '提示卡', items: ['信息卡', '重点提示卡', '风险警示卡', '完成确认卡', '编辑旁注'] },
  { name: '行动与流程', items: ['主行动引导', '轻量行动引导', '单步说明卡', '三段流程总览', '垂直时间线'] },
  { name: '图片与媒体', items: ['标准图片', '图片素材占位', '双图对比', '三图静态画廊', '静态视频占位'] },
  { name: '代码与数据', items: ['深色代码块', '浅色代码块', '真实数据表格', '双指标卡', '三项指标条', '进度条组'] },
  { name: '列表与问答', items: ['蓝点无序列表', '编号有序列表', '静态任务清单', '常见问答'] },
  { name: '作者与资源', items: ['作者信息', '联系方式', '下载引导', '延伸阅读', '标签胶囊组'] },
  { name: '推荐与摘要', items: ['图文推荐卡', '重点摘要卡', '公众号封面推荐'] },
  { name: '分隔与收束', items: ['星芒分隔线', '菱形分隔线', '结尾总结区', '末尾互动区', 'END 几何收束'] },
]

const kleinBlueComponentTriggers: Record<string, string> = {
  展册刊头: '随封面自动生成',
  纯蓝宣言封面: '<!-- cover: manifesto -->',
  编号索引封面: '<!-- cover: numbered -->',
  专题摘要导读: '导读：内容',
  三段目录索引: '三章以上自动生成',
  经典章节标题: '关闭“章节自动编号”',
  编号章节标题: '## 章节标题',
  结语章节标题: '## 结语',
  蓝点小节标题: '### 小节标题',
  左线小节标题: '数据/清单类型 + ###',
  居中标签标题: ':::gzh component=klein-label-title',
  标准正文段落: '普通段落',
  关键词下划线段落: '++关键词++',
  强调引导段落: '引导：内容',
  行内代码说明段落: '`inline_code`',
  深蓝金句引用: '> 短引用',
  左线长引用: ':::gzh component=klein-quote-rule',
  居中引言分隔: '金句：内容',
  信息卡: '信息：内容',
  重点提示卡: '提示：内容',
  风险警示卡: '警告：内容',
  完成确认卡: '完成：内容',
  编辑旁注: '旁注：内容',
  主行动引导: '行动：标题',
  轻量行动引导: '轻行动：内容',
  单步说明卡: '步骤：标题',
  三段流程总览: ':::gzh component=klein-process-overview',
  垂直时间线: '1. 2024年：节点',
  标准图片: '![图注](图片地址)',
  图片素材占位: '【插入：图片说明】',
  双图对比: '连续 2 张 Markdown 图片',
  三图静态画廊: '连续 3 张 Markdown 图片',
  静态视频占位: '待补视频：说明',
  深色代码块: '```语言',
  浅色代码块: '```light:语言',
  真实数据表格: 'Markdown 表格',
  双指标卡: ':::gzh component=klein-metric-pair',
  三项指标条: ':::gzh component=klein-metric-triple',
  进度条组: ':::gzh component=klein-progress-bars',
  蓝点无序列表: '- 较长的并列说明',
  编号有序列表: '1. 普通步骤',
  静态任务清单: '- [x] 已完成',
  常见问答: ':::gzh component=klein-faq',
  作者信息: '作者：姓名 | 身份 | 简介',
  联系方式: '联系方式：渠道 | 内容',
  下载引导: '下载：资料标题',
  延伸阅读: '延伸阅读：标题 | 说明',
  标签胶囊组: '标签：标签一、标签二',
  图文推荐卡: ':::gzh component=klein-article-card',
  重点摘要卡: '摘要：核心判断',
  公众号封面推荐: ':::gzh component=klein-cover-recommendation',
  星芒分隔线: '***',
  菱形分隔线: '---',
  结尾总结区: '文末自动 / klein-ending-summary',
  末尾互动区: '文末自动 / interaction: off',
  'END 几何收束': '文末自动 / klein-end-mark',
}

export const articleTypes = Object.entries(greenRecipes).map(([id, value]) => ({
  id: id as ArticleType,
  name: value.name,
}))

export const themes: ThemeDefinition[] = [
  {
    id: 'moyu-green',
    name: '摸鱼绿',
    description: '绿色杂志风 · 教程与清单',
    sourceFile: 'theme-moyu-green.md',
    componentCount: '13 组 / 30+ 变体',
    accent: '#059669', accentSoft: '#ecfdf5', paper: '#ffffff', ink: '#374151', muted: '#9ca3af', border: '#bbf7d0', highlight: '#fde68a',
    recipes: greenRecipes,
  },
  {
    id: 'red-white',
    name: '红白色系',
    description: '经典编辑风 · 观点与深度',
    sourceFile: 'theme-red-white.md',
    componentCount: '16 组 / 30+ 变体',
    accent: '#dc2626', accentSoft: '#fef2f2', paper: '#ffffff', ink: '#374151', muted: '#9ca3af', border: '#fecaca', highlight: '#fee2e2',
    recipes: redRecipes,
  },
  {
    id: 'graphite',
    name: '石墨极简',
    description: '专业极简风 · 科技评论',
    sourceFile: 'theme-graphite-minimal.md',
    componentCount: '16 组 / 35+ 变体',
    accent: '#52525b', accentSoft: '#fafafa', paper: '#ffffff', ink: '#52525b', muted: '#a1a1aa', border: '#e4e4e7', highlight: '#f4f4f5',
    recipes: graphiteRecipes,
  },
  {
    id: 'zen',
    name: '留白禅意',
    description: '衬线留白风 · 随笔与冥想',
    sourceFile: 'theme-zen-whitespace.md',
    componentCount: '15 组 / 25+ 变体',
    accent: '#4a5d52', accentSoft: '#eef3f0', paper: '#ffffff', ink: '#525252', muted: '#a3a3a3', border: '#b5c8bc', highlight: '#eef3f0',
    recipes: zenRecipes,
  },
  {
    id: 'ticket',
    name: '摸鱼票据',
    description: '票根硬阴影 · 测评与对比',
    sourceFile: 'theme-moyu-ticket.md',
    componentCount: '15 组 / 20+ 变体',
    accent: '#059669', accentSoft: '#f0fdf4', paper: '#fffef8', ink: '#1a1a1a', muted: '#777777', border: '#1a1a1a', highlight: '#a7f3d0',
    recipes: ticketRecipes,
  },
  {
    id: 'olive',
    name: '橄榄手记',
    description: '编辑部内刊 · 复盘与案例',
    sourceFile: 'theme-olive-journal.md',
    componentCount: '34 组 / 40+ 变体',
    accent: '#ed7b2f', accentSoft: '#eeefe9', paper: '#fdfdf8', ink: '#4d4f46', muted: '#9ea096', border: '#bfc1b7', highlight: '#eeefe9',
    recipes: oliveRecipes,
  },
  {
    id: 'klein-blue',
    name: '克莱因蓝艺术展册',
    description: '鸿蒙无衬线 · 艺术评论与品牌叙事',
    sourceFile: 'theme-klein-blue.md',
    componentCount: '28 组核心 / 56 个预览',
    accent: '#002fa7', accentSoft: '#e8ecff', paper: '#ffffff', ink: '#111111', muted: '#434650', border: '#d8e1f6', highlight: '#f3f6ff',
    recipes: kleinBlueRecipes,
    componentGroups: kleinBlueComponentGroups,
    componentTriggers: kleinBlueComponentTriggers,
    componentPreviewUrl: new URL('../assets/theme-previews/theme-klein-blue.html', import.meta.url).href,
  },
]

export const sampleMarkdown = `# 做了些爆款 Skills 以后，我对 Skills 的看法

> Agent 时代最稀缺的，是把人的经验、工作流和品味，变成可以分发、调用、迭代的==能力商品==。

我最近几次聊 Skills，有一个越来越明确的判断：大家都在说 Agent，但大多数人还没真正理解它。Agent 不是简单抹平能力差距，**而是在放大能力差距**。

目标清晰、品味强的人会被 Agent 放大；目标混乱、没有判断的人，也会被放大混乱。而 Skill，正是弥合这道鸿沟的关键。

## Skill 是能力商品

我现在对 Skill 的一句话定义是：把专家经验、工作流、品味和工具调用，封装成可分发、可复用、可迭代的能力单元。

它不是单纯的提示词，也不是传统意义上的 App，更像 Agent 时代的**能力商品**。用户不需要理解底层的 MCP、CLI、loop，只需要知道：它解决什么问题，产出什么结果。

## 核心是把人的经验外化

真正有价值的部分，是把人的审美、判断和经验固化进去。这要求创作者同时懂三件事：

- 传统专业知识：决定你知道什么结果算好
- AI 的上下限：决定你知道什么必须工程化兜底
- 产品化思维：决定你知道用户场景和稳定性要求

### 一个设计类 Skill 的例子

它没有让图像模型一把梭生成 Logo，而是先生成 ==SVG 变体==，再做展示图。把 Logo 本体、展示场景、交互背景拆成不同层，分别用最适合的技术处理。

【插入：Skill 架构示意图】

## 好架构：中心短，辐射厚

> 复杂 Skill 不怕有复杂内容，怕的是把复杂内容一次性塞给模型。文件系统本身就是一种上下文工程。

SKILL.md 只放高信号流程；references 放重文档，按需读取；scripts 放确定性逻辑。更稳的架构是 **Thin Harness, Fat Skills**。

\`\`\`text
SKILL.md → 工作流与决策
references/ → 主题组件与映射
scripts/ → 确定性校验
\`\`\`

## 像代码质量一样维护

好 Skill 不是一次写完，它需要像代码质量一样维护。一个可靠的生命周期是：

1. 先用真实任务找到它会错在哪里
2. 把失败案例追加到 ++gotchas++
3. 再做跨模型测试，看不同模型的差异

其中 ~~正向原则最重要~~，其实**负面边界才是专家经验**。

## 个人产品的复利飞轮

过去文章和产品是分开的：先做产品，再写推广。现在 Skill、文章、案例、开源仓库会互相喂养。

每一次真实任务，都不只是在完成任务，而是在积累下一次能调用的能力资产。这就是个人产品在 Agent 时代的复利飞轮。

---

我是甲木，热衷于分享一些 AI 观察、AI 干货内容。如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。`

export const defaultSettings: EditorSettings = {
  themeId: 'moyu-green',
  articleType: 'opinion',
  autoNumber: true,
  keywordUnderline: true,
  includeToc: true,
}
