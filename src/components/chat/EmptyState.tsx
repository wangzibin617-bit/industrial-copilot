// ============================================================
// EmptyState — Shown when no messages in the chat yet
// ============================================================

import { Factory, Zap, MessageSquare, Scale } from "lucide-react";

const QUICK_STARTS = [
  {
    icon: Zap,
    label: "产品选型",
    text: "我需要控制3台7.5kW水泵，预算8万以内，推荐PLC+变频器+触摸屏方案，品牌优先施耐德。",
  },
  {
    icon: Scale,
    label: "跨品牌对比",
    text: "对比施耐德ATV320系列和信捷VH6系列变频器，7.5kW恒转矩负载应用场景，哪个更适合？",
  },
  {
    icon: MessageSquare,
    label: "技术问答",
    text: "施耐德M221 PLC的Modbus通讯最多支持多少个从站？通讯距离最长多少？需要什么通讯线缆？",
  },
];

interface EmptyStateProps {
  onQuickStart: (text: string) => void;
}

export function EmptyState({ onQuickStart }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="p-4 bg-primary/10 rounded-2xl mb-4">
        <Factory className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">AI 工业销售助手</h2>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        我是你的工业自动化售前助手，可以帮你做产品选型、跨品牌对比、技术问答和方案推荐。
        <br />
        试试下面的快捷提问 ↓
      </p>

      <div className="grid gap-3 w-full max-w-lg">
        {QUICK_STARTS.map(({ icon: Icon, label, text }) => (
          <button
            key={label}
            onClick={() => onQuickStart(text)}
            className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-accent transition-colors text-left group"
          >
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {label}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {text}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-8">
        ⚠️ AI 推荐的所有产品型号均为示例/模拟数据，实际选型请查阅官方手册
      </p>
    </div>
  );
}
