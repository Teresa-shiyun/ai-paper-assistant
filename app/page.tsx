import Link from "next/link";

const features = [
  {
    title: "Summarize Papers",
    desc: "Turn long academic text into short, clear summaries.",
  },
  {
    title: "Upload PDF",
    desc: "Upload text-based PDF papers and get instant analysis.",
  },
  {
    title: "Chinese Explanation",
    desc: "Understand difficult academic content in natural Chinese.",
  },
  {
    title: "Study Notes",
    desc: "Generate revision-friendly notes for faster exam preparation.",
  },
  {
    title: "Essay Outline",
    desc: "Turn paper content into a ready-to-use essay structure.",
  },
  {
    title: "Built for International Students",
    desc: "Designed for students who need speed, clarity, and bilingual help.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <nav className="mb-14 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              AI Paper Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Bilingual academic reading tool for international students
            </p>
          </div>

          <Link
            href="/tool"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try it now
          </Link>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              AI Tool for Students
            </div>

            <h2 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Read papers faster.
              <br />
              Write essays smarter.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Upload a PDF or paste academic text to get a summary, key points,
              difficult term explanations, Chinese explanation, study notes, and
              essay outline in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/tool"
                className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Start Free Trial
              </Link>

              <a
                href="#pricing"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Pricing
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
                Free Trial Available
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Summary
                </p>
                <p className="text-sm text-slate-600">
                  Short academic summary generated from paper content.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Chinese Explanation
                </p>
                <p className="text-sm text-slate-600">
                  Natural Chinese explanation for easier understanding.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Essay Outline
                </p>
                <p className="text-sm text-slate-600">
                  Introduction, body arguments, and conclusion structure.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Features
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              Everything students need in one tool
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h4 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Free Trial
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">£0</h3>
            <p className="mt-3 text-slate-600">Best for first-time users.</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• 2 AI uses per day</li>
              <li>• Paste text or upload PDF</li>
              <li>• Summary + Notes + Outline</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Pro
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">£5 / month</h3>
            <p className="mt-3 text-slate-600">
              Unlimited access for heavy academic use.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• Unlimited AI summaries</li>
              <li>• Unlimited PDF analysis</li>
              <li>• Faster study workflow</li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}