import type {
  AIProvider,
  SprintAnalysisInput,
  SprintAnalysisResult,
} from "./types";

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

function buildPrompt(input: SprintAnalysisInput): string {
  const completedPct =
    input.taskCount > 0
      ? Math.round((input.completedCount / input.taskCount) * 100)
      : 0;
  return `You are a sprint analyst. Analyze this sprint and respond in JSON only.

Sprint: ${input.sprintName}
Period: ${input.startDate} to ${input.endDate}
State: ${input.state}
Tasks: ${input.taskCount} total, ${input.completedCount} done (${completedPct}%)
Health: ${input.healthScore} (${input.healthBand})
Spillovers: ${input.spilloverCount}
${input.spilloverTaskSummaries?.length ? `Spillover tasks: ${input.spilloverTaskSummaries.join(", ")}` : ""}

Task list:
${input.tasks.map((t) => `- ${t.summary} [${t.status}]${t.blocked ? " (blocked)" : ""}`).join("\n")}

Respond with a single JSON object only, no markdown:
{
  "summary": "2-4 sentence retrospective: what went well, what caused spillover or risk, and one concrete recommendation.",
  "spilloverClassifications": [{"taskSummary": "task name", "reason": "one of: blocked dependency | underestimated | overloaded assignee | scope creep | other"}]
}
If there are no spillovers, spilloverClassifications can be [].
`;
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error ${res.status}: ${err}`);
  }
  const data = (await res.json()) as { response?: string };
  return data.response ?? "";
}

function parseResponse(raw: string): SprintAnalysisResult {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  try {
    const parsed = JSON.parse(jsonStr) as SprintAnalysisResult;
    return {
      summary: parsed.summary ?? "No summary generated.",
      spilloverClassifications: parsed.spilloverClassifications ?? [],
    };
  } catch {
    return {
      summary:
        raw.slice(0, 500) ||
        "Analysis completed but response was not valid JSON.",
      spilloverClassifications: [],
    };
  }
}

export const ollamaProvider: AIProvider = {
  name: "ollama",
  async analyzeSprint(
    input: SprintAnalysisInput
  ): Promise<SprintAnalysisResult> {
    const prompt = buildPrompt(input);
    const raw = await callOllama(prompt);
    return parseResponse(raw);
  },
};

export function getAIProvider(): AIProvider | null {
  if (process.env.AI_PROVIDER === "off") return null;
  return ollamaProvider;
}
