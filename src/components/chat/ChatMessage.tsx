// ============================================================
// ChatMessage — Renders a single message bubble (user or assistant)
// ============================================================

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Factory } from "lucide-react";
import { type Message } from "ai";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 py-4 px-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
          <AvatarFallback className="bg-primary/10">
            <Factory className="w-4 h-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 border"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-xs">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-1.5 ${
            isUser
              ? "text-primary-foreground/60"
              : "text-muted-foreground"
          }`}
        >
          {new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 bg-secondary">
          <AvatarFallback className="bg-secondary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
