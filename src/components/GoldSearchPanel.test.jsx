import { act, createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchNews } from "../services/newsApi";
import GoldSearchPanel from "./GoldSearchPanel";

vi.mock("../services/newsApi", () => ({
  searchNews: vi.fn(),
}));

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function renderPanel(props = {}) {
  const defaultProps = {
    query: "",
    onQueryChange: vi.fn(),
    onSearchInteraction: vi.fn(),
    suggestions: ["technology"],
  };

  return render(<GoldSearchPanel {...defaultProps} {...props} />);
}

describe("GoldSearchPanel", () => {
  beforeEach(() => {
    searchNews.mockReset();
  });

  it("keeps only the newest search response", async () => {
    const first = deferred();
    const second = deferred();
    searchNews.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const sharedProps = {
      onQueryChange: vi.fn(),
      onSearchInteraction: vi.fn(),
      suggestions: [],
    };
    const ref = createRef();
    render(<GoldSearchPanel ref={ref} {...sharedProps} query="second" />);

    act(() => {
      ref.current.search("first");
      ref.current.search("second");
    });

    await act(async () => {
      second.resolve([
        { id: "second", title: "Newest result", source: "Source" },
      ]);
      await second.promise;
    });

    expect(screen.getByText("Newest result")).toBeInTheDocument();
    expect(screen.getByText(/Results for “second”/)).toBeInTheDocument();

    await act(async () => {
      first.resolve([{ id: "first", title: "Stale result", source: "Source" }]);
      await first.promise;
    });

    expect(screen.queryByText("Stale result")).not.toBeInTheDocument();
    expect(screen.getByText("Newest result")).toBeInTheDocument();
  });

  it("does not repopulate results after clearing a pending search", async () => {
    const pending = deferred();
    searchNews.mockReturnValue(pending.promise);
    renderPanel({ query: "technology" });

    fireEvent.submit(screen.getByRole("button", { name: "Search" }).closest("form"));
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await act(async () => {
      pending.resolve([{ id: "late", title: "Late result", source: "Source" }]);
      await pending.promise;
    });

    expect(screen.queryByText("Late result")).not.toBeInTheDocument();
    expect(screen.getByText(/Enter a topic, phrase, or concept/)).toBeInTheDocument();
  });

  it("exposes suggestion selection to assistive technology", () => {
    renderPanel({ query: "technology" });
    expect(screen.getByRole("button", { name: "technology" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
