吃了么 (Chileme) - 智能美食推荐 App
使用方法
把吃饭分成早中晚夜宵四类，每一类有若干个标签，若干个标签可以手动命名，设置为是清淡类，热量爆炸类，用户可以在标签中手动添加食品，然后通过APP进行随机选择 每次选择后，你的选择都将被记下，你可以使用日历功能查看你在每天吃了什么

 项目概述
这是一个基于 Angular 开发，并通过 Capacitor 构建的跨平台混合移动应用。项目核心集成了 Google Gemini 1.5 Flash AI 模型，旨在通过自然语言交互，解决用户的“午餐选择困难症”。

 技术栈
前端框架: Angular (Latest) & Tailwind CSS

AI 集成: Google Gemini API (Generative AI SDK)

混合开发: Ionic Capacitor (Android Native Wrapper)

版本控制: Git (GitHub)

环境工具: Node.js, Android Studio, Gradle

 开发者日志：从零到一的突破 (Developer Journey)
面试官寄语：本项目不仅是我技术探索的产物，更是我独立解决复杂工程问题的实战证明。

1. 环境构建与版本博弈
在项目初期，我遭遇了 Android Gradle Plugin (AGP) 与开发环境版本不匹配的问题。

挑战：由于 Android Studio 预览版建议升级 AGP 至 8.13.0，导致本地 Gradle 构建逻辑崩溃。

解决：我通过深入分析 Gradle 错误日志，对比官方文档，果断将版本回退并锁定在稳定的 8.11.1，并成功解决了 flatDir 元数据警告。

体会：这让我深刻理解了依赖管理和版本兼容性在大型项目中的重要性。

2. 多模态 AI 的原生接入
我没有选择简单的 Web 调用，而是尝试了在移动端环境下直接集成 Gemini AI SDK。

技术实现：实现了异步流式对话处理，并对 API 密钥安全和网络异常处理进行了初步探索。

核心逻辑：设计了一套 Prompt 指令集，确保 AI 的回答既符合“美食推荐”的定位，又具备风趣幽默的交互感。

3. 混合开发 (Hybrid) 实战
通过 Capacitor 将 Web 代码转化为原生的安卓 APK。

成果：独立完成了从 npm build -> npx cap sync -> Android Studio 打包的全流程。

突破：克服了 Gradle 同步失败、JDK 版本冲突等一系列环境“大坑”，最终在真机上成功安装并流畅运行。
遇到的问题：
ai功能在使用中似乎总是用不了，原因目前还不清楚，需要排查
日历功能很弱，因为没有数据库功能
未来迭代方向
[ ] 接入手机摄像头，实现“拍照识菜”功能（利用 Gemini 多模态视觉能力）。

[ ] 增加本地持久化存储，记录用户的口味偏好。

[ ] 引入地图 API，实现一键搜索周边真实餐厅。
