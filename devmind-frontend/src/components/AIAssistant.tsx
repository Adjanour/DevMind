"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  FileText,
  Code,
  Tags,
  MessageSquare,
  Loader2,
  X,
  Copy,
  Check,
} from "lucide-react";
import { aiService, type AIAssistanceRequest } from "~/lib/ai";
import { cn } from "~/lib/utils";

interface AIAssistantProps {
  content: string;
  onSuggestion: (suggestion: string) => void;
  onTagsGenerated: (tags: string[]) => void;
  onTitleSuggested: (title: string) => void;
  className?: string;
}

export function AIAssistant({
  content,
  onSuggestion,
  onTagsGenerated,
  onTitleSuggested,
  className,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const actions = [
    {
      id: "improve",
      label: "Improve Writing",
      icon: Wand2,
      description: "Enhance clarity and grammar",
      color: "text-blue-600",
    },
    {
      id: "summarize",
      label: "Summarize",
      icon: FileText,
      description: "Create a concise summary",
      color: "text-green-600",
    },
    {
      id: "explain",
      label: "Explain",
      icon: MessageSquare,
      description: "Simplify complex concepts",
      color: "text-purple-600",
    },
    {
      id: "code_review",
      label: "Review Code",
      icon: Code,
      description: "Get code suggestions",
      color: "text-orange-600",
    },
    {
      id: "generate_tags",
      label: "Generate Tags",
      icon: Tags,
      description: "Auto-generate relevant tags",
      color: "text-pink-600",
    },
  ];

  const handleAction = async (actionId: string) => {
    if (!content.trim()) {
      alert("Please add some content first");
      return;
    }

    setIsLoading(true);
    setActiveAction(actionId);
    setResult("");

    try {
      if (actionId === "generate_tags") {
        const tags = await aiService.generateTags(content);
        onTagsGenerated(tags);
        setResult(`Generated tags: ${tags.join(", ")}`);
      } else if (actionId === "suggest_title") {
        const title = await aiService.suggestTitle(content);
        onTitleSuggested(title);
        setResult(`Suggested title: ${title}`);
      } else {
        const response = await aiService.getAssistance({
          content,
          type: actionId as AIAssistanceRequest["type"],
        });
        setResult(response.result);
      }
    } catch (error) {
      console.error("AI assistance error:", error);
      setResult("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplySuggestion = () => {
    if (result) {
      onSuggestion(result);
      setResult("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* AI Assistant Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          isOpen
            ? "bg-purple-100 text-purple-700"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 left-0 z-50 w-80 bg-white rounded-xl border border-gray-200 shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-4">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isActive = activeAction === action.id;
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={isLoading}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        isActive
                          ? "bg-purple-50 border border-purple-200"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", action.color)} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {action.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {action.description}
                        </div>
                      </div>
                      {isLoading && isActive && (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleAction("suggest_title")}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Suggest Title
                </button>
                <button
                  onClick={() => handleAction("generate_tags")}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Auto Tags
                </button>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {result}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplySuggestion}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Apply Suggestion
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading && !result && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}