// DEMO: Agent Context — uses GROQ to fetch relevant Sanity content as LLM context
import { createClient } from "@sanity/client";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface BlogDoc {
  _id: string;
  _type: string;
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
}

interface ChangelogDoc {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  releaseMonth?: string;
  summary?: string;
}

interface ContextResult {
  blogs: BlogDoc[];
  changelogs: ChangelogDoc[];
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Check for Anthropic API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file to enable the agent demo.",
        sources: [],
      },
      { status: 503 },
    );
  }

  // Step 1: Retrieve relevant Sanity documents as context (DEMO: Agent Context)
  const contextQuery = `{
    "blogs": *[_type == "blog" && (title match $query + "*" || description match $query + "*")][0...5]{
      _id, _type, title, description, "slug": slug.current, publishedAt
    },
    "changelogs": *[_type == "changelog" && (title match $query + "*" || summary match $query + "*")][0...3]{
      _id, _type, title, "slug": slug.current, releaseMonth, summary
    }
  }`;

  let context: ContextResult = { blogs: [], changelogs: [] };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context = await (sanityClient.fetch as any)(contextQuery, {
      query: question.split(" ").slice(0, 3).join(" "),
    }) as ContextResult;
  } catch {
    // If Sanity fetch fails, proceed with empty context
  }

  const allSources = [
    ...(context.blogs || []),
    ...(context.changelogs || []),
  ];

  // Step 2: Build context string from retrieved documents
  const contextText =
    allSources.length > 0
      ? allSources
          .map((doc) => {
            if (doc._type === "blog") {
              const b = doc as BlogDoc;
              return `Blog Post: "${b.title}"\nURL: /blog/${b.slug?.replace("blog/", "")}\n${b.description ? `Summary: ${b.description}` : ""}`;
            } else {
              const c = doc as ChangelogDoc;
              return `Changelog: "${c.title}"\nURL: /updates/${c.slug?.replace("updates/", "")}\n${c.summary ? `Summary: ${c.summary}` : ""}`;
            }
          })
          .join("\n\n")
      : "No relevant documents found in the knowledge base.";

  // Step 3: Call Claude with retrieved context (DEMO: Agent Context)
  const systemPrompt = `You are a helpful assistant for a developer tools platform.
You have access to the following content from the platform's knowledge base:

---
${contextText}
---

Answer the user's question based on this context. Be concise and helpful.
If the context doesn't contain relevant information, say so honestly.`;

  try {
    const response = await anthropicClient.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const answer =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      answer,
      sources: allSources.map((doc) => ({
        _id: doc._id,
        _type: doc._type,
        title: doc.title,
        slug:
          doc._type === "blog"
            ? `/blog/${(doc as BlogDoc).slug?.replace("blog/", "")}`
            : `/updates/${(doc as ChangelogDoc).slug?.replace("updates/", "")}`,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Claude API error: ${msg}`, sources: [] }, { status: 502 });
  }
}
