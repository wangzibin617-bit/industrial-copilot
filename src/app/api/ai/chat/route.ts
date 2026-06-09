// ============================================================
// /api/ai/chat — Streaming AI chat endpoint (DeepSeek via AI SDK)
// Auth: Cookie-based (browser) or Bearer token (API clients)
// ============================================================

import { streamText, convertToCoreMessages, type Message } from "ai";
import { getModel } from "@/lib/ai/deepseek";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

async function authenticate(req: Request) {
  // 1. Try cookie-based auth (browser flow)
  const cookieUser = await getCurrentUser();
  if (cookieUser) return cookieUser;

  // 2. Try Bearer token auth (API/client flow)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const supabaseAdmin = createAdminClient();
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) return user;
    } catch {
      // Token invalid, fall through to 401
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    // Verify authentication (cookie or Bearer token)
    const user = await authenticate(req);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", {
        status: 400,
      });
    }

    // Convert to core messages and add system prompt
    const coreMessages = convertToCoreMessages(messages);

    // Stream the response
    const result = streamText({
      model: getModel("deepseek-chat"),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      temperature: 0.5,
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[API] Chat error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Check for common config errors
    if (message.includes("DEEPSEEK_API_KEY")) {
      return new Response(
        JSON.stringify({
          error: "DeepSeek API 未配置。请在 .env.local 中设置 DEEPSEEK_API_KEY。",
          code: "MISSING_API_KEY",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: message,
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
