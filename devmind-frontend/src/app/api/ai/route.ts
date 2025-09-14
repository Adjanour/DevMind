import { NextRequest, NextResponse } from "next/server";
import { aiService } from "~/lib/ai";
import { z } from "zod";

const aiRequestSchema = z.object({
  content: z.string().min(1),
  context: z.string().optional(),
  type: z.enum(["improve", "summarize", "explain", "code_review", "generate_tags", "suggest_title"]),
});

const codeRequestSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  action: z.enum(["suggestions", "explain"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle different types of AI requests
    if (body.action === "suggestions" || body.action === "explain") {
      // Code-specific requests
      const { code, language, action } = codeRequestSchema.parse(body);
      
      if (action === "suggestions") {
        const suggestions = await aiService.generateCodeSuggestions(code, language);
        return NextResponse.json({ suggestions });
      } else if (action === "explain") {
        const explanation = await aiService.explainCode(code, language);
        return NextResponse.json({ explanation });
      }
    } else if (body.type === "generate_tags") {
      // Tag generation
      const { content } = z.object({ content: z.string() }).parse(body);
      const tags = await aiService.generateTags(content);
      return NextResponse.json({ tags });
    } else if (body.type === "suggest_title") {
      // Title suggestion
      const { content } = z.object({ content: z.string() }).parse(body);
      const title = await aiService.suggestTitle(content);
      return NextResponse.json({ title });
    } else {
      // General AI assistance
      const request = aiRequestSchema.parse(body);
      const response = await aiService.getAssistance(request);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("AI API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}