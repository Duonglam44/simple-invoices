import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { useInvoiceUiStore } from "@/stores/invoice-ui-store";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateInvoiceDialog />
    </QueryClientProvider>,
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), "Nguyen");
  await user.type(screen.getByLabelText(/last name/i), "Dung");
  await user.type(screen.getByLabelText(/email/i), "nguyen@example.com");
  await user.type(screen.getByLabelText(/mobile number/i), "+6597594971");
  await user.type(screen.getByLabelText(/address line/i), "CT11");
  await user.type(screen.getByLabelText(/^city/i), "hanoi");
  await user.type(screen.getByLabelText(/county \/ state/i), "hoangmai");
  await user.type(screen.getByLabelText(/postcode/i), "1000");
  await user.type(screen.getByLabelText(/country code/i), "VN");
  await user.type(screen.getByLabelText(/item name/i), "Consulting");
  await user.type(screen.getByLabelText(/rate/i), "150");
}

describe("CreateInvoiceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    useInvoiceUiStore.getState().openCreate();
  });

  afterEach(() => {
    useInvoiceUiStore.getState().closeCreate();
    useInvoiceUiStore.getState().clearDraft();
  });

  it("navigates back to the bare list URL after a successful create, resetting any search/filter", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Invoice created successfully" }),
        {
          status: 201,
        },
      ),
    );
    const user = userEvent.setup();
    renderDialog();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    await screen.findByText("Nguyen Dung");

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  });

  it("does not navigate when the dialog is merely cancelled", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/first name/i), "Nguyen");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(push).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
