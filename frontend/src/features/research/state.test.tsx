import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResearchProvider, useResearch } from "./state";
afterEach(cleanup);
function Probe() {
  const s = useResearch();
  return (
    <>
      <button onClick={() => s.toggleSaved("s1")}>Toggle</button>
      <button
        onClick={() => {
          s.addCollection("Topic");
          s.assign("s1", "Topic");
        }}
      >
        Organize
      </button>
      <output>
        {s.saved.join(",")}|{s.collectionNames.join(",")}|{s.assignments["s1"]}
      </output>
    </>
  );
}
describe("Session state", () => {
  it("saves, organizes, and removes sources", () => {
    render(
      <ResearchProvider>
        <Probe />
      </ResearchProvider>,
    );
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByRole("status")).toHaveTextContent("s1");
    fireEvent.click(screen.getByText("Organize"));
    expect(screen.getByRole("status")).toHaveTextContent("Topic");
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByRole("status")).not.toHaveTextContent("s1");
  });
});
