"use client";

import { useState } from "react";

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [translation, setTranslation] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const handleTranslate = async () => {
    if (!file) {
      setError("请先选择 PDF");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTranslation("");

      // 获取上传 URL
      const presignRes = await fetch("/api/upload-url", {
        method: "POST",
      });

      if (!presignRes.ok) {
        throw new Error("获取上传地址失败");
      }

      const { uploadUrl, key } = await presignRes.json();

      // 上传到 R2
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
        throw new Error(text || "上传失败");
      }

      // 调用翻译
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
        throw new Error(text || "翻译失败");
      }

      const data = await translateRes.json();

      setTranslation(data.text || "");
      setPdfUrl(URL.createObjectURL(file));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "发生错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        AI Paper Translator
      </h1>

      {/* 上传区域 */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #eee",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>上传 PDF</h3>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />

        {file && (
          <p style={{ marginTop: "10px" }}>
            已选择 PDF: <b>{file.name}</b>
          </p>
        )}

        <button
          onClick={handleTranslate}
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            borderRadius: "8px",
            background: "#5b4bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "翻译中..." : "开始翻译"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "15px" }}>{error}</p>
        )}
      </div>

      {/* 结果区域 */}
      {(pdfUrl || translation) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* 左边 PDF */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "10px",
              height: "600px",
            }}
          >
            <h3>原始 PDF</h3>

            {pdfUrl && (
              <iframe
                src={pdfUrl}
                style={{
                  width: "100%",
                  height: "550px",
                  border: "none",
                }}
              />
            )}
          </div>

          {/* 右边翻译 */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "10px",
              padding: "20px",
              height: "600px",
              overflow: "auto",
            }}
          >
            <h3>翻译结果</h3>

            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {translation || "翻译结果会显示在这里"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}