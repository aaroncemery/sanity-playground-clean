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

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
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

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStreaming: true, toolCalls: [], sources: [] },
    ]);

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-10 pb-6 flex-shrink-0">
        <Link
          href="/demos"
          className="text-xs text-neutral-600 hover:text-white transition-colors uppercase tracking-widest mb-8 inline-block"
        >
          ← Demos
        </Link>
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Agent Context
          </h1>
          {messages.length > 0 && !isLoading && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-neutral-700 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Ask anything about the blog or platform updates. Claude uses a{" "}
          <code className="font-mono text-neutral-400 text-xs">groq_query</code>{" "}
          tool to search Sanity on demand, then streams its answer with sources.
        </p>
      </div>

      {/* Chat */}
      <div className="flex-1 mx-auto w-full max-w-2xl px-6 pb-6 flex flex-col gap-6 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs text-neutral-600 uppercase tracking-widest mb-3">
              Try asking
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-left text-sm px-4 py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-500 hover:text-white transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-neutral-800/50 py-4">
        <div className="mx-auto max-w-2xl px-6 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about blog posts or platform updates…"
            disabled={isLoading}
            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-white text-neutral-950 text-sm font-bold hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
          >
            {isLoading ? (
              <span className="w-1 h-4 bg-neutral-400 rounded-full animate-pulse" />
            ) : (
              "↑"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] text-sm text-white bg-neutral-800 rounded-2xl rounded-br-sm px-4 py-2.5 leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 max-w-[88%]">
      {/* Tool call indicator */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1 h-1 rounded-full bg-neutral-600 shrink-0 ${
              message.isStreaming && !message.content ? "animate-pulse" : ""
            }`}
          />
          <span className="text-xs font-mono text-neutral-600">
            queried{" "}
            <span className="text-neutral-500">
              {message.toolCalls[message.toolCalls.length - 1]}
            </span>
          </span>
        </div>
      )}

      {/* Message */}
      {(message.content || message.isStreaming) && (
        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            message.isError ? "text-amber-400" : "text-neutral-300"
          }`}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-px h-[1em] bg-neutral-500 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>
      )}

      {/* Sources */}
      {!message.isStreaming && message.sources && message.sources.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-xs text-neutral-700 mb-0.5">Sources</p>
          {message.sources.map((source) => (
            <Link
              key={source._id}
              href={source.slug}
              className="text-xs text-neutral-600 hover:text-white transition-colors"
            >
              {source.title} ↗
            </Link>
          ))}
        </div>
      )}

      {!message.isStreaming &&
        !message.isError &&
        message.sources?.length === 0 &&
        message.content && (
          <p className="text-xs text-neutral-700">No matching documents found.</p>
        )}
    </div>
  );
}
