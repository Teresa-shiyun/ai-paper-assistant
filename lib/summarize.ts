type SummaryResult = {
  summary: string
  keyPoints: string[]
  difficultTerms: string[]
}

export function summarizeAcademicText(text: string): SummaryResult {

  const sentences = text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(Boolean)

  const summary = sentences.slice(0,2).join(". ")

  const keyPoints = sentences.slice(0,4)

  const words = text
    .toLowerCase()
    .match(/[a-zA-Z]{8,}/g) || []

  const difficultTerms = [...new Set(words)].slice(0,6)

  return {
    summary,
    keyPoints,
    difficultTerms
  }
}