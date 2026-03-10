"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Source {
  _id: string;
  _type: string;
  title: string;
  slug: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  toolCalls?: string[];
  isStreaming?: boolean;
  isError?: boolean;
}

// Dot-grid decoration — mimics the screenshot's scattered dot pattern
function DotGrid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {Array.from({ length: 11 }, (_, row) =>
        Array.from({ length: 13 }, (_, col) => {
          // Fade toward top-left, denser toward bottom-right
          const opacity = Math.min(
            0.6,
            ((row / 10) * 0.5 + (col / 12) * 0.5) * 0.9
          );
          return (
            <circle
              key={`${row}-${col}`}
              cx={col * 10 + 5}
              cy={row * 9 + 5}
              r={1}
              opacity={opacity}
            />
          );
        })
      )}
    </svg>
  );
}

export function GlobalAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘J / Ctrl+J to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        isStreaming: true,
        toolCalls: [],
        sources: [],
      },
    ]);

    const history: Array<{ role: "user" | "assistant"; content: string }> =
      messages
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
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: accText,
                };
                return copy;
              });
            } else if (event.type === "tool_start") {
              accTools = [...accTools, event.name as string];
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  toolCalls: accTools,
                };
                return copy;
              });
            } else if (event.type === "done") {
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: accText,
                  isStreaming: false,
                  sources: (event.sources as Source[]) ?? [],
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
      const msg =
        err instanceof Error ? err.message : "Failed to reach the server.";
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
  }, [input, isLoading, messages]);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open assistant (⌘J)"
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all flex items-center justify-center group shadow-lg"
      >
        <DotGrid className="w-6 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/60 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">
                  Playground Assistant
                </span>
                <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 rounded">
                  ⌘J
                </kbd>
              </div>
              <div className="flex items-center gap-3">
                {messages.length > 0 && !isLoading && (
                  <button
                    onClick={() => setMessages([])}
                    className="text-xs text-neutral-700 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-neutral-600 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <DotGrid className="w-28 h-24 text-neutral-800 mb-8" />
                  <h2 className="text-xl font-semibold text-white mb-2">
                    What are you looking for?
                  </h2>
                  <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                    Ask about blog posts, platform updates, or anything on this
                    site.
                  </p>
                </div>
              ) : (
                /* Conversation */
                <div className="flex flex-col gap-5 px-5 py-5">
                  {messages.map((msg, i) => (
                    <AssistantMessage key={i} message={msg} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-neutral-800/60 p-4">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  placeholder="Ask about anything…"
                  disabled={isLoading}
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors disabled:opacity-40"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-white text-neutral-950 text-sm font-bold hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
                >
                  {isLoading ? (
                    <span className="w-1 h-3.5 bg-neutral-400 rounded-full animate-pulse" />
                  ) : (
                    "↑"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] text-sm text-white bg-neutral-800 rounded-2xl rounded-br-sm px-4 py-2.5 leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-[88%]">
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

      {!message.isStreaming && message.sources && message.sources.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-xs text-neutral-700 mb-0.5">Sources</p>
          {message.sources.map((source) => (
            <Link
              key={source._id}
              href={source.slug}
              onClick={() => {/* keep modal open so user can follow link */}}
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
