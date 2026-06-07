// ============================================================
// ChatInput — Text input with send button for the chat interface
// ============================================================

"use client";

import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { type FormEvent, type KeyboardEvent } from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder = "输入工业自动化问题，例如：我需要控制3台7.5kW水泵，推荐PLC+变频器方案...",
}: ChatInputProps) {
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none rounded-xl border border-input bg-muted/50 px-4 py-3 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[44px] max-h-[200px]"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
        ⚠️ AI 推荐的所有产品型号均为<strong>示例/模拟数据</strong>，实际选型请以官方最新手册为准。按 Enter 发送，Shift+Enter 换行。
      </p>
    </form>
  );
}
