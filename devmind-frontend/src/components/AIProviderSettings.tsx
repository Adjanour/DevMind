"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bot,
  Key,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import { type AIProvider } from "~/lib/ai-providers";
import { aiService } from "~/lib/ai";
import { cn } from "~/lib/utils";

interface AIProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderConfig {
  name: AIProvider;
  displayName: string;
  icon: React.ComponentType<any>;
  description: string;
  website: string;
  models: string[];
  color: string;
}

const providers: ProviderConfig[] = [
  {
    name: "openai",
    displayName: "OpenAI",
    icon: Sparkles,
    description: "GPT-4 and GPT-3.5 models for versatile AI assistance",
    website: "https://platform.openai.com/api-keys",
    models: ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
    color: "text-green-600",
  },
  {
    name: "gemini",
    displayName: "Google Gemini",
    icon: Zap,
    description: "Google's advanced AI models with multimodal capabilities",
    website: "https://makersuite.google.com/app/apikey",
    models: ["gemini-pro", "gemini-pro-vision", "gemini-1.5-pro"],
    color: "text-blue-600",
  },
  {
    name: "claude",
    displayName: "Anthropic Claude",
    icon: Brain,
    description: "Claude 3 models known for safety and reasoning",
    website: "https://console.anthropic.com/",
    models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
    color: "text-purple-600",
  },
];

export function AIProviderSettings({ isOpen, onClose }: AIProviderSettingsProps) {
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    openai: "",
    gemini: "",
    claude: "",
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    gemini: false,
    claude: false,
  });
  const [validationStatus, setValidationStatus] = useState<Record<AIProvider, "idle" | "validating" | "valid" | "invalid">>({
    openai: "idle",
    gemini: "idle",
    claude: "idle",
  });
  const [activeProvider, setActiveProvider] = useState<AIProvider>("openai");
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSavedKeys();
      loadAvailableProviders();
    }
  }, [isOpen]);

  const loadSavedKeys = () => {
    const saved = localStorage.getItem("ai-provider-keys");
    if (saved) {
      try {
        const keys = JSON.parse(saved);
        setApiKeys(keys);
      } catch (error) {
        console.error("Failed to load saved API keys:", error);
      }
    }
  };

  const loadAvailableProviders = () => {
    const available = aiService.getAvailableProviders();
    setAvailableProviders(available);
    if (available.length > 0) {
      setActiveProvider(available[0]);
    }
  };

  const saveApiKey = (provider: AIProvider, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key };
    setApiKeys(newKeys);
    localStorage.setItem("ai-provider-keys", JSON.stringify(newKeys));
  };

  const validateApiKey = async (provider: AIProvider) => {
    const key = apiKeys[provider];
    if (!key.trim()) return;

    setValidationStatus(prev => ({ ...prev, [provider]: "validating" }));
    
    try {
      // Note: In a real implementation, you'd validate via your backend API
      // to avoid exposing API keys to the frontend
      const isValid = await aiService.validateProvider(provider);
      setValidationStatus(prev => ({ 
        ...prev, 
        [provider]: isValid ? "valid" : "invalid" 
      }));
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, [provider]: "invalid" }));
    }
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const setAsActiveProvider = (provider: AIProvider) => {
    aiService.setActiveProvider(provider);
    setActiveProvider(provider);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">AI Provider Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-sm text-muted-foreground">
                Configure your AI providers to unlock powerful features like content improvement, 
                code analysis, and smart suggestions. Your API keys are stored locally and never shared.
              </div>

              {/* Provider Cards */}
              <div className="space-y-4">
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  const isActive = activeProvider === provider.name;
                  const status = validationStatus[provider.name];
                  
                  return (
                    <motion.div
                      key={provider.name}
                      className={cn(
                        "border rounded-lg p-4 transition-colors",
                        isActive ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-lg", `bg-${provider.color.split('-')[1]}-100`)}>
                          <Icon className={cn("h-5 w-5", provider.color)} />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{provider.displayName}</h3>
                              {isActive && (
                                <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{provider.description}</p>
                          </div>

                          {/* API Key Input */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">API Key</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input
                                  type={showKeys[provider.name] ? "text" : "password"}
                                  value={apiKeys[provider.name]}
                                  onChange={(e) => saveApiKey(provider.name, e.target.value)}
                                  placeholder={`Enter your ${provider.displayName} API key`}
                                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleKeyVisibility(provider.name)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showKeys[provider.name] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              
                              <button
                                onClick={() => validateApiKey(provider.name)}
                                disabled={!apiKeys[provider.name] || status === "validating"}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {status === "validating" ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Bot className="h-4 w-4" />
                                  </motion.div>
                                ) : (
                                  "Test"
                                )}
                              </button>
                            </div>

                            {/* Status */}
                            {status !== "idle" && (
                              <div className="flex items-center gap-2 text-sm">
                                {status === "valid" && (
                                  <>
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600">API key is valid</span>
                                  </>
                                )}
                                {status === "invalid" && (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600">Invalid API key</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <a
                              href={provider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Get API Key →
                            </a>
                            
                            {status === "valid" && !isActive && (
                              <button
                                onClick={() => setAsActiveProvider(provider.name)}
                                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                              >
                                Set as Active
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Privacy & Security</p>
                    <p>
                      Your API keys are stored locally in your browser and are never sent to our servers. 
                      They are only used to communicate directly with your chosen AI provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}