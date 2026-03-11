"use client";

import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";

type ParallelItem = {
  en: string;
  zh: string;
};

type TranslateResult = {
  parallelTranslation: ParallelItem[];
  summary_zh: string;
  keywords: string[];
};

const DAILY_LIMIT = 2;

const sampleText = `Artificial intelligence is transforming education by helping students analyze complex academic papers more efficiently. Many international students struggle with dense academic language and unfamiliar terminology when reading research papers. AI-powered summarization tools can automatically extract key ideas, highlight important concepts, and provide simplified explanations of difficult terms.`;

const labels = {
  en: {
    title: "AI PDF Translator",
    subtitle:
      "Upload PDF or paste academic text to get side-by-side translation.",
    uploadPdf: "Upload PDF",
    placeholder: "Paste academic text here",
    translate: "Translate",
    working: "AI working...",
    useSample: "Use Sample",
    clear: "Clear",
    langBtn: "中文",
    remaining: "Remaining today",
    freeTrial: "Free Trial: 2 AI uses per day",
    chars: "Characters",
    pdfSelected: "PDF selected",
    parsing: "Parsing PDF...",
    pdfFailed:
      "This PDF could not be read. Please try another PDF or paste the text directly.",
    noText: "Please paste text or upload a PDF first.",
    freeUsed: "Free trial used. Upgrade to Pro for unlimited access.",
    invalid: "Server returned an invalid response. Please try again.",
    original: "Original",
    translated: "Translated",
    summaryZh: "Chinese Summary",
    keywords: "Keywords",
    summaryPlaceholder: "Chinese summary will appear here",
    parallelPlaceholder: "Parallel translation will appear here",
  },
  zh: {
    title: "AI 文档翻译",
    subtitle: "上传 PDF 或粘贴学术文本，获得左右对照翻译。",
    uploadPdf: "上传 PDF",
    placeholder: "请在这里粘贴学术文本",
    translate: "开始翻译",
    working: "AI 正在处理中...",
    useSample: "使用示例",
    clear: "清空",
    langBtn: "EN",
    remaining: "今日剩余",
    freeTrial: "免费试用：每天 2 次 AI 使用机会",
    chars: "字符数",
    pdfSelected: "已选择 PDF",
    parsing: "正在解析 PDF...",
    pdfFailed: "这个 PDF 无法读取，请尝试其他 PDF 或直接粘贴文本。",
    noText: "请先粘贴文本或上传 PDF。",
    freeUsed: "今日免费次数已用完，升级 Pro 可无限使用。",
    invalid: "服务器返回异常，请稍后再试。",
    original: "原文",
    translated: "翻译",
    summaryZh: "中文总结",
    keywords: "关键词",
    summaryPlaceholder: "这里会显示中文总结",
    parallelPlaceholder: "这里会显示左右对照翻译",
  },
};

function getTodayKey() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `translate_usage_${yyyy}-${mm}-${dd}`;
}

async function ocrCanvas(canvas: HTMLCanvasElement) {
  const worker = await createWorker("eng");
  const {
    data: { text },
  } = await worker.recognize(canvas);
  await worker.terminate();
  return text;
}

async function extractPDFText(file: File) {
  const pdfjsLib = await import("pdfjs-dist");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const textContent = await page.getTextContent();
    const strings = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .filter(Boolean);

    const pageText = strings.join(" ");

    if (pageText.trim().length > 20) {
      fullText += pageText + "\n\n";
      continue;
    }

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const ocrText = await ocrCanvas(canvas);
    fullText += ocrText + "\n\n";
  }

  return fullText;
}

export default function TranslatePage() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [error, setError] = useState("");

  const t = labels[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("ui_lang");
    if (savedLang === "en" || savedLang === "zh") setLang(savedLang);

    const savedUsage = localStorage.getItem(getTodayKey());
    setUsageCount(savedUsage ? Number(savedUsage) : 0);
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("ui_lang", next);
  }

  function updateUsage(newCount: number) {
    localStorage.setItem(getTodayKey(), String(newCount));
    setUsageCount(newCount);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setError("");

    try {
      setLoading(true);
      const extracted = await extractPDFText(selectedFile);

      if (!extracted || extracted.trim().length < 50) {
        throw new Error("PDF parse failed");
      }

      setText(extracted);
    } catch {
      setText("");
      setError(t.pdfFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleTranslate() {
    if (!text.trim()) {
      setError(t.noText);
      return;
    }

    if (usageCount >= DAILY_LIMIT) {
      setError(t.freeUsed);
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const raw = await res.text();
      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(t.invalid);
      }

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult(data);
      updateUsage(usageCount + 1);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleUseSample() {
    setText(sampleText);
    setFile(null);
    setResult(null);
    setError("");
  }

  function handleClear() {
    setText("");
    setFile(null);
    setResult(null);
    setError("");
  }

  const remaining = Math.max(0, DAILY_LIMIT - usageCount);
  const isLimitReached = usageCount >= DAILY_LIMIT;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
              <p className="mt-2 max-w-3xl text-slate-600">{t.subtitle}</p>
              <p className="mt-2 text-sm text-slate-500">
                {t.freeTrial} · {t.remaining}: {remaining}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleLang}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                {t.langBtn}
              </button>
              <button
                onClick={handleUseSample}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                {t.useSample}
              </button>
              <button
                onClick={handleClear}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-slate-700">
            {t.uploadPdf}
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            className="h-[260px] w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {t.chars}: {text.length}
            </p>

            <button
              onClick={handleTranslate}
              disabled={loading || isLimitReached}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t.working
                : isLimitReached
                ? t.freeUsed
                : t.translate}
            </button>
          </div>

          {loading && file && (
            <p className="mt-3 text-sm text-slate-600">{t.parsing}</p>
          )}

          {file && !loading && (
            <p className="mt-3 text-sm text-slate-600">
              {t.pdfSelected}: {file.name}
            </p>
          )}

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {t.original}
            </h3>

            {result?.parallelTranslation?.length ? (
              <div className="space-y-4 text-sm leading-7 text-slate-700">
                {result.parallelTranslation.map((item, i) => (
                  <p key={i}>{item.en}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t.parallelPlaceholder}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {t.translated}
            </h3>

            {result?.parallelTranslation?.length ? (
              <div className="space-y-4 text-sm leading-7 text-slate-700">
                {result.parallelTranslation.map((item, i) => (
                  <p key={i}>{item.zh}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t.parallelPlaceholder}</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">{t.summaryZh}</h3>
            <p className="text-sm leading-7 text-slate-700">
              {result?.summary_zh || t.summaryPlaceholder}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">{t.keywords}</h3>
            {result?.keywords?.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {result.keywords.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{t.summaryPlaceholder}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}