"""Shared search utilities for all agents."""

import re
import sys

from tavily import TavilyClient

from app.core.config import settings

SOURCE_CITATION_RULES = (
    "\n\nSOURCE CITATION RULES:\n"
    "- Search results are labeled [SOURCE 0], [SOURCE 1], etc.\n"
    "- For EVERY field you fill with a value (not null), add an entry to the 'sources' list with:\n"
    "  - 'field': the field name (e.g. 'market_share_pct')\n"
    "  - 'source_index': the [SOURCE N] number where you found the data\n"
    "  - 'value_found': the EXACT short snippet from that source (max 100 chars)\n"
    "- You can cite multiple fields from the same source.\n"
    "- If you cannot find a source for a value, set the value to null instead.\n"
    "- Do NOT fill a field without a corresponding source citation.\n"
    "- For list fields like strengths/weaknesses/key_products, cite them as a group."
)


def clean_raw_content(text: str) -> str:
    """Strip web artifacts from Tavily raw_content."""
    if not text:
        return ""
    for pattern in [
        r"^## List of (?:Figures|Tables)",
        r"^## Frequently Asked Questions",
        r"^## Methodology",
        r"^Related Reports",
    ]:
        match = re.search(pattern, text, flags=re.MULTILINE)
        if match:
            text = text[: match.start()]
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"^https?://\S+$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*[\*\+\-]\s+\w[\w\s]{0,35}$", "", text, flags=re.MULTILINE)
    for bp in [
        r"Sign in.*?$",
        r"Subscribe.*?newsletter.*?$",
        r"Cookie.*?policy.*?$",
        r"Privacy.*?policy.*?$",
        r"Terms.*?service.*?$",
        r"All rights reserved.*?$",
        r"Share this.*?$",
        r"Download [Ff]ree [Ss]ample",
        r"Contact [Uu]s",
    ]:
        text = re.sub(bp, "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"&[a-zA-Z]+;", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    text = "\n".join(line.strip() for line in text.split("\n") if line.strip())
    return text.strip()


def make_search_tool(log_list: list):
    """Create a Tavily search tool with numbered SOURCE indices."""

    def search_web(query: str) -> str:
        """Search the web for market research information.

        Args:
            query: The search query.
        """
        print(f"    -> Searching: {query}")
        sys.stdout.flush()
        client = TavilyClient(api_key=settings.tavily_api_key)
        response = client.search(
            query, search_depth="basic", max_results=5, include_raw_content=True
        )
        results = []
        for r in response["results"]:
            current_index = len(log_list)
            raw_cleaned = clean_raw_content(r.get("raw_content") or "")
            log_list.append(
                {
                    "index": current_index,
                    "query": query,
                    "title": r["title"],
                    "url": r["url"],
                    "score": r.get("score"),
                    "content": r["content"],
                    "published_date": r.get("published_date"),
                    "raw_content": raw_cleaned,
                }
            )
            results.append(
                f"[SOURCE {current_index}] {r['title']}\n"
                f"URL: {r['url']}\n"
                f"Content: {r['content']}"
            )
        print(f"       Got {len(results)} results")
        sys.stdout.flush()
        return "\n\n---\n\n".join(results)

    return search_web


def resolve_sources(field_sources: list, search_log: list[dict]) -> list[dict]:
    """Map source_index to actual URL and published_date from search_log."""
    resolved = []
    for src in field_sources:
        src_dict = src.model_dump() if hasattr(src, "model_dump") else src
        idx = src_dict.get("source_index", -1)
        if 0 <= idx < len(search_log):
            resolved.append(
                {
                    "field": src_dict["field"],
                    "value_found": src_dict["value_found"],
                    "url": search_log[idx]["url"],
                    "title": search_log[idx]["title"],
                    "published_date": search_log[idx].get("published_date"),
                }
            )
        else:
            resolved.append(
                {
                    "field": src_dict["field"],
                    "value_found": src_dict["value_found"],
                    "url": None,
                    "title": "UNVERIFIED - invalid source index",
                    "published_date": None,
                }
            )
    return resolved


def collect_all_sources(log_lists: list[list[dict]]) -> list[dict]:
    """Deduplicate all search results by URL, keep highest score, sort desc."""
    by_url: dict[str, dict] = {}
    for log_list in log_lists:
        for entry in log_list:
            url = entry["url"]
            if url not in by_url or (entry.get("score") or 0) > (
                by_url[url].get("relevance_score") or 0
            ):
                by_url[url] = {
                    "title": entry["title"],
                    "url": url,
                    "published_date": entry.get("published_date"),
                    "query": entry["query"],
                    "relevance_score": entry.get("score"),
                }
    return sorted(
        by_url.values(), key=lambda x: x.get("relevance_score") or 0, reverse=True
    )
