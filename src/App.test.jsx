import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { fetchNews, searchNews } from "./services/newsApi";

vi.mock("./services/newsApi", () => ({
  fetchNews: vi.fn(),
  searchNews: vi.fn(),
}));

const articles = [
  {
    id: "older",
    title: "Older technology report",
    source: "Source One",
    publishedAt: "2026-07-10T10:00:00Z",
    category: "technology",
    description: "Technology teams publish a software report.",
    url: "https://example.com/older",
  },
  {
    id: "newer",
    title: "Newer science report",
    source: "Source Two",
    publishedAt: "2026-07-16T10:00:00Z",
    category: "science",
    description: "Science teams publish a research report.",
    url: "https://example.com/newer",
  },
  {
    id: "undated",
    title: "Undated market report",
    source: "Source Two",
    publishedAt: "",
    category: "business",
    description: "Markets and companies remain active.",
  },
];

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("Metal Intelligence feed", () => {
  beforeEach(() => {
    fetchNews.mockReset();
    searchNews.mockReset();
  });

  it("starts empty without sending a request", () => {
    render(<App />);

    expect(screen.getByText(/Start with a country, topic, or semantic search/)).toBeInTheDocument();
    expect(fetchNews).not.toHaveBeenCalled();
    expect(searchNews).not.toHaveBeenCalled();
  });

  it("derives the continent and retrieves when a country is selected", async () => {
    fetchNews.mockResolvedValue(articles);
    render(<App />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "France"
    );

    expect(await screen.findByText("Older technology report")).toBeInTheDocument();
    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(fetchNews).toHaveBeenCalledWith(
      "fr",
      "France",
      "global",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(screen.getByText("3", { selector: ".stat-card strong" })).toBeInTheDocument();
    expect(screen.getByText("2", { selector: ".stat-card strong" })).toBeInTheDocument();
  });

  it("runs a global semantic search when a topic is selected without a country", async () => {
    searchNews.mockResolvedValue(articles.slice(0, 1));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "technology" }));

    expect(await screen.findByText("Older technology report")).toBeInTheDocument();
    expect(searchNews).toHaveBeenCalledWith(
      "technology",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("combines semantic text with the active country and topic", async () => {
    fetchNews.mockResolvedValue([]);
    searchNews.mockResolvedValue(articles.slice(0, 1));
    render(<App />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "France"
    );
    await userEvent.click(screen.getByRole("button", { name: "technology" }));
    const input = screen.getByRole("textbox", { name: "Semantic search" });
    await userEvent.type(input, "climate");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(searchNews).toHaveBeenLastCalledWith(
        "climate France technology",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
  });

  it("ignores a stale country response", async () => {
    const france = deferred();
    const belgium = deferred();
    fetchNews.mockReturnValueOnce(france.promise).mockReturnValueOnce(belgium.promise);
    render(<App />);
    const country = screen.getByRole("combobox", { name: "Country" });

    await userEvent.selectOptions(country, "France");
    await userEvent.selectOptions(country, "Belgium");

    await act(async () => {
      belgium.resolve([{ ...articles[1], title: "Belgium result" }]);
      await belgium.promise;
    });
    expect(screen.getByText("Belgium result")).toBeInTheDocument();

    await act(async () => {
      france.resolve([{ ...articles[0], title: "Stale France result" }]);
      await france.promise;
    });
    expect(screen.queryByText("Stale France result")).not.toBeInTheDocument();
  });

  it("sorts dated articles newest first and leaves undated articles last", async () => {
    fetchNews.mockResolvedValue(articles);
    render(<App />);
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "France"
    );
    await screen.findByText("Older technology report");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Sort articles" }),
      "date"
    );

    const feed = screen.getByRole("status");
    const titles = within(feed).getAllByRole("heading", { level: 3 });
    expect(titles.map((title) => title.textContent)).toEqual([
      "Newer science report",
      "Older technology report",
      "Undated market report",
    ]);
  });

  it("switches between accessible grid and list controls", () => {
    render(<App />);
    const grid = screen.getByRole("button", { name: "Grid" });
    const list = screen.getByRole("button", { name: "List" });

    expect(grid).toHaveAttribute("aria-pressed", "true");
    userEvent.click(list);
    return waitFor(() => {
      expect(list).toHaveAttribute("aria-pressed", "true");
      expect(grid).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("renders response-derived article details without prototype-only metrics", async () => {
    fetchNews.mockResolvedValue([{ ...articles[0], keywords: ["AI", "Software"] }]);
    render(<App />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "France"
    );

    expect(await screen.findByText("Older technology report")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Article keywords" })).toHaveTextContent("AI");
    expect(screen.getByRole("link", { name: /Read article/ })).toHaveAttribute(
      "href",
      "https://example.com/older"
    );
    expect(screen.queryByText(/Relevance:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pipeline Active/)).not.toBeInTheDocument();
  });

  it("resets filters and results without issuing another request", async () => {
    fetchNews.mockResolvedValue(articles);
    render(<App />);
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Country" }),
      "France"
    );
    await screen.findByText("Older technology report");

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("");
    expect(screen.getByText(/Start with a country, topic, or semantic search/)).toBeInTheDocument();
    expect(fetchNews).toHaveBeenCalledTimes(1);
  });
});
