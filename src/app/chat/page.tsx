// ============================================================
// /chat — Core AI Chat page with streaming (useChat)
// Server-side persistence: API route handles conversations + messages
// ============================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";
import {
  Factory,
  Plus,
  History,
  Package,
  LogOut,
  Loader2,
  Menu,
  X,
  MessageSquare,
  Trash2,
  User,
} from "lucide-react";

// ----- Types -----
interface ConversationItem {
  id: string;
  title: string;
  updated_at: string;
}

// ----- Main Component -----
export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLoading,
    error,
    setMessages,
    append,
    reload,
  } = useChat({
    api: "/api/ai/chat",
    body: { conversationId: activeConversationId },
    onFinish: async () => {
      await loadConversations();
    },
  });

  // ── Auth Check ──
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUserEmail(user.email ?? null);
      }
    }
    checkAuth();
  }, [supabase, router]);

  // ── Load sidebar conversations ──
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }

  // ── Scroll to bottom ──
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Load existing conversation ──
  async function loadConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load messages:", error);
      return;
    }

    const aiMessages = (data || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    setMessages(aiMessages);
    setActiveConversationId(conversationId);
  }

  // ── Delete conversation ──
  async function deleteConversation(id: string) {
    await supabase.from("messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);

    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  }

  // ── Handlers ──
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleQuickStart = useCallback(
    (text: string) => {
      const newId = crypto.randomUUID();
      flushSync(() => {
        setActiveConversationId(newId);
      });
      append({ role: "user", content: text });
    },
    [append]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      // Pre-generate conversation ID for new conversations
      if (!activeConversationId) {
        const newId = crypto.randomUUID();
        flushSync(() => {
          setActiveConversationId(newId);
        });
      }
      handleChatSubmit(e);
    },
    [input, isLoading, handleChatSubmit, activeConversationId]
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // ── Render ──
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } border-r bg-card shrink-0 transition-all duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-3 border-b flex items-center gap-2">
          <Factory className="w-5 h-5 text-primary shrink-0" />
          <span className="font-semibold text-sm truncate">
            Industrial Copilot
          </span>
        </div>

        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            新建对话
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                暂无对话记录
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => loadConversationMessages(conv.id)}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-muted rounded-full">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {userEmail || "..."}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-1 text-xs"
              onClick={() => router.push("/products")}
            >
              <Package className="w-3 h-3" />
              产品库
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-1 text-xs"
              onClick={() => router.push("/history")}
            >
              <History className="w-3 h-3" />
              记录
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b flex items-center px-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
          <span className="font-medium text-sm truncate">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)
                  ?.title || "对话"
              : "新对话"}
          </span>
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-2" />
          )}
        </header>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <EmptyState onQuickStart={handleQuickStart} />
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {error && (
              <div className="mx-4 my-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                <strong>⚠️ 出错了：</strong>
                {error.message.includes("DEEPSEEK_API_KEY") ||
                error.message.includes("API key")
                  ? "DeepSeek API Key 未配置或无效。请在 .env.local 中设置正确的 DEEPSEEK_API_KEY。"
                  : error.message}
                <button
                  onClick={() => reload()}
                  className="ml-2 underline text-red-600 dark:text-red-400"
                >
                  重试
                </button>
              </div>
            )}

            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  AI 正在思考...
                </span>
              </div>
            )}

            <div className="h-4" />
          </div>
        </ScrollArea>

        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
