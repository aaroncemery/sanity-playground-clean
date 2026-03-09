"use client";

// DEMO: Agent Context — multi-turn chatbot that gives Claude a groq_query tool
// so it can search Sanity content on demand, then streams the response.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Source {
  _id: string;
  _type: string;
  title: string;
  slug: string;
}

// Simple conversation message (kept separate from Anthropic SDK types — server handles those)
interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  // Assistant-only metadata
  sources?: Source[];
  toolCalls?: string[];
  isStreaming?: boolean;
  isError?: boolean;
}

const SUGGESTIONS = [
  "What blog posts do you have about APIs?",
  "What were the March 2026 platform updates?",
  "Tell me about semantic search",
];

export default function AgentDemoPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;
    setInput("");
    setIsLoading(true);

    // Append user message
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    // Append streaming placeholder for the assistant reply
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStreaming: true, toolCalls: [], sources: [] },
    ]);

    // Build the conversation history to send (exclude the empty streaming placeholder)
    const history: Array<{ role: "user" | "assistant"; content: string }> = messages
      .filter((m) => !m.isStreaming && m.content !== "")
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: question });

    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accText = "";
      let accTools: string[] = [];
      let finalSources: Source[] = [];

      // Parse SSE stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as Record<string, unknown>;

            if (event.type === "text") {
              accText += event.delta as string;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: accText };
                return copy;
              });
            } else if (event.type === "tool_start") {
              accTools = [...accTools, event.name as string];
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], toolCalls: accTools };
                return copy;
              });
            } else if (event.type === "done") {
              finalSources = (event.sources as Source[]) ?? [];
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: accText,
                  isStreaming: false,
                  sources: finalSources,
                  toolCalls: accTools,
                };
                return copy;
              });
            } else if (event.type === "error") {
              throw new Error(event.message as string);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reach the server.";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: msg,
          isStreaming: false,
          isError: true,
          sources: [],
          toolCalls: [],
        };
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="mx-auto w-full max-w-3xl px-6 pt-8 pb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
            Agent Context
          </h1>
          {messages.length > 0 && !isLoading && (
            <button
              onClick={() => setMessages([])}
              className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
        <p className="text-neutral-600 mb-3">
          Ask anything about the blog or platform updates. Claude uses a{" "}
          <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">groq_query</code>{" "}
          tool to search Sanity on demand, then streams its answer with cited sources.
        </p>
        <div className="text-xs text-neutral-400 p-3 rounded-lg bg-neutral-50 border border-neutral-200 mb-4">
          {/* DEMO: Agent Context pattern */}
          <strong>How it works:</strong> Claude decides which GROQ queries to run, executes
          them against the Sanity dataset in real time, and grounds its answer in the
          retrieved content — no pre-fetching or hardcoded queries needed.
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 mx-auto w-full max-w-3xl px-6 pb-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 py-6">
            <p className="text-sm text-neutral-400 mb-2">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-left text-sm px-4 py-3 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-neutral-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input — natural bottom of flex column */}
      <div className="flex-shrink-0 bg-white border-t border-neutral-200 py-4">
        <div className="mx-auto max-w-3xl px-6 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about blog posts or platform updates…"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-950 placeholder:text-neutral-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isUser ? "bg-neutral-200 text-neutral-700" : "bg-neutral-950 text-white"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>

      <div className="flex flex-col gap-2 max-w-[80%]">
        {/* Tool call indicator — shown while Claude is querying Sanity */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-xs text-violet-700">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-violet-500 ${
                message.isStreaming && message.content === "" ? "animate-pulse" : ""
              }`}
            />
            Searched Sanity with{" "}
            <code className="font-mono">{message.toolCalls[message.toolCalls.length - 1]}</code>
          </div>
        )}

        {/* Message bubble */}
        {(message.content || message.isStreaming) && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? "bg-neutral-950 text-white"
                : message.isError
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-neutral-100 text-neutral-900"
            }`}
          >
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 bg-neutral-400 ml-0.5 animate-pulse align-text-bottom rounded-sm" />
            )}
          </div>
        )}

        {/* Sources */}
        {!isUser && !message.isStreaming && message.sources && message.sources.length > 0 && (
          <div className="px-2">
            <p className="text-xs text-neutral-400 mb-1.5 font-medium">
              Sources retrieved from Sanity:
            </p>
            <div className="flex flex-col gap-1">
              {message.sources.map((source) => (
                <Link
                  key={source._id}
                  href={source.slug}
                  className="text-xs text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-neutral-400">
                    {source._type === "blog"
                      ? "📝"
                      : source._type === "changelog"
                      ? "📋"
                      : "📄"}
                  </span>
                  {source.title}
                  <span className="text-neutral-300">↗</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isUser && !message.isStreaming && !message.isError && message.sources?.length === 0 && (
          <p className="text-xs text-neutral-400 px-2">
            No matching documents found in Sanity.
          </p>
        )}
      </div>
    </div>
  );
}
