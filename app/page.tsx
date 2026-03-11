"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const copy = {
  en: {
    badge: "AI Tool for International Students",
    title1: "Read papers faster.",
    title2: "Write essays smarter.",
    desc: "Upload a PDF or paste academic text to get summary, parallel translation, notes, essay outline, and draft in one place.",
    tryNow: "Try it now",
    pricing: "View Pricing",
    featuresTitle: "Everything students need in one tool",
    freeTitle: "Free Trial",
    freeDesc: "Best for first-time users.",
    proTitle: "Pro",
    proDesc: "Unlimited academic workflow support.",
    feature1: "PDF + OCR reading",
    feature2: "Parallel translation",
    feature3: "Summary + notes",
    feature4: "Essay outline + draft",
    feature5: "Difficult terms explained",
    feature6: "Built for bilingual students",
    langBtn: "中文",
  },
  zh: {
    badge: "为留学生打造的 AI 工具",
    title1: "更快读懂论文。",
    title2: "更聪明写 Essay。",
    desc: "上传 PDF 或粘贴学术文本，一站式获得总结、左右对照翻译、学习笔记、Essay 大纲和草稿。",
    tryNow: "立即体验",
    pricing: "查看价格",
    featuresTitle: "留学生真正需要的功能都在这里",
    freeTitle: "免费试用",
    freeDesc: "适合第一次使用的用户。",
    proTitle: "Pro 会员",
    proDesc: "无限量学术辅助功能。",
    feature1: "PDF + OCR 识别",
    feature2: "左右对照翻译",
    feature3: "总结 + 笔记",
    feature4: "Essay 大纲 + 草稿",
    feature5: "难词解释",
    feature6: "双语友好",
    langBtn: "EN",
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
        <nav className="mb-14 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              AI Paper Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Read papers faster. Write essays smarter.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleLang}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t.langBtn}
            </button>
            <Link
              href="/tool"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {t.tryNow}
            </Link>
          </div>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              {t.badge}
            </div>

            <h2 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              {t.title1}
              <br />
              {t.title2}
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {t.desc}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/tool"
                className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
              >
                {t.tryNow}
              </Link>

              <a
                href="#pricing"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.pricing}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Preview</p>
                <h3 className="text-xl font-bold text-slate-900">
                  AI Paper Assistant
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Free Trial
              </span>
            </div>

            <div className="space-y-4">
              {[t.feature1, t.feature2, t.feature3, t.feature4, t.feature5, t.feature6].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h3 className="mb-8 text-3xl font-bold text-slate-900">
            {t.featuresTitle}
          </h3>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[t.feature1, t.feature2, t.feature3, t.feature4, t.feature5, t.feature6].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-lg font-semibold text-slate-900">{item}</p>
                </div>
              )
            )}
          </div>
        </section>

        <section id="pricing" className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.freeTitle}
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">£0</h3>
            <p className="mt-3 text-slate-600">{t.freeDesc}</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• 2 AI uses per day</li>
              <li>• Text + PDF upload</li>
              <li>• Summary + translation + notes</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              {t.proTitle}
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">£5 / month</h3>
            <p className="mt-3 text-slate-600">{t.proDesc}</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• Unlimited AI analysis</li>
              <li>• PDF + OCR workflow</li>
              <li>• Full essay draft support</li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}