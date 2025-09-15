import { NextRequest, NextResponse } from "next/server";
import { aiService } from "~/lib/ai";
import { z } from "zod";

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
  newMessage: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, newMessage } = chatRequestSchema.parse(body);

    // Build conversation context
    const conversationMessages = [
      {
        role: "system" as const,
        content: "You are an AI assistant specialized in helping developers with their notes, code, and documentation. You're integrated into DevMind, a knowledge management app. Provide helpful, concise responses and offer to help with specific tasks like organizing thoughts, explaining concepts, or improving content.",
      },
      ...messages,
      {
        role: "user" as const,
        content: newMessage,
      },
    ];

    const response = await aiService.getAssistance({
      content: newMessage,
      type: "explain", // Use a general assistance type
    });

    return NextResponse.json({
      content: response.result,
      confidence: response.confidence,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}