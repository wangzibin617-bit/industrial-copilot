// ============================================================
// DeepSeek AI Client — OpenAI-compatible via @ai-sdk/openai
// ============================================================

import { createOpenAI } from "@ai-sdk/openai";

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL =
    process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  if (!apiKey) {
    throw new Error(
      "❌ 缺少 DEEPSEEK_API_KEY 环境变量。\n" +
        "请在 .env.local 中设置 DEEPSEEK_API_KEY。\n" +
        "获取地址: https://platform.deepseek.com/api_keys"
    );
  }

  return { apiKey, baseURL };
}

/** OpenAI-compatible DeepSeek provider instance */
export function getDeepSeek() {
  const config = getDeepSeekConfig();
  return createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

/** Convenience: get a model instance */
export function getModel(modelName: string = "deepseek-chat") {
  const deepseek = getDeepSeek();
  return deepseek(modelName);
}
