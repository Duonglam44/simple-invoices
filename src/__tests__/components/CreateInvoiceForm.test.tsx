import { Profiler } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoice/CreateInvoiceForm";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateInvoiceForm layout="page" />
    </QueryClientProvider>,
  );
}

/** Fills every required field so "Preview" validates cleanly. */
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

describe("CreateInvoiceForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders the billing address and bank/remittance fields from the API spec", () => {
    renderForm();

    expect(screen.getByLabelText(/address line/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/county \/ state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country code/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bank id/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/unit of measure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^tax$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^discount$/i)).toBeInTheDocument();

    // The initial action is "Preview", not a direct submit.
    expect(
      screen.getByRole("button", { name: /^preview$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /create invoice/i }),
    ).not.toBeInTheDocument();
  });

  it("shows human-readable labels, not raw codes, for currency and unit of measure", () => {
    renderForm();

    // Select triggers mirror their selected option's rendered content
    // (Radix also renders a hidden native <option> with the same text).
    expect(screen.getAllByText("GBP (£)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Each (EA)").length).toBeGreaterThan(0);
  });

  it("defaults the due date to 7 days from today", () => {
    renderForm();

    const expected = format(addDays(new Date(), 7), "d MMM yyyy");
    expect(screen.getByLabelText(/due date/i)).toHaveTextContent(expected);
  });

  it("renders required-field asterisks in red", () => {
    const { container } = renderForm();

    const label = container.querySelector('label[for="invoiceNumber"]');
    const mark = label?.querySelector("span");
    expect(mark).toHaveTextContent("*");
    expect(mark).toHaveClass("text-destructive");
  });

  it("blocks preview and never calls the API when the new required address fields are empty", async () => {
    const user = userEvent.setup();
    renderForm();

    // Bank account & UOM come prefilled with sensible defaults; the billing
    // address is blank until the user fills it in.
    await user.click(screen.getByRole("button", { name: /^preview$/i }));

    expect(
      await screen.findByText("Address line is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(screen.getByText("County/state is required")).toBeInTheDocument();
    expect(screen.getByText("Postcode is required")).toBeInTheDocument();
    expect(screen.getByText("Country is required")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    // Still on the edit step — no preview/create button appeared.
    expect(
      screen.queryByRole("button", { name: /create invoice/i }),
    ).not.toBeInTheDocument();
  });

  it("rejects a malformed country code without calling the API", async () => {
    const user = userEvent.setup();
    renderForm();

    // The input enforces maxLength=2, so a single letter is the way to
    // exercise the "must be 2 letters" regex through real user typing.
    await user.type(screen.getByLabelText(/country code/i), "V");
    await user.click(screen.getByRole("button", { name: /^preview$/i }));

    expect(
      await screen.findByText("Must be a 2-letter ISO country code, e.g. GB"),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks preview when a prefilled bank account field is cleared", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.clear(screen.getByLabelText(/account number/i));
    await user.click(screen.getByRole("button", { name: /^preview$/i }));

    expect(
      await screen.findByText("Account number is required"),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a read-only review screen on Preview without calling the API", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));

    // The entered data is echoed back...
    expect(await screen.findByText("Nguyen Dung")).toBeInTheDocument();
    expect(screen.getByText("nguyen@example.com")).toBeInTheDocument();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
    expect(screen.getByText("CT11")).toBeInTheDocument();
    // ...the fields are gone (read-only screen), and nothing was submitted
    // yet. useForm retains their values for "Back to edit".
    expect(screen.queryByLabelText(/first name/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: /create invoice/i }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not re-render the form tree while typing in a text field", async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <Profiler id="create-invoice" onRender={onRender}>
        <QueryClientProvider client={queryClient}>
          {/* persistDraft exercises the draft-persistence path, which used to
              subscribe the whole form to the store and re-render per keystroke */}
          <CreateInvoiceForm layout="page" persistDraft />
        </QueryClientProvider>
      </Profiler>,
    );

    // Text fields are uncontrolled — typing must not commit anything.
    onRender.mockClear();
    await user.type(screen.getByLabelText(/first name/i), "Nguyen Van A");
    expect(onRender).not.toHaveBeenCalled();

    // Amount fields feed the live totals strip, so those keystrokes commit —
    // through the isolated useWatch subscription, not a full form re-render.
    onRender.mockClear();
    await user.type(screen.getByLabelText(/rate/i), "150");
    expect(onRender).toHaveBeenCalled();
  });

  it("returns to the editable form with values intact via Back to edit", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    await screen.findByText("Nguyen Dung");

    await user.click(screen.getByRole("button", { name: /back to edit/i }));

    expect(await screen.findByLabelText(/first name/i)).toHaveValue("Nguyen");
    expect(screen.getByLabelText(/item name/i)).toHaveValue("Consulting");
    expect(
      screen.getByRole("button", { name: /^preview$/i }),
    ).toBeInTheDocument();
  });

  it("only calls the API once the user clicks Create invoice on the review screen", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Invoice created successfully" }),
        {
          status: 201,
        },
      ),
    );
    const user = userEvent.setup();
    renderForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    await screen.findByText("Nguyen Dung");
    expect(fetch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/invoices", expect.anything()),
    );
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.bankAccount).toEqual({
      bankId: "",
      sortCode: "09-01-01",
      accountNumber: "12345678",
      accountName: "John Terry",
    });
    expect(body.customer.address).toEqual({
      premise: "CT11",
      city: "hanoi",
      county: "hoangmai",
      postcode: "1000",
      countryCode: "VN",
    });
    expect(body.item).toMatchObject({
      itemName: "Consulting",
      rate: 150,
      itemUOM: "EA",
    });
    expect(body.item).not.toHaveProperty("extensions");
  });

  it("includes a tax extension and reflects it in the review screen's total", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 201 }),
    );
    const user = userEvent.setup();
    renderForm();

    await fillRequiredFields(user);
    await user.clear(screen.getByLabelText(/rate/i));
    await user.type(screen.getByLabelText(/rate/i), "100");
    await user.type(screen.getByLabelText(/^tax$/i), "10");

    // Subtotal (100) + 10% tax = 110, shown live before preview.
    expect(await screen.findByText("£110.00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^preview$/i }));

    // Same total, now on the review screen.
    const preview = within(await screen.findByTestId("invoice-preview"));
    expect(preview.getByText("£110.00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/invoices", expect.anything()),
    );
    // The client posts the raw form values; the BFF route (using the same
    // shared schema) is what shapes them into the API's `extensions[]` —
    // see buildInvoicePayload's tests for that mapping.
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.item).toMatchObject({ taxType: "PERCENTAGE", taxValue: 10 });
  });
});
