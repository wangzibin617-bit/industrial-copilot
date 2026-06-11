// ============================================================
// /api/ai/chat — Streaming AI chat endpoint (DeepSeek via AI SDK)
// Auth: Cookie-based (browser) or Bearer token (API clients)
// Persistence: conversations + messages saved server-side
// ============================================================

import { streamText, convertToCoreMessages, type Message } from "ai";
import { getModel } from "@/lib/ai/deepseek";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

// ── Auth ────────────────────────────────────────────────────
async function authenticate(req: Request) {
  const cookieUser = await getCurrentUser();
  if (cookieUser) return cookieUser;

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
    } catch { /* invalid */ }
  }
  return null;
}

// ── DB Helpers ──────────────────────────────────────────────
async function createConversation(
  userId: string,
  title: string
): Promise<string> {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({ user_id: userId, title, message_count: 0 })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data.id;
}

async function saveMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
  });
}

async function bumpConversation(conversationId: string) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

// ── POST ────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      messages,
      conversationId,
    }: { messages: Message[]; conversationId?: string | null } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages array required", {
        status: 400,
      });
    }

    // ── Get or create conversation ──
    const supabaseAdmin = createAdminClient();
    let convId: string | null = conversationId || null;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const title =
      lastUserMsg && typeof lastUserMsg.content === "string"
        ? lastUserMsg.content.slice(0, 50) +
          (lastUserMsg.content.length > 50 ? "..." : "")
        : "新对话";

    // Ensure conversation row exists (create with client-provided ID if needed)
    if (convId) {
      const { data: existing } = await supabaseAdmin
        .from("conversations")
        .select("id")
        .eq("id", convId)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("conversations").insert({
          id: convId,
          user_id: user.id,
          title,
        });
      }
    } else {
      convId = await createConversation(user.id, title);
    }

    // ── Save user message ──
    if (convId && lastUserMsg && typeof lastUserMsg.content === "string") {
      await saveMessage(convId, user.id, "user", lastUserMsg.content);
      await bumpConversation(convId);
    }

    // ── Stream AI response with server-side persistence ──
    const coreMessages = convertToCoreMessages(messages);
    let assistantText = "";

    const result = streamText({
      model: getModel("deepseek-chat"),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      temperature: 0.5,
      maxTokens: 4096,
      onFinish: async ({ text }) => {
        assistantText = text;
        if (convId && text) {
          try {
            await saveMessage(convId, user.id, "assistant", text);
            await bumpConversation(convId);
          } catch (err) {
            console.error("[API] Failed to save assistant message:", err);
          }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("[API] Chat error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message.includes("DEEPSEEK_API_KEY")) {
      return new Response(
        JSON.stringify({
          error:
            "DeepSeek API 未配置。请在 .env.local 中设置 DEEPSEEK_API_KEY。",
          code: "MISSING_API_KEY",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: message, code: "INTERNAL_ERROR" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
