# Tauri 桌面安装包与 GitHub Releases 发布

## 目标

为现有的 React/Vite 编辑器提供 Windows 桌面安装包，并在推送 `v*` 版本标签时自动构建、创建 GitHub Release 和上传安装包。

## 范围

- 保留既有网页编辑器及其业务逻辑。
- 使用 Tauri 作为桌面壳，构建 Windows NSIS 安装程序。
- 增加本地桌面调试和生产构建命令。
- 使用 GitHub Actions 在 Windows Runner 上发布带版本标签的安装包。

不包含应用内自动更新、macOS/Linux 安装包、账号体系、文件关联或额外业务功能。

## 架构

`src/` 继续由 Vite 构建为静态前端资源。Tauri 的 Rust 主进程在生产环境加载该构建结果，在开发环境连接 Vite 开发服务器。第一版不向前端暴露自定义原生命令，因此不会新增跨进程业务接口。

Tauri 打包配置将应用显示名设置为“墨排 · gzh-design”，目标为 Windows NSIS。项目脚本提供：

- `desktop:dev`：启动 Vite 与 Tauri 开发窗口；
- `desktop:build`：构建前端并生成 Windows 安装包。

## 发布流程

GitHub Actions 只在推送形如 `v0.1.1` 的标签时运行：检出标签代码、安装 Node.js 与 Rust、安装依赖、执行 Tauri Windows 构建，并将生成的 NSIS 安装包发布到同名 GitHub Release。

这只实现“自动上传 GitHub Releases”。用户升级时仍从 Release 页面下载新版安装包；应用不会自行检查或下载更新。

## 错误处理与验证

- 本地脚本应在 Tauri 或前端构建失败时返回非零退出码。
- 工作流失败会在 GitHub Actions 中显示，不创建不完整的 Release。
- 验证包括 TypeScript/Vite 构建、Tauri 生产打包，以及 GitHub Actions 工作流语法检查。

## 前提

- 本地生成 Windows 安装包需要安装 Rust 工具链与 Tauri 所需的 Windows 构建依赖。
- 远程发布依赖仓库已托管在 GitHub，且 Actions 具有写入 Releases 的权限。
