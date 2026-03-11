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
};

const sampleText = `Artificial intelligence is transforming education by helping students analyze complex academic papers more efficiently. Many international students struggle with dense academic language and unfamiliar terminology when reading research papers. AI-powered summarization tools can automatically extract key ideas, highlight important concepts, and provide simplified explanations of difficult terms. By using these tools, students can save time, improve comprehension, and focus on understanding the most important contributions of a research paper.`;

// 免费次数改成 2
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
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);

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
    if (!text.trim()) {
      setError("Please paste some academic text first.");
      return;
    }

    if (usageCount >= DAILY_LIMIT) {
      setError("Free trial used. Upgrade to Pro for unlimited access.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

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
    setResult(null);
    setError("");
  }

  function handleClear() {
    setText("");
    setResult(null);
    setError("");
  }

  const remaining = Math.max(0, DAILY_LIMIT - usageCount);
  const isLimitReached = usageCount >= DAILY_LIMIT;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              AI Paper Assistant
            </h1>
            <p className="mt-2 text-slate-600">
              Free Trial: 2 AI summaries
            </p>
            <p className="text-sm text-slate-500">
              Remaining today: {remaining}
            </p>
          </div>

          <div className="flex gap-3">
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
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
              onClick={() => alert("Pro version coming soon")}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste academic text here"
              className="h-[360px] w-full rounded-xl border border-slate-300 p-4 outline-none"
            />

            <div className="mt-4 flex justify-between">
              <p className="text-sm text-slate-500">
                Characters: {text.length}
              </p>

              <button
                onClick={handleSummarize}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-white"
                disabled={loading || isLimitReached}
              >
                {loading
                  ? "AI working..."
                  : isLimitReached
                  ? "Limit Reached"
                  : "Summarize"}
              </button>
            </div>

            {error && <div className="mt-4 text-red-600">{error}</div>}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Summary</h3>
              <p className="text-sm">
                {result?.summary || "Your summary will appear here"}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Key Points</h3>
              {result?.keyPoints?.map((p, i) => (
                <p key={i}>• {p}</p>
              ))}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Difficult Terms</h3>
              {result?.difficultTerms?.map((t, i) => (
                <p key={i}>• {t.term}</p>
              ))}
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Chinese Explanation</h3>
              <p>{result?.translation_zh}</p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Study Notes</h3>
              {result?.studyNotes?.map((n, i) => (
                <p key={i}>• {n}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}