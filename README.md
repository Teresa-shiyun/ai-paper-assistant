# AI Paper Assistant / AI 论文阅读助手

## Overview / 项目简介

AI Paper Assistant is a Next.js app for academic reading support. It has two main workflows: summarising uploaded or pasted paper text, and translating PDF pages into a side-by-side reading view.

AI 论文阅读助手是一个用于辅助阅读英文论文的 Next.js 项目。项目目前包含两个主要流程：对上传或粘贴的论文内容进行总结，以及将 PDF 页面翻译成左右对照的阅读视图。

## Why I Built This / 项目背景

I built this as a personal study tool for reading academic papers more efficiently. The focus is on common student tasks: understanding the main idea, collecting key points, explaining difficult terms, and reading English papers with Chinese support.

这个项目是我为提高论文阅读效率做的个人学习工具。它关注留学生在读论文时常见的需求：快速理解主旨、整理关键点、解释难词，并通过中英对照降低阅读门槛。

## My Contributions / 我的工作

- Built the Next.js frontend with English and Chinese UI copy.
- Implemented a summariser page for pasted text and uploaded PDFs.
- Added PDF OCR routes using Mistral OCR.
- Added DeepSeek-compatible API routes for summarisation and translation.
- Added Cloudflare R2 upload / signed URL routes for PDF translation flow.
- Designed export-to-Markdown behaviour for generated study notes.

- 使用 Next.js 搭建前端，并支持英文/中文界面文案。
- 实现文本粘贴和 PDF 上传后的文档总结页面。
- 使用 Mistral OCR 接口处理 PDF 文本提取。
- 通过兼容 OpenAI SDK 的接口调用 DeepSeek，用于总结和翻译。
- 实现 Cloudflare R2 上传和签名 URL 流程，用于 PDF 翻译页面。
- 支持将生成的学习笔记导出为 Markdown。

## Tech Stack / 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- OpenAI SDK with DeepSeek base URL
- Mistral OCR API
- AWS SDK for Cloudflare R2-compatible storage
- Tesseract.js / pdf parsing utilities

## Features / 主要功能

- Summarise academic text into summary, key points and study notes.
- Explain difficult terms from the input text.
- Generate an essay outline and draft-style notes for study use.
- Upload PDF files for OCR-based text extraction.
- Translate PDF content into a side-by-side Chinese reading view.
- Switch UI language between English and Chinese.

## Results / 项目成果

The current version implements the main UI and API routes. It can run locally, but live summarisation, OCR and PDF translation require valid API keys and R2 configuration.

当前版本已经完成主要页面和 API 路由。项目可以本地启动，但实时总结、OCR 和 PDF 翻译需要配置有效的 API key 和 R2 存储参数。

## How to Run / 如何运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

Required environment variables for full functionality:

```bash
DEEPSEEK_API_KEY=
MISTRAL_API_KEY=
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

If these variables are not set, the frontend still opens, but the related API routes will return missing-configuration errors.

如果没有配置这些环境变量，前端页面仍然可以打开，但总结、OCR、翻译和 R2 上传相关接口会报配置缺失。

## Screenshots / Results Preview

![AI Paper Assistant landing page](docs/assets/ai-paper-assistant-home.png)

## Future Improvements / 后续改进

- Add a small demo mode that works without external API keys.
- Add tests for API routes and PDF upload error handling.
- Improve OCR fallback for scanned or low-quality PDFs.
- Add clearer usage limits and file-size validation.
- Save generated notes locally for later review.

## What I Learned / 我的收获

This project helped me understand the practical parts of document AI apps: file upload, OCR, model calls, object storage and user-facing error handling all need to work together.

这个项目让我更熟悉文档类 AI 应用的实际流程：上传文件、OCR、模型调用、对象存储和错误提示都需要配合好，用户体验才会顺畅。
