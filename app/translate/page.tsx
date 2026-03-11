"use client";

import { useEffect, useMemo, useState } from "react";

type PageItem = {
  page: number;
  original: string;
  zh: string;
};

type TranslatePdfResult = {
  totalPages: number;
  pages: PageItem[];
};

const DAILY_LIMIT = 2;

const labels = {
  en: {
    title: "AI PDF Translator",
    subtitle: "Left: original PDF. Right: translated page.",
    uploadPdf: "Upload PDF",
    processing: "Uploading and translating PDF...",
    selected: "PDF selected",
    translate: "Translate PDF",
    useSample: "Use Sample",
    clear: "Clear",
    langBtn: "中文",
    remaining: "Remaining today",
    freeTrial: "Free Trial: 2 AI uses per day",
    noFile: "Please upload a PDF first.",
    limit: "Free trial used. Upgrade to Pro for unlimited access.",
    page: "Page",
    prev: "Previous",
    next: "Next",
    translated: "Chinese Translation",
    originalText: "Extracted Text",
    placeholder: "Translation will appear here",
    sampleMode: "Sample mode does not apply on this page. Please upload a PDF.",
  },
  zh: {
    title: "AI PDF 翻译",
    subtitle: "左边原始 PDF，右边当前页翻译。",
    uploadPdf: "上传 PDF",
    processing: "正在上传并翻译 PDF...",
    selected: "已选择 PDF",
    translate: "开始翻译",
    useSample: "使用示例",
    clear: "清空",
    langBtn: "EN",
    remaining: "今日剩余",
    freeTrial: "免费试用：每天 2 次 AI 使用机会",
    noFile: "请先上传 PDF。",
    limit: "今日免费次数已用完，升级 Pro 可无限使用。",
    page: "第",
    prev: "上一页",
    next: "下一页",
    translated: "中文翻译",
    originalText: "提取文本",
    placeholder: "这里会显示翻译内容",
    sampleMode: "这个页面不使用示例文本，请直接上传 PDF。",
  },
};

function getTodayKey() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `translate_pdf_usage_${yyyy}-${mm}-${dd}`;
}

export default function TranslatePage() {
  const [lang, setLang] = useState<"en" | "zh">("zh");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState("");
  const [result, setResult] = useState<TranslatePdfResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  async function handleUploadAndTranslate() {
    if (!file) {
      setError(t.noFile);
      return;
    }

    if (usageCount >= DAILY_LIMIT) {
      setError(t.limit);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setCurrentPage(1);

      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const key = uploadData.key as string;
      setFileKey(key);

      const translateRes = await fetch("/api/translate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const translateData = await translateRes.json();

      if (!translateRes.ok) {
        throw new Error(translateData.error || "Translation failed");
      }

      setResult(translateData);
      updateUsage(usageCount + 1);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setFile(null);
    setFileKey("");
    setResult(null);
    setCurrentPage(1);
    setError("");
  }

  const currentItem = useMemo(() => {
    if (!result?.pages?.length) return null;
    return result.pages.find((p) => p.page === currentPage) || result.pages[0];
  }, [result, currentPage]);

  const pdfSrc = fileKey ? `/api/file/${fileKey}` : "";

  const remaining = Math.max(0, DAILY_LIMIT - usageCount);
  const totalPages = result?.totalPages || 0;

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
                onClick={() => alert(t.sampleMode)}
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

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-slate-700">
            {t.uploadPdf}
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setError("");
              setResult(null);
              setFileKey("");
              setCurrentPage(1);
            }}
            className="mb-4 block w-full text-sm"
          />

          {file && (
            <p className="mb-4 text-sm text-slate-600">
              {t.selected}: {file.name}
            </p>
          )}

          <button
            onClick={handleUploadAndTranslate}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? t.processing : t.translate}
          </button>

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {pdfSrc ? (
              <iframe
                src={pdfSrc}
                className="h-[900px] w-full rounded-xl border border-slate-200"
                title="PDF Viewer"
              />
            ) : (
              <div className="flex h-[900px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
                PDF
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {t.translated}
              </h3>

              {totalPages > 0 && (
                <div className="text-sm text-slate-500">
                  {lang === "zh" ? `${t.page} ${currentPage} / ${totalPages} 页` : `${t.page} ${currentPage} / ${totalPages}`}
                </div>
              )}
            </div>

            {totalPages > 0 && (
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
                >
                  {t.prev}
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
                >
                  {t.next}
                </button>
              </div>
            )}

            <div className="mb-8">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {currentItem?.zh || t.placeholder}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="mb-3 font-semibold text-slate-900">
                {t.originalText}
              </h4>
              <div className="max-h-[280px] overflow-auto rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {currentItem?.original || ""}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}