// ============================================================
// Industrial Copilot — Core Types (MVP)
// ============================================================

/** A single message in a conversation */
export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

/** A conversation session */
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

/** Structured product recommendation from AI */
export interface ProductRecommendation {
  category: string;
  brand: string;
  model: string;
  reason: string;
  quantity: number;
  note?: string;
}

/** Structured AI response (parsed from AI output) */
export interface AIStructuredResponse {
  answer: string;
  recommendations?: ProductRecommendation[];
  alternatives?: string[];
  risks?: string[];
  disclaimer: string;
}
