# Chileme (吃了么) - 智能美食推荐 App

<p align="center">
  <a href="https://github.com/MEKOELITE/chileme-app/actions">
    <img src="https://github.com/MEKOELITE/chileme-app/workflows/CI/CD/badge.svg" />
  </a>
  <a href="https://angular.io">
    <img src="https://img.shields.io/badge/Angular-21-blue.svg" />
  </a>
  <a href="https://capacitorjs.com">
    <img src="https://img.shields.io/badge/Capacitor-8-green.svg" />
  </a>
</p>

## 项目概述

Chileme (吃了么) 是一个基于 Angular + Capacitor 构建的跨平台混合移动应用，旨在通过 AI 解决用户的"午餐选择困难症"。

> ⚠️ **项目状态**: 基础框架已搭建，正在进行功能开发

## 技术栈

| 分类 | 技术 |
|------|------|
| **前端框架** | Angular 21 + Tailwind CSS |
| **移动端** | Ionic Capacitor 8 |
| **AI 集成** | Google Gemini API (规划中) |
| **测试** | Vitest |
| **构建** | SSR 支持 |

## 项目结构

```
chileme-app/
├── .github/workflows/     # CI/CD 配置
└── web-part/             # Angular 应用
    ├── src/
    │   ├── app/          # 组件
    │   └── public/       # 静态资源
    ├── angular.json      # Angular 配置
    ├── package.json      # 依赖
    └── tsconfig.json     # TypeScript 配置
```

## 开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
cd chileme-app/web-part
npm install
```

### 开发模式

```bash
npm start        # 启动开发服务器
npm run watch    # 监听模式
```

### 测试

```bash
npm test         # 运行测试 (watch mode)
npm test -- --run # 单次运行
```

### 构建

```bash
npm run build    # 生产构建
```

## CI/CD

项目使用 GitHub Actions 实现自动化：

- 自动安装依赖
- 自动代码检查 (Lint)
- 自动运行测试
- 自动构建

## 开发者笔记

### 遇到的挑战

1. **版本兼容性**: AGP 与 Gradle 版本匹配问题，通过锁定 8.11.1 解决
2. **环境配置**: JDK 版本冲突，最终在真机上成功安装

### 待完成功能

- [ ] AI 美食推荐集成 (Gemini)
- [ ] 本地数据持久化
- [ ] 拍照识菜功能
- [ ] 餐厅搜索功能

## 许可证

MIT License
