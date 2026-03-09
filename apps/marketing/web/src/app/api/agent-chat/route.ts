// DEMO: Agent Context — Claude uses a groq_query tool to search Sanity content,
// streams the response token-by-token via SSE, and surfaces cited sources.
// Best practices: streaming agentic loop, typed SDK errors, server-side token only.
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@sanity/client";
import { NextRequest } from "next/server";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  // Read token stays server-side — never sent to the browser
  token: process.env.SANITY_API_READ_TOKEN,
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for a developer tools platform powered by Sanity CMS.

You have access to the platform's content via the groq_query tool. Use it to look up relevant
content before answering — do not make up facts.

Available Sanity document types and fields to query:
- blog: _id, _type, title, description, publishedAt, "slug": slug.current
- changelog: _id, _type, title, "slug": slug.current, releaseMonth, summary, features[]{title,badge}
- product: _id, _type, title, description, "slug": slug.current
- page: _id, _type, title, "slug": slug.current

GROQ tips:
- Always project specific fields (never bare *[...])
- Limit results: append [0...5]
- Text search: title match $term + "*"
- Order recent first: | order(publishedAt desc)

Cite the specific documents you reference. Be concise and honest when content is not found.`;

const GROQ_QUERY_TOOL: Anthropic.Tool = {
  name: "groq_query",
  description:
    "Execute a GROQ query against the Sanity dataset. Use this to find blog posts, " +
    "platform updates (changelogs), products, and pages. Always project fields and limit results.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "A valid GROQ expression with a projection and result limit. " +
          'Example: *[_type == "blog" && title match $term + "*"][0...5]{ _id, _type, title, "slug": slug.current }',
      },
      params: {
        type: "object",
        description: 'Named GROQ parameters. Example: { "term": "semantic search" }',
      },
    },
    required: ["query"],
  },
};

interface SanityDoc {
  _id?: string;
  _type?: string;
  title?: string;
  slug?: string;
  [key: string]: unknown;
}

interface Source {
  _id: string;
  _type: string;
  title: string;
  slug: string;
}

function toSlug(doc: SanityDoc): string {
  const raw = String(doc.slug ?? "");
  if (doc._type === "blog") return `/blog/${raw.replace(/^blog\//, "")}`;
  if (doc._type === "changelog") return `/updates/${raw.replace(/^updates\//, "")}`;
  return `/${raw}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local to enable this demo.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = await req.json();
  const rawMessages = body.messages as Array<{
    role: "user" | "assistant";
    content: string;
  }>;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiMessages: Anthropic.MessageParam[] = rawMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const sseStream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      function send(data: object) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        let currentMessages: Anthropic.MessageParam[] = [...apiMessages];
        const sources = new Map<string, Source>();

        // Agentic loop — runs until Claude finishes (stop_reason "end_turn")
        while (true) {
          const messageStream = anthropic.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: [GROQ_QUERY_TOOL],
            messages: currentMessages,
          });

          // Forward text deltas and tool-start notifications in real time
          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send({ type: "text", delta: event.delta.text });
            } else if (
              event.type === "content_block_start" &&
              event.content_block.type === "tool_use"
            ) {
              send({ type: "tool_start", name: event.content_block.name });
            }
          }

          // Collect the complete response for tool-use handling
          const message = await messageStream.finalMessage();
          if (message.stop_reason === "end_turn") break;

          const toolUseBlocks = message.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
          );
          if (toolUseBlocks.length === 0) break;

          currentMessages.push({ role: "assistant", content: message.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const block of toolUseBlocks) {
            if (block.name !== "groq_query") continue;

            const input = block.input as { query: string; params?: Record<string, unknown> };

            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const result = await (sanityClient.fetch as any)(
                input.query,
                input.params ?? {},
              ) as unknown;

              const docs: SanityDoc[] = Array.isArray(result) ? result : [result];

              for (const doc of docs) {
                if (doc?._id && !sources.has(doc._id)) {
                  sources.set(doc._id, {
                    _id: String(doc._id),
                    _type: String(doc._type ?? ""),
                    title: String(doc.title ?? "Untitled"),
                    slug: toSlug(doc),
                  });
                }
              }

              send({ type: "tool_result", count: docs.length });

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(result),
              });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              send({ type: "tool_error", message: msg });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: `Query failed: ${msg}`,
                is_error: true,
              });
            }
          }

          currentMessages.push({ role: "user", content: toolResults });
        }

        send({ type: "done", sources: Array.from(sources.values()) });
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) {
          send({ type: "error", message: "Invalid Anthropic API key." });
        } else if (err instanceof Anthropic.RateLimitError) {
          send({ type: "error", message: "Rate limited — please try again in a moment." });
        } else if (err instanceof Anthropic.APIError) {
          send({ type: "error", message: `API error ${err.status}: ${err.message}` });
        } else {
          send({ type: "error", message: err instanceof Error ? err.message : "Unexpected error" });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
