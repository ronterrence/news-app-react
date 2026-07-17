import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchNews } from "../services/newsApi";
import ContinentNewsCard from "./ContinentNewsCard";

vi.mock("../services/newsApi", () => ({
  fetchNews: vi.fn(),
}));

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const countries = { France: "fr", Belgium: "be" };

function renderCard(props = {}) {
  return render(
    <ContinentNewsCard
      continent="Europe"
      countries={countries}
      selectedTopic="global"
      onSignalsChange={vi.fn()}
      {...props}
    />
  );
}

describe("ContinentNewsCard", () => {
  beforeEach(() => {
    fetchNews.mockReset();
  });

  it("invalidates a pending result when the topic changes", async () => {
    const pending = deferred();
    fetchNews.mockReturnValue(pending.promise);
    const { rerender } = renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading article matches");

    rerender(
      <ContinentNewsCard
        continent="Europe"
        countries={countries}
        selectedTopic="technology"
        onSignalsChange={vi.fn()}
      />
    );

    expect(screen.getByText("France technology")).toBeInTheDocument();
    expect(screen.getByText(/Select a country and click Refresh/)).toBeInTheDocument();

    await act(async () => {
      pending.resolve([
        { id: "old", title: "Old global result", source: "Source" },
      ]);
      await pending.promise;
    });

    expect(screen.queryByText("Old global result")).not.toBeInTheDocument();
  });

  it("invalidates a pending result when the country changes", async () => {
    const pending = deferred();
    fetchNews.mockReturnValue(pending.promise);
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Country" }), "Belgium");

    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("Belgium");
    expect(screen.getByText(/Select a country and click Refresh/)).toBeInTheDocument();

    await act(async () => {
      pending.resolve([
        { id: "fr", title: "France-only result", source: "Source" },
      ]);
      await pending.promise;
    });

    await waitFor(() => {
      expect(screen.queryByText("France-only result")).not.toBeInTheDocument();
    });
  });
});
