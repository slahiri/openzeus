import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const webSearchTool = createTool({
  id: "web_search",
  description:
    "Search the web for current information. Use this when the user asks about recent events, facts you're unsure about, or anything that benefits from real-time data.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    numResults: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return"),
  }),
  execute: async (input) => {
    const apiKey =
      process.env.TAVILY_API_KEY || process.env.SERPER_API_KEY;

    if (!apiKey) {
      return {
        results: [],
        error:
          "No search API key configured. Set TAVILY_API_KEY or SERPER_API_KEY.",
      };
    }

    // Try Tavily first
    if (process.env.TAVILY_API_KEY) {
      return await tavilySearch(
        input.query,
        input.numResults,
        process.env.TAVILY_API_KEY,
      );
    }

    // Fall back to Serper
    return await serperSearch(
      input.query,
      input.numResults,
      process.env.SERPER_API_KEY!,
    );
  },
});

async function tavilySearch(
  query: string,
  numResults: number,
  apiKey: string,
) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: numResults,
      include_answer: true,
    }),
  });

  if (!response.ok) {
    return { results: [], error: `Tavily API error: ${response.status}` };
  }

  const data = await response.json();
  return {
    answer: data.answer,
    results: (data.results || []).map(
      (r: { title: string; url: string; content: string; score: number }) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      }),
    ),
  };
}

async function serperSearch(
  query: string,
  numResults: number,
  apiKey: string,
) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: numResults }),
  });

  if (!response.ok) {
    return { results: [], error: `Serper API error: ${response.status}` };
  }

  const data = await response.json();
  return {
    results: (data.organic || []).map(
      (r: { title: string; link: string; snippet: string }) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      }),
    ),
  };
}
