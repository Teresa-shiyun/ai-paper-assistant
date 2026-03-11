"use client";

import { useEffect, useState } from "react";

type DifficultTerm = {
  term: string;
  explanation_en: string;
  explanation_zh: string;
};

type PaperSection = {
  section: string;
  content: string;
};

type ResultData = {
  summary: string;
  keyPoints: string[];
  difficultTerms: DifficultTerm[];
  translation_zh: string;
  studyNotes: string[];
  essayOutline: string[];
  paperSections: PaperSection[];
  essayDraft: string;
};

const DAILY_LIMIT = 2;

const sampleText = `Artificial intelligence is transforming education by helping students analyze complex academic papers more efficiently. Many international students struggle with dense academic language and unfamiliar terminology when reading research papers. AI-powered summarization tools can automatically extract key ideas, highlight important concepts, and provide simplified explanations of difficult terms. By using these tools, students can save time, improve comprehension, and focus on understanding the most important contributions of a research paper.`;

const labels = {
  en: {
    title: "AI Document Summarizer",
    subtitle:
      "Upload PDF or paste academic text. Results appear directly below the input area.",
    uploadPdf: "Upload PDF",
    placeholder: "Paste academic text here",
    summarize: "Summarize",
    working: "AI working...",
    useSample: "Use Sample",
    clear: "Clear",
    upgrade: "Upgrade to Pro",
    markdown: "Copy All as Markdown",
    langBtn: "中文",
    remaining: "Remaining today",
    freeTrial: "Free Trial: 2 AI uses per day",
    chars: "Characters",
    pdfSelected: "PDF selected",
    parsing: "Reading PDF with OCR...",
    pdfFailed:
      "This PDF could not be read. Please try another PDF or paste the text directly.",
    noText: "Please paste text or upload a PDF first.",
    freeUsed: "Free trial used. Upgrade to Pro for unlimited access.",
    invalid: "Server returned an invalid response. Please try again.",
    copied: "copied",
    copyFailed: "Copy failed",
    markdownCopied: "Markdown copied",
    summary: "Summary",
    keyPoints: "Key Points",
    difficultTerms: "Difficult Terms",
    chineseExplanation: "Chinese Explanation",
    studyNotes: "Study Notes",
    essayOutline: "Essay Outline",
    paperSections: "Paper Structure",
    essayDraft: "Essay Draft",
    copy: "Copy",
    summaryPlaceholder: "Your summary will appear here",
    keyPointsPlaceholder: "Key points will appear here",
    difficultTermsPlaceholder: "Difficult terms will appear here",
    chineseExplanationPlaceholder: "Chinese explanation will appear here",
    studyNotesPlaceholder: "Study notes will appear here",
    essayOutlinePlaceholder: "Essay outline will appear here",
    paperSectionsPlaceholder: "Paper section analysis will appear here",
    essayDraftPlaceholder: "Essay draft will appear here",
    proSoon: "Pro payment coming soon",
  },
  zh: {
    title: "AI 文档总结",
    subtitle: "上传 PDF 或粘贴学术文本，结果会直接显示在输入框下方。",
    uploadPdf: "上传 PDF",
    placeholder: "请在这里粘贴学术文本",
    summarize: "开始总结",
    working: "AI 正在处理中...",
    useSample: "使用示例",
    clear: "清空",
    upgrade: "升级 Pro",
    markdown: "复制全部 Markdown",
    langBtn: "EN",
    remaining: "今日剩余",
    freeTrial: "免费试用：每天 2 次 AI 使用机会",
    chars: "字符数",
    pdfSelected: "已选择 PDF",
    parsing: "正在用 OCR 读取 PDF...",
    pdfFailed: "这个 PDF 无法读取，请尝试其他 PDF 或直接粘贴文本。",
    noText: "请先粘贴文本或上传 PDF。",
    freeUsed: "今日免费次数已用完，升级 Pro 可无限使用。",
    invalid: "服务器返回异常，请稍后再试。",
    copied: "已复制",
    copyFailed: "复制失败",
    markdownCopied: "Markdown 已复制",
    summary: "总结",
    keyPoints: "关键点",
    difficultTerms: "难词解释",
    chineseExplanation: "中文解释",
    studyNotes: "学习笔记",
    essayOutline: "Essay 大纲",
    paperSections: "论文结构",
    essayDraft: "Essay 草稿",
    copy: "复制",
    summaryPlaceholder: "这里会显示总结内容",
    keyPointsPlaceholder: "这里会显示关键点",
    difficultTermsPlaceholder: "这里会显示难词解释",
    chineseExplanationPlaceholder: "这里会显示中文解释",
    studyNotesPlaceholder: "这里会显示学习笔记",
    essayOutlinePlaceholder: "这里会显示 Essay 大纲",
    paperSectionsPlaceholder: "这里会显示论文结构分析",
    essayDraftPlaceholder: "这里会显示 Essay 草稿",
    proSoon: "Pro 付费功能即将上线",
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
  const [usageCount, setUsageCount] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

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
    setCopied("");

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", selectedFile);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: form,
      });

      const raw = await res.text();
      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw);
      }

      if (!res.ok) {
        throw new Error(data.error || t.pdfFailed);
      }

      setText(data.text || "");
    } catch (err: any) {
      setText("");
      setError(err.message || t.pdfFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
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
    setCopied("");

    try {
      const res = await fetch("/api/summarize", {
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

  function buildMarkdown() {
    if (!result) return "";

    const keyPoints =
      result.keyPoints?.map((item) => `- ${item}`).join("\n") || "";

    const difficultTerms =
      result.difficultTerms
        ?.map(
          (item) =>
            `- **${item.term}**\n  - EN: ${item.explanation_en}\n  - 中文: ${item.explanation_zh}`
        )
        .join("\n") || "";

    const notes =
      result.studyNotes?.map((item) => `- ${item}`).join("\n") || "";

    const outline =
      result.essayOutline?.map((item) => `- ${item}`).join("\n") || "";

    const sections =
      result.paperSections
        ?.map((item) => `- **${item.section}**: ${item.content}`)
        .join("\n") || "";

    return `# ${t.title}

## ${t.summary}
${result.summary || ""}

## ${t.keyPoints}
${keyPoints}

## ${t.difficultTerms}
${difficultTerms}

## ${t.chineseExplanation}
${result.translation_zh || ""}

## ${t.studyNotes}
${notes}

## ${t.essayOutline}
${outline}

## ${t.paperSections}
${sections}

## ${t.essayDraft}
${result.essayDraft || ""}
`;
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(buildMarkdown());
      setCopied(t.markdownCopied);
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
  const draftText = result?.essayDraft || "";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-5xl">
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
              <button
                onClick={copyMarkdown}
                disabled={!result}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                {t.markdown}
              </button>
              <button
                onClick={() => alert(t.proSoon)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t.upgrade}
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
            className="h-[300px] w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {t.chars}: {text.length}
            </p>

            <button
              onClick={handleSummarize}
              disabled={loading || isLimitReached}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.working : isLimitReached ? t.freeUsed : t.summarize}
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
          {copied && <div className="mt-4 text-emerald-600">{copied}</div>}
        </div>

        <div className="mt-8 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">{t.summary}</h3>
              <button
                onClick={() => copyText(t.summary, summaryText)}
                disabled={!summaryText}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
                {result.keyPoints.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{t.keyPointsPlaceholder}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">
              {t.difficultTerms}
            </h3>
            {result?.difficultTerms?.length ? (
              <div className="space-y-3">
                {result.difficultTerms.map((item, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{item.term}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      EN: {item.explanation_en}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      中文: {item.explanation_zh}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {t.difficultTermsPlaceholder}
              </p>
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
                disabled={!notesText}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {t.copy}
              </button>
            </div>
            {result?.studyNotes?.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {result.studyNotes.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                {t.studyNotesPlaceholder}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">{t.essayOutline}</h3>
              <button
                onClick={() => copyText(t.essayOutline, outlineText)}
                disabled={!outlineText}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {t.copy}
              </button>
            </div>
            {result?.essayOutline?.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {result.essayOutline.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                {t.essayOutlinePlaceholder}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">
              {t.paperSections}
            </h3>
            {result?.paperSections?.length ? (
              <div className="space-y-3">
                {result.paperSections.map((item, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">
                      {item.section}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {t.paperSectionsPlaceholder}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">{t.essayDraft}</h3>
              <button
                onClick={() => copyText(t.essayDraft, draftText)}
                disabled={!draftText}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {t.copy}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {result?.essayDraft || t.essayDraftPlaceholder}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}