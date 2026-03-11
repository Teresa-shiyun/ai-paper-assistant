import Link from "next/link"

export default function Home(){

  return (

    <main className="flex min-h-screen flex-col items-center justify-center p-10">

      <h1 className="text-4xl font-bold mb-4">
        AI Paper Summarizer
      </h1>

      <p className="text-lg text-gray-600 text-center max-w-xl mb-8">
        Paste academic papers and get simple summaries instantly.
        <br/>
        粘贴论文内容，快速获得总结与重点。
      </p>

      <Link
        href="/tool"
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
      >
        Try it now / 立即体验
      </Link>

    </main>

  )

}