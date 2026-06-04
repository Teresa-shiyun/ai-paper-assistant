# AI Paper Assistant / AI 论文阅读助手

## Overview / 项目简介

AI Paper Assistant is a Next.js app for academic reading support. It focuses on two student workflows: summarising paper text and translating PDF content into a side-by-side reading view.

AI Paper Assistant 是一个论文阅读辅助工具，主要面向学生阅读英文论文时的常见需求。当前重点有两个流程：对论文文本进行总结，以及把 PDF 内容翻译成中英对照阅读视图。

## Why I Built It / 项目背景

I built this as a personal study tool for reading academic papers more efficiently. The use case is simple: understand the main idea, collect key points, explain difficult terms and reduce the friction of reading English papers.

我做这个项目是为了提高阅读英文论文时的效率。它关注的是比较具体的学习场景：快速理解论文主旨、整理关键点、解释难词，并通过中英对照降低阅读门槛。

## Features / 功能

- Summarise pasted text or uploaded PDF content.
- Generate study notes, key points and difficult-term explanations.
- Use Mistral OCR routes for PDF text extraction.
- Use DeepSeek-compatible API routes for summarisation and translation.
- Use Cloudflare R2-compatible storage routes for the PDF translation flow.
- Support English and Chinese UI text.
- Export generated notes as Markdown.

- 支持对粘贴文本或上传 PDF 内容进行总结。
- 生成学习笔记、关键点和难词解释。
- 通过 Mistral OCR 路由提取 PDF 文本。
- 通过兼容 OpenAI SDK 的 DeepSeek API 路由进行总结和翻译。
- 使用 Cloudflare R2 兼容存储流程处理 PDF 翻译相关文件。
- 支持英文和中文界面文案。
- 支持把生成的学习笔记导出为 Markdown。

## Tech Stack / 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- OpenAI SDK with DeepSeek base URL
- Mistral OCR API
- AWS SDK for Cloudflare R2-compatible storage
- Tesseract.js and PDF parsing utilities

## Current Status / 当前状态

Working prototype. The main pages and API routes are implemented. The frontend can open without credentials, but live summarisation, OCR, PDF translation and R2 upload require valid environment variables.

当前是可运行原型。主要页面和 API 路由已经实现；前端页面可以在没有密钥的情况下打开，但真正执行总结、OCR、PDF 翻译和 R2 上传时需要配置环境变量。

## How to Run / 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

Required for full functionality:

```bash
DEEPSEEK_API_KEY=
MISTRAL_API_KEY=
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

If these values are empty, the UI still loads, but the related API routes will return missing-configuration errors.

如果这些值为空，页面仍然可以打开，但与总结、OCR、翻译和 R2 上传相关的接口会返回配置缺失错误。真实 API key 不应提交到仓库。

## Screenshots / 项目截图

![AI Paper Assistant landing page](docs/assets/ai-paper-assistant-home.png)

## Limitations / 当前限制

- No built-in demo mode for summarisation without API keys yet.
- OCR quality depends on the uploaded PDF and external OCR response.
- No saved reading history or account system.
- File-size and usage-limit handling can be improved.

- 目前还没有无需 API key 的总结 demo 模式。
- OCR 效果取决于 PDF 质量和外部 OCR 接口返回。
- 暂时没有阅读历史保存或账号系统。
- 文件大小限制和使用次数提示还可以继续完善。

## Roadmap / 后续计划

- Add a demo mode that works without external API keys.
- Add tests for API routes and upload error handling.
- Improve fallback handling for scanned or low-quality PDFs.
- Save generated notes locally for later review.
- Add clearer file-size validation before upload.

- 增加不依赖外部 API key 的 demo 模式。
- 为 API 路由和上传错误处理补充测试。
- 改进扫描版或低质量 PDF 的 fallback。
- 将生成的笔记保存在本地，方便后续复习。
- 上传前增加更清楚的文件大小校验。

## What I Learned / 我的收获

This project helped me understand the practical parts of document AI apps. File upload, OCR, model calls, object storage and user-facing error handling all need to work together.

这个项目让我更熟悉文档类 AI 应用的实际流程：文件上传、OCR、模型调用、对象存储和错误提示需要一起配合，用户体验才会比较顺。

## License / 许可证

MIT. See [LICENSE](LICENSE).
