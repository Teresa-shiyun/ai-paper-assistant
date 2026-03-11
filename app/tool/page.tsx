"use client";

import { useEffect, useState } from "react";

type DifficultTerm = {
  term: string;
  explanation_en: string;
  explanation_zh: string;
};

type ResultData = {
  summary: string;
  keyPoints: string[];
  difficultTerms: DifficultTerm[];
  translation_zh: string;
  studyNotes: string[];
  essayOutline: string[];
};

const sampleText = `Artificial intelligence is transforming education by helping students analyze complex academic papers more efficiently. Many international students struggle with dense academic language and unfamiliar terminology when reading research papers. AI-powered summarization tools can automatically extract key ideas, highlight important concepts, and provide simplified explanations of difficult terms. By using these tools, students can save time, improve comprehension, and focus on understanding the most important contributions of a research paper.`;

const DAILY_LIMIT = 2;

const labels = {
  en: {
    title: "AI Paper Assistant",
    subtitle:
      "Upload PDF or paste academic text to get summary, notes, and essay outline.",
    freeTrial: "Free Trial: 2 AI uses per day",
    remaining: "Remaining today",
    uploadPdf: "Upload PDF",
    pastePlaceholder: "Paste academic text here",
    useSample: "Use Sample",
    clear: "Clear",
    upgrade: "Upgrade to Pro",
    summarize: "Summarize",
    working: "AI working...",
    limitReached: "Limit Reached",
    pdfSelected: "PDF selected",
    characters: "Characters",
    summary: "Summary",
    keyPoints: "Key Points",
    difficultTerms: "Difficult Terms",
    chineseExplanation: "Chinese Explanation",
    studyNotes: "Study Notes",
    essayOutline: "Essay Outline",
    copy: "Copy",
    summaryPlaceholder: "Your summary will appear here",
    keyPointsPlaceholder: "Key points will appear here",
    difficultTermsPlaceholder: "Difficult terms will appear here",
    chineseExplanationPlaceholder: "Chinese explanation will appear here",
    studyNotesPlaceholder: "Study notes will appear here",
    essayOutlinePlaceholder: "Essay outline will appear here",
    pasteOrUpload: "Please paste text or upload a PDF first.",
    freeUsed: "Free trial used. Upgrade to Pro for unlimited access.",
    invalidResponse: "Server returned an invalid response. Please try again.",
    copyFailed: "Copy failed",
    copied: "copied",
    proSoon: "Pro payment coming soon",
    switchLang: "中文",
  },
  zh: {
    title: "AI 论文助手",
    subtitle: "上传 PDF 或粘贴学术文本，一键生成总结、笔记和论文大纲。",
    freeTrial: "免费试用：每天 2 次 AI 使用机会",
    remaining: "今日剩余",
    uploadPdf: "上传 PDF",
    pastePlaceholder: "请在这里粘贴学术文本",
    useSample: "使用示例",
    clear: "清空",
    upgrade: "升级 Pro",
    summarize: "开始总结",
    working: "AI 正在处理中...",
    limitReached: "次数已满",
    pdfSelected: "已选择 PDF",
    characters: "字符数",
    summary: "总结",
    keyPoints: "关键点",
    difficultTerms: "难词解释",
    chineseExplanation: "中文解释",
    studyNotes: "学习笔记",
    essayOutline: "Essay 大纲",
    copy: "复制",
    summaryPlaceholder: "这里会显示总结内容",
    keyPointsPlaceholder: "这里会显示关键点",
    difficultTermsPlaceholder: "这里会显示难词解释",
    chineseExplanationPlaceholder: "这里会显示中文解释",
    studyNotesPlaceholder: "这里会显示学习笔记",
    essayOutlinePlaceholder: "这里会显示 Essay 大纲",
    pasteOrUpload: "请先粘贴文本或上传 PDF。",
    freeUsed: "今日免费次数已用完，升级 Pro 可无限使用。",
    invalidResponse: "服务器返回异常，请稍后再试。",
    copyFailed: "复制失败",
    copied: "已复制",
    proSoon: "Pro 付费功能即将上线",
    switchLang: "EN",
  },
};

function getTodayKey() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `usage_${yyyy}-${mm}-${dd}`;
}

export default function ToolPage() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState("");

  const t = labels[lang];

  useEffect(() => {
    const key = getTodayKey();
    const saved = localStorage.getItem(key);
    setUsageCount(saved ? Number(saved) : 0);

    const savedLang = localStorage.getItem("ui_lang");
    if (savedLang === "en" || savedLang === "zh") {
      setLang(savedLang);
    }
  }, []);

  function updateUsage(newCount: number) {
    const key = getTodayKey();
    localStorage.setItem(key, String(newCount));
    setUsageCount(newCount);
  }

  function toggleLang() {
    const nextLang = lang === "en" ? "zh" : "en";
    setLang(nextLang);
    localStorage.setItem("ui_lang", nextLang);
  }

  async function handleSummarize() {
    if (!text.trim() && !file) {
      setError(t.pasteOrUpload);
      return;
    }

    if (usageCount >= DAILY_LIMIT) {
      setError(t.freeUsed);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied("");

    try {
      let res: Response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        res = await fetch("/api/summarize", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });
      }

      const raw = await res.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(t.invalidResponse);
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
    setCopied("");
  }

  function handleClear() {
    setText("");
    setFile(null);
    setResult(null);
    setError("");
    setCopied("");
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} ${t.copied}`);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied(t.copyFailed);
      setTimeout(() => setCopied(""), 2000);
    }
  }

  const remaining = Math.max(0, DAILY_LIMIT - usageCount);
  const isLimitReached = usageCount >= DAILY_LIMIT;

  const summaryText = result?.summary || "";
  const notesText = result?.studyNotes?.join("\n") || "";
  const outlineText = result?.essayOutline?.join("\n") || "";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
            <p className="mt-2 text-slate-600">{t.subtitle}</p>
            <p className="mt-1 text-sm text-slate-500">
              {t.freeTrial} · {t.remaining}: {remaining}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleLang}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              {t.switchLang}
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
            <button
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={() => alert(t.proSoon)}
            >
              {t.upgrade}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              {t.uploadPdf}
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4 block w-full text-sm"
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.pastePlaceholder}
              className="h-[320px] w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                {t.characters}: {text.length}
              </p>

              <button
                onClick={handleSummarize}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || isLimitReached}
              >
                {loading
                  ? t.working
                  : isLimitReached
                  ? t.limitReached
                  : t.summarize}
              </button>
            </div>

            {file && (
              <p className="mt-3 text-sm text-slate-600">
                {t.pdfSelected}: {file.name}
              </p>
            )}

            {error && <div className="mt-4 text-red-600">{error}</div>}
            {copied && <div className="mt-4 text-emerald-600">{copied}</div>}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{t.summary}</h3>
                <button
                  onClick={() => copyText(t.summary, summaryText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!summaryText}
                >
                  {t.copy}
                </button>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                {result?.summary || t.summaryPlaceholder}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">{t.keyPoints}</h3>
              {result?.keyPoints?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.keyPoints.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t.keyPointsPlaceholder}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">{t.difficultTerms}</h3>
              {result?.difficultTerms?.length ? (
                <div className="space-y-3">
                  {result.difficultTerms.map((tItem, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{tItem.term}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        EN: {tItem.explanation_en}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        中文: {tItem.explanation_zh}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t.difficultTermsPlaceholder}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">
                {t.chineseExplanation}
              </h3>
              <p className="text-sm leading-7 text-slate-700">
                {result?.translation_zh || t.chineseExplanationPlaceholder}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{t.studyNotes}</h3>
                <button
                  onClick={() => copyText(t.studyNotes, notesText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!notesText}
                >
                  {t.copy}
                </button>
              </div>
              {result?.studyNotes?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.studyNotes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t.studyNotesPlaceholder}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{t.essayOutline}</h3>
                <button
                  onClick={() => copyText(t.essayOutline, outlineText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!outlineText}
                >
                  {t.copy}
                </button>
              </div>
              {result?.essayOutline?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.essayOutline.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t.essayOutlinePlaceholder}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}