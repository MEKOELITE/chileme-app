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
  <a href="https://minimax.io">
    <img src="https://img.shields.io/badge/MiniMax-AI-purple.svg" />
  </a>
</p>

## 项目概述

Chileme (吃了么) 是一个基于 Angular + Capacitor 构建的跨平台混合移动应用，通过 AI 解决用户的"午餐选择困难症"。

### 核心功能

- 🎲 **随机推荐** - 早中晚夜宵分类，随机选择困难终结者
- 🤖 **AI 智能推荐** - 基于 MiniMax AI API，智能推荐美食
- 📅 **历史记录** - 记录每日饮食，随时查看历史
- ⚙️ **自定义标签** - 添加自己喜欢的食物标签
- 🔐 **隐私安全** - API Key 仅保存在本地浏览器

## 技术栈

| 分类 | 技术 |
|------|------|
| **前端框架** | Angular 21 + Tailwind CSS |
| **移动端** | Ionic Capacitor 8 |
| **AI 集成** | MiniMax API (用户自备 Key) |
| **状态管理** | Angular Signals |
| **测试** | Vitest + JSDOM |
| **构建** | SSR 支持 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
cd chileme-app/web-part
npm install
```

### 开发

```bash
npm start
```

访问 http://localhost:4200

### 构建

```bash
npm run build
```

### 测试

```bash
npm test        # watch 模式
npm test:run    # 单次运行
```

## MiniMax API 配置

1. 打开应用，点击"设置"
2. 在 [MiniMax 开放平台](https://platform.minimax.io) 注册账号
3. 创建 API Key
4. 在设置页面输入 API Key 并验证
5. 开始使用 AI 推荐功能

## 项目结构

```
chileme-app/
├── .github/workflows/     # CI/CD 配置
└── web-part/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── home/        # 首页（随机/AI推荐）
    │   │   │   ├── settings/    # 设置页面
    │   │   │   └── history/     # 历史记录
    │   │   ├── models/          # 数据模型
    │   │   ├── services/        # 业务服务
    │   │   │   ├── minimax.service.ts   # MiniMax API
    │   │   │   ├── storage.service.ts   # 本地存储
    │   │   │   └── food.service.ts     # 食物服务
    │   │   └── app.routes.ts   # 路由配置
    │   ├── styles.css          # 全局样式
    │   └── index.html          # 入口
    ├── angular.json
    ├── package.json
    └── vitest.config.ts
```

## 功能详情

### 首页
- 选择餐食类型（早餐/午餐/晚餐/夜宵）
- 健康/放纵偏好选择
- 随机推荐
- AI 智能推荐（需配置 API Key）
- 确认选择并记录

### 历史记录
- 按日期查看饮食记录
- 统计数据（总计、各餐次数）

### 设置
- MiniMax API Key 配置（验证保存）
- 自定义标签管理
- 数据清除

## CI/CD

GitHub Actions 自动化：

- 安装依赖
- 代码检查
- 运行测试
- 生产构建

## 许可证

MIT License
