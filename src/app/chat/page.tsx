// ============================================================
// /chat — Core AI Chat page with streaming (useChat)
// ============================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Use AI SDK's useChat for streaming
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
    onFinish: async (message) => {
      // Save the assistant message to Supabase
      if (activeConversationId) {
        await saveMessage(activeConversationId, "assistant", message.content);
        await updateConversationTimestamp(activeConversationId);
      }
    },
  });

  // ----- Auth Check -----
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

  // ----- Load Conversations -----
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConversations() {
    setLoadingConversations(true);
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

  // ----- Messages scroll -----
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ----- Conversation CRUD -----
  async function createConversation(title: string): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
        message_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }

    await loadConversations();
    return data.id;
  }

  async function saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
    });

    if (error) {
      console.error("Failed to save message:", error);
    }
  }

  async function updateConversationTimestamp(conversationId: string) {
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }

  async function deleteConversation(id: string) {
    // Delete messages first, then conversation
    await supabase.from("messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);

    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  }

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

    // Convert to AI SDK Message format
    const aiMessages = (data || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    setMessages(aiMessages);
    setActiveConversationId(conversationId);
  }

  // ----- Handlers -----
  const handleQuickStart = useCallback(
    async (text: string) => {
      // Create a new conversation
      const title =
        text.length > 50 ? text.slice(0, 50) + "..." : text;
      const convId = await createConversation(title);
      if (convId) {
        setActiveConversationId(convId);
        // Save user message
        await saveMessage(convId, "user", text);
        // Trigger AI
        append({ role: "user", content: text });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [append, createConversation, saveMessage]
  );

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = input.trim();

      // Create conversation if needed
      if (!activeConversationId) {
        const title =
          userMessage.length > 50
            ? userMessage.slice(0, 50) + "..."
            : userMessage;
        const convId = await createConversation(title);
        if (convId) {
          setActiveConversationId(convId);
          await saveMessage(convId, "user", userMessage);
        }
      } else {
        await saveMessage(activeConversationId, "user", userMessage);
      }

      // Trigger AI via useChat
      handleChatSubmit(e);
    },
    [
      input,
      isLoading,
      activeConversationId,
      handleChatSubmit,
      createConversation,
      saveMessage,
    ]
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // ----- Render -----
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

        {/* Sidebar footer */}
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
              onClick={() => router.push("/history")}
            >
              <History className="w-3 h-3" />
              全部记录
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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

        {/* Messages area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <EmptyState onQuickStart={handleQuickStart} />
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {/* Error state */}
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

            {/* Loading indicator for streaming */}
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

        {/* Input area */}
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
