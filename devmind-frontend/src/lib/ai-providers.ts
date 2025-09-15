import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = "openai" | "gemini" | "claude";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  
  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract generateResponse(messages: AIMessage[]): Promise<AIResponse>;
  abstract getAvailableModels(): string[];
  abstract getProviderName(): AIProvider;
  abstract validateApiKey(): Promise<boolean>;
}

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model || "gpt-3.5-turbo",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 1000,
    });

    return {
      content: completion.choices[0]?.message?.content || "",
      provider: "openai",
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };
  }

  getAvailableModels(): string[] {
    return [
      "gpt-4-turbo-preview",
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-16k",
    ];
  }

  getProviderName(): AIProvider {
    return "openai";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}

export class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({ 
      model: this.config.model || "gemini-pro",
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        maxOutputTokens: this.config.maxTokens || 1000,
      },
    });

    // Convert messages to Gemini format
    const prompt = messages
      .filter(msg => msg.role !== "system")
      .map(msg => msg.content)
      .join("\n\n");

    const systemInstruction = messages.find(msg => msg.role === "system")?.content;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    });

    return {
      content: result.response.text(),
      provider: "gemini",
      model: this.config.model || "gemini-pro",
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount,
        totalTokens: result.response.usageMetadata?.totalTokenCount,
      },
    };
  }

  getAvailableModels(): string[] {
    return [
      "gemini-pro",
      "gemini-pro-vision",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ];
  }

  getProviderName(): AIProvider {
    return "gemini";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("test");
      return true;
    } catch {
      return false;
    }
  }
}

export class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const systemMessage = messages.find(msg => msg.role === "system");
    const conversationMessages = messages.filter(msg => msg.role !== "system");

    const response = await this.client.messages.create({
      model: this.config.model || "claude-3-sonnet-20240229",
      max_tokens: this.config.maxTokens || 1000,
      temperature: this.config.temperature || 0.7,
      system: systemMessage?.content,
      messages: conversationMessages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    });

    const content = response.content[0];
    return {
      content: content.type === "text" ? content.text : "",
      provider: "claude",
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  getAvailableModels(): string[] {
    return [
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
      "claude-2.1",
      "claude-2.0",
    ];
  }

  getProviderName(): AIProvider {
    return "claude";
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }],
      });
      return true;
    } catch {
      return false;
    }
  }
}

export class AIProviderManager {
  private providers: Map<AIProvider, BaseAIProvider> = new Map();
  private activeProvider: AIProvider | null = null;

  addProvider(provider: BaseAIProvider) {
    this.providers.set(provider.getProviderName(), provider);
  }

  setActiveProvider(providerName: AIProvider) {
    if (this.providers.has(providerName)) {
      this.activeProvider = providerName;
    } else {
      throw new Error(`Provider ${providerName} not found`);
    }
  }

  getActiveProvider(): BaseAIProvider | null {
    if (!this.activeProvider) return null;
    return this.providers.get(this.activeProvider) || null;
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error("No active AI provider set");
    }
    return provider.generateResponse(messages);
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  async validateProvider(providerName: AIProvider): Promise<boolean> {
    const provider = this.providers.get(providerName);
    if (!provider) return false;
    return provider.validateApiKey();
  }
}

// Provider factory
export function createProvider(
  providerName: AIProvider,
  config: AIProviderConfig
): BaseAIProvider {
  switch (providerName) {
    case "openai":
      return new OpenAIProvider(config);
    case "gemini":
      return new GeminiProvider(config);
    case "claude":
      return new ClaudeProvider(config);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}