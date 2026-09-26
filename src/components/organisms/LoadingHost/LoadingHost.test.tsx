import { act, render, screen } from "@testing-library/react";
import { loading } from "@/utils/loading";
import { LoadingHost } from "./LoadingHost";

describe("LoadingHost", () => {
  it("shows the overlay with the message while an action runs and removes it when it ends", async () => {
    render(<LoadingHost />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    let finish!: () => void;
    const task = new Promise<void>((resolve) => {
      finish = resolve;
    });
    let running!: Promise<void>;
    act(() => {
      running = loading.run(task, "Guardando proyecto…");
    });

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Guardando proyecto…")).toBeInTheDocument();

    await act(async () => {
      finish();
      await running;
    });
    expect(screen.queryByText("Guardando proyecto…")).not.toBeInTheDocument();
  });
});
