"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const copy = {
  en: {
    title: "AI Paper Assistant",
    subtitle:
      "Choose your workflow: summarize papers or translate them side by side.",
    summarizeTitle: "Summarize Documents",
    summarizeDesc:
      "Get summary, key points, difficult terms, study notes, essay outline, and essay draft.",
    translateTitle: "Translate Documents",
    translateDesc:
      "Read English papers with side-by-side Chinese translation and OCR support.",
    goSummarize: "Go to Summarizer",
    goTranslate: "Go to Translator",
    langBtn: "中文",
    badge: "For International Students",
  },
  zh: {
    title: "AI 论文助手",
    subtitle: "先选择你的用途：总结文档，或者左右对照翻译文档。",
    summarizeTitle: "总结文档",
    summarizeDesc:
      "获得总结、关键点、难词解释、学习笔记、Essay 大纲和 Essay 草稿。",
    translateTitle: "翻译文档",
    translateDesc: "支持 OCR，适合英语论文左右对照阅读和中文理解。",
    goSummarize: "进入总结工具",
    goTranslate: "进入翻译工具",
    langBtn: "EN",
    badge: "为留学生打造",
  },
};

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "zh">("en");

  useEffect(() => {
    const saved = localStorage.getItem("ui_lang");
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("ui_lang", next);
  }

  const t = copy[lang];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              {t.badge}
            </div>
            <h1 className="text-4xl font-bold text-slate-900">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{t.subtitle}</p>
          </div>

          <button
            onClick={toggleLang}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.langBtn}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              {t.summarizeTitle}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">{t.summarizeDesc}</p>

            <div className="mt-8">
              <Link
                href="/tool"
                className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                {t.goSummarize}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              {t.translateTitle}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">{t.translateDesc}</p>

            <div className="mt-8">
              <Link
                href="/translate"
                className="inline-flex rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
              >
                {t.goTranslate}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}