"use client";

import { useState } from "react";

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择 PDF");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult("");

      // 1 获取上传 URL
      const presignRes = await fetch("/api/upload-url", {
        method: "POST",
      });

      if (!presignRes.ok) {
        throw new Error("Failed to get upload url");
      }

      const { uploadUrl, key } = await presignRes.json();

      // 2 上传 PDF 到 R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: file,
        mode: "cors",
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(text || "Upload failed");
      }

      // 3 调用翻译 API
      const translateRes = await fetch("/api/translate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          filename: file.name,
        }),
      });

      if (!translateRes.ok) {
        const text = await translateRes.text();
        throw new Error(text || "Translate failed");
      }

      const data = await translateRes.json();

      setResult(data.text || "翻译完成");
    } catch (err: any) {
      console.error("Upload/translate error:", err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>上传 PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFile(f);
        }}
      />

      {file && (
        <p>
          已选择 PDF: <b>{file.name}</b>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          background: "#5b4bff",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "翻译中..." : "开始翻译"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>翻译结果</h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 20,
              borderRadius: 8,
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}