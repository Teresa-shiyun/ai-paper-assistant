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

function getTodayKey() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `usage_${yyyy}-${mm}-${dd}`;
}

export default function ToolPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const key = getTodayKey();
    const saved = localStorage.getItem(key);
    setUsageCount(saved ? Number(saved) : 0);
  }, []);

  function updateUsage(newCount: number) {
    const key = getTodayKey();
    localStorage.setItem(key, String(newCount));
    setUsageCount(newCount);
  }

  async function handleSummarize() {
    if (!text.trim() && !file) {
      setError("Please paste text or upload a PDF first.");
      return;
    }

    if (usageCount >= DAILY_LIMIT) {
      setError("Free trial used. Upgrade to Pro for unlimited access.");
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

      const data = await res.json();

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
      setCopied(`${label} copied`);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("Copy failed");
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
            <h1 className="text-3xl font-bold text-slate-900">
              AI Paper Assistant
            </h1>
            <p className="mt-2 text-slate-600">
              Upload PDF or paste academic text to get summary, notes, and essay outline.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Free Trial: 2 AI uses per day · Remaining today: {remaining}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleUseSample}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Use Sample
            </button>
            <button
              onClick={handleClear}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={() => alert("Pro payment coming soon")}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Upload PDF
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
              placeholder="Paste academic text here"
              className="h-[320px] w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-500"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">Characters: {text.length}</p>

              <button
                onClick={handleSummarize}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || isLimitReached}
              >
                {loading
                  ? "AI working..."
                  : isLimitReached
                  ? "Limit Reached"
                  : "Summarize"}
              </button>
            </div>

            {file && (
              <p className="mt-3 text-sm text-slate-600">PDF selected: {file.name}</p>
            )}

            {error && <div className="mt-4 text-red-600">{error}</div>}
            {copied && <div className="mt-4 text-emerald-600">{copied}</div>}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <button
                  onClick={() => copyText("Summary", summaryText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!summaryText}
                >
                  Copy
                </button>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                {result?.summary || "Your summary will appear here"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Key Points</h3>
              {result?.keyPoints?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.keyPoints.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Key points will appear here</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Difficult Terms</h3>
              {result?.difficultTerms?.length ? (
                <div className="space-y-3">
                  {result.difficultTerms.map((t, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{t.term}</p>
                      <p className="mt-1 text-sm text-slate-700">EN: {t.explanation_en}</p>
                      <p className="mt-1 text-sm text-slate-700">中文: {t.explanation_zh}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Difficult terms will appear here</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-900">Chinese Explanation</h3>
              <p className="text-sm leading-7 text-slate-700">
                {result?.translation_zh || "Chinese explanation will appear here"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Study Notes</h3>
                <button
                  onClick={() => copyText("Study Notes", notesText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!notesText}
                >
                  Copy
                </button>
              </div>
              {result?.studyNotes?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.studyNotes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Study notes will appear here</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Essay Outline</h3>
                <button
                  onClick={() => copyText("Essay Outline", outlineText)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  disabled={!outlineText}
                >
                  Copy
                </button>
              </div>
              {result?.essayOutline?.length ? (
                <ul className="space-y-2 text-sm text-slate-700">
                  {result.essayOutline.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Essay outline will appear here</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}