export type SprintAnalysisInput = {
  sprintName: string;
  startDate: string;
  endDate: string;
  state: string;
  taskCount: number;
  completedCount: number;
  spilloverCount: number;
  healthScore: number;
  healthBand: string;
  tasks: Array<{
    summary: string;
    status: string;
    blocked?: boolean;
  }>;
  spilloverTaskSummaries?: string[];
};

export type SprintAnalysisResult = {
  summary: string;
  spilloverClassifications?: Array<{ taskSummary: string; reason: string }>;
};

export type AIProviderName = "ollama" | "openai" | "anthropic";

export interface AIProvider {
  name: AIProviderName;
  analyzeSprint(input: SprintAnalysisInput): Promise<SprintAnalysisResult>;
}
