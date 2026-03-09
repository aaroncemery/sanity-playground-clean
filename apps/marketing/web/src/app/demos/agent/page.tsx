"use client";

// DEMO: Agent Context — chat UI that fetches relevant Sanity docs as LLM context,
// then calls Claude with that context and surfaces a Sources section.

import { useState, useRef, useEffect, useTransition } from "react";
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
  error?: boolean;
}

export default function AgentDemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const question = input.trim();
    if (!question || isPending) return;
    setInput("");

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);

    startTransition(async () => {
      try {
        const res = await fetch("/api/agent-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        const data = await res.json();

        if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.error,
              sources: [],
              error: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.answer,
              sources: data.sources ?? [],
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Failed to reach the server. Please try again.",
            sources: [],
            error: true,
          },
        ]);
      }
    });
  };

  const suggestions = [
    "What blog posts do you have about APIs?",
    "What were the March 2026 platform updates?",
    "Tell me about semantic search",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="mx-auto w-full max-w-3xl px-6 pt-24 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 mb-3">
          Agent Context Demo
        </h1>
        <p className="text-neutral-600 mb-2">
          Ask a question about our blog or platform updates. The agent retrieves
          relevant documents from Sanity using GROQ, then calls Claude with that
          context and cites its sources.
        </p>
        <div
          className="text-xs text-neutral-400 p-3 rounded-lg bg-neutral-50 border border-neutral-200 mb-6"
        >
          {/* DEMO: Agent Context */}
          <strong>How it works:</strong> 1) Your question is used to search
          Sanity with GROQ. 2) Matching blog posts and changelogs are passed as
          context to Claude. 3) Claude answers using that context and the
          Sources panel shows which documents were retrieved.
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 mx-auto w-full max-w-3xl px-6 pb-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 py-8">
            <p className="text-sm text-neutral-400 mb-3">Try asking:</p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                }}
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

        {isPending && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AI
            </div>
            <div className="bg-neutral-100 rounded-2xl px-4 py-3 text-sm text-neutral-400">
              Searching Sanity and generating response…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-neutral-200 py-4">
        <div className="mx-auto max-w-3xl px-6 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about blog posts or platform updates…"
            disabled={isPending}
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !input.trim()}
            className="px-5 py-3 rounded-xl bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
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
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-neutral-950 text-white"
              : message.error
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-neutral-100 text-neutral-900"
          }`}
        >
          {message.content}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
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
                  <span className="text-neutral-300">
                    {source._type === "blog" ? "📝" : "📋"}
                  </span>
                  {source.title}
                  <span className="text-neutral-300">↗</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.sources?.length === 0 && !message.error && (
          <p className="text-xs text-neutral-400 px-2">
            No matching documents found in Sanity for this query.
          </p>
        )}
      </div>
    </div>
  );
}
