import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import countriesByContinent from "./data/countries.json";
import App from "./App";

describe("App", () => {
  it("settles after publishing initial continent signals", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "World News Snapshot" })).toBeInTheDocument();
    expect(screen.getAllByText(/Select a country and click Refresh/)).toHaveLength(6);
  });

  it("categorizes Mexico under North America", () => {
    expect(countriesByContinent["North America"].Mexico).toBe("mx");
    expect(countriesByContinent["South America"].Mexico).toBeUndefined();
  });

  it("exposes the selected topic state", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "global" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
