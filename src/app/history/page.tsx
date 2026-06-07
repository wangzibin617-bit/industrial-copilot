// ============================================================
// /history — View all past conversations
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Factory,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Loader2,
  LogOut,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  message_count: number;
  updated_at: string;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "加载失败";
      setError(message);
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    try {
      await supabase.from("messages").delete().eq("conversation_id", id);
      await supabase.from("conversations").delete().eq("id", id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    if (diffHour < 24) return `${diffHour} 小时前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    return date.toLocaleDateString("zh-CN");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">对话记录</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/chat")}
            >
              返回对话
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-1" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={loadConversations}>
              重试
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">暂无对话记录</h2>
            <p className="text-sm text-muted-foreground mb-6">
              去 AI Copilot 开始你的第一次工业选型对话吧
            </p>
            <Button onClick={() => router.push("/chat")}>
              开始对话
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/chat?id=${conv.id}`)}
              >
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {conv.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conv.updated_at)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {conv.message_count || 0} 条消息
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
