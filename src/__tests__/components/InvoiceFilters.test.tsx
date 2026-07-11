import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { TooltipProvider } from "@/components/ui/tooltip";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// fireEvent (not userEvent) on purpose: user-event's internal waits deadlock
// under fake timers, and these tests are about timer behaviour, not typing
// fidelity.
function renderAndGetSearchInput() {
  render(
    <TooltipProvider>
      <InvoiceFilters totalRecords={0} />
    </TooltipProvider>,
  );
  return screen.getByLabelText(/search invoices/i);
}

describe("InvoiceFilters search debounce", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies the keyword 350ms after the last keystroke, not immediately", () => {
    const input = renderAndGetSearchInput();

    fireEvent.change(input, { target: { value: "IV123" } });
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(349);
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/?keyword=IV123");
  });

  it("restarts the countdown on every keystroke and applies only the final value", () => {
    const input = renderAndGetSearchInput();

    fireEvent.change(input, { target: { value: "IV" } });
    vi.advanceTimersByTime(300);
    fireEvent.change(input, { target: { value: "IV99" } });

    // 300ms + 349ms > 350ms total, but the second keystroke reset the timer.
    vi.advanceTimersByTime(349);
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/?keyword=IV99");
  });

  it("submits immediately on Enter and cancels the pending debounce", () => {
    const input = renderAndGetSearchInput();

    fireEvent.change(input, { target: { value: "IV777" } });
    fireEvent.submit(input.closest("form")!);
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/?keyword=IV777");

    // The keystroke's debounce timer was cancelled — no second navigation.
    vi.advanceTimersByTime(500);
    expect(push).toHaveBeenCalledTimes(1);
  });

  it("trims the keyword before applying it", () => {
    const input = renderAndGetSearchInput();

    fireEvent.change(input, { target: { value: "  IV42  " } });
    vi.advanceTimersByTime(350);
    expect(push).toHaveBeenCalledWith("/?keyword=IV42");
  });
});
