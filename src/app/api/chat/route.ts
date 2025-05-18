import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // messagesの形式をバリデーション
  if (!Array.isArray(messages) || !messages.every((m) => m.role && m.content)) {
    return new Response("Invalid messages format", { status: 400 });
  }

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    messages,
  });

  // 公式ドキュメント通りにストリーミングレスポンスを返す
  return result.toDataStreamResponse();
}
