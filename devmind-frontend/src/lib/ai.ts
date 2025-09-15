import { 
  AIProviderManager, 
  createProvider, 
  type AIProvider, 
  type AIMessage,
  type AIProviderConfig 
} from "./ai-providers";
import { env } from "~/env";

export interface AIAssistanceRequest {
  content: string;
  context?: string;
  type: "improve" | "summarize" | "explain" | "code_review" | "generate_tags" | "suggest_title";
}

export interface AIAssistanceResponse {
  result: string;
  suggestions?: string[];
  confidence?: number;
}

export class AIService {
  private static instance: AIService;
  private providerManager: AIProviderManager;

  constructor() {
    this.providerManager = new AIProviderManager();
    this.initializeProviders();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeProviders() {
    // Initialize available providers based on API keys
    if (env.OPENAI_API_KEY) {
      const openaiProvider = createProvider("openai", {
        apiKey: env.OPENAI_API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxTokens: 1000,
      });
      this.providerManager.addProvider(openaiProvider);
      this.providerManager.setActiveProvider("openai"); // Default to OpenAI if available
    }

    if (env.GEMINI_API_KEY) {
      const geminiProvider = createProvider("gemini", {
        apiKey: env.GEMINI_API_KEY,
        model: "gemini-pro",
        temperature: 0.7,
        maxTokens: 1000,
      });
      this.providerManager.addProvider(geminiProvider);
      if (!this.providerManager.getActiveProvider()) {
        this.providerManager.setActiveProvider("gemini");
      }
    }

    if (env.CLAUDE_API_KEY) {
      const claudeProvider = createProvider("claude", {
        apiKey: env.CLAUDE_API_KEY,
        model: "claude-3-sonnet-20240229",
        temperature: 0.7,
        maxTokens: 1000,
      });
      this.providerManager.addProvider(claudeProvider);
      if (!this.providerManager.getActiveProvider()) {
        this.providerManager.setActiveProvider("claude");
      }
    }
  }

  async getAssistance(request: AIAssistanceRequest): Promise<AIAssistanceResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const messages: AIMessage[] = [
        {
          role: "system",
          content: "You are an AI assistant specialized in helping developers with their notes, code, and documentation. Provide concise, helpful responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await this.providerManager.generateResponse(messages);
      
      return {
        result: response.content,
        confidence: 0.8, // Could be enhanced with actual confidence scoring
      };
    } catch (error) {
      console.error("AI assistance error:", error);
      throw new Error("Failed to get AI assistance");
    }
  }

  setActiveProvider(provider: AIProvider) {
    this.providerManager.setActiveProvider(provider);
  }

  getAvailableProviders(): AIProvider[] {
    return this.providerManager.getAvailableProviders();
  }

  async validateProvider(provider: AIProvider): Promise<boolean> {
    return this.providerManager.validateProvider(provider);
  }

  async generateCodeSuggestions(code: string, language: string): Promise<string[]> {
    try {
      const messages: AIMessage[] = [
        {
          role: "system",
          content: `You are a code review assistant. Analyze the ${language} code and provide 3-5 specific improvement suggestions. Focus on best practices, performance, and readability.`,
        },
        {
          role: "user",
          content: `Please review this ${language} code and provide improvement suggestions:\n\n${code}`,
        },
      ];

      const response = await this.providerManager.generateResponse(messages);
      const suggestions = response.content;
      return suggestions.split('\n').filter(s => s.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error("Code suggestions error:", error);
      return [];
    }
  }

  async generateTags(content: string): Promise<string[]> {
    try {
      const messages: AIMessage[] = [
        {
          role: "system",
          content: "Generate 3-7 relevant tags for the given content. Focus on programming languages, technologies, concepts, and topics. Return only the tags separated by commas.",
        },
        {
          role: "user",
          content: `Generate tags for this content:\n\n${content.slice(0, 1000)}`,
        },
      ];

      const response = await this.providerManager.generateResponse(messages);
      const tagsString = response.content;
      return tagsString
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length < 20)
        .slice(0, 7);
    } catch (error) {
      console.error("Tag generation error:", error);
      return [];
    }
  }

  async suggestTitle(content: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: "system",
          content: "Generate a concise, descriptive title for the given content. The title should be 3-8 words and capture the main topic or purpose.",
        },
        {
          role: "user",
          content: `Generate a title for this content:\n\n${content.slice(0, 500)}`,
        },
      ];

      const response = await this.providerManager.generateResponse(messages);
      return response.content.trim() || "Untitled Note";
    } catch (error) {
      console.error("Title suggestion error:", error);
      return "Untitled Note";
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: "system",
          content: `You are a code explanation assistant. Explain ${language} code in simple terms, describing what it does, how it works, and any important concepts involved.`,
        },
        {
          role: "user",
          content: `Please explain this ${language} code:\n\n${code}`,
        },
      ];

      const response = await this.providerManager.generateResponse(messages);
      return response.content || "Unable to explain the code.";
    } catch (error) {
      console.error("Code explanation error:", error);
      return "Unable to explain the code.";
    }
  }

  private buildPrompt(request: AIAssistanceRequest): string {
    const { content, context, type } = request;
    
    switch (type) {
      case "improve":
        return `Please improve the following text for clarity, grammar, and technical accuracy:\n\n${content}`;
      
      case "summarize":
        return `Please provide a concise summary of the following content:\n\n${content}`;
      
      case "explain":
        return `Please explain the following content in simple terms:\n\n${content}`;
      
      case "code_review":
        return `Please review the following code and provide feedback on best practices, potential issues, and improvements:\n\n${content}`;
      
      case "generate_tags":
        return `Generate relevant tags for the following content (return as comma-separated list):\n\n${content}`;
      
      case "suggest_title":
        return `Suggest a concise, descriptive title for the following content:\n\n${content}`;
      
      default:
        return content;
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();