import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/components/login/LoginForm";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors without calling the API when fields are empty", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric username client-side", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/username/i), "not-a-phone");
    await user.type(screen.getByLabelText(/password/i), "Test-Password-000");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Username must be a phone number (digits only)"),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits valid credentials to the BFF endpoint and redirects home", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ user: { name: "James" } }), { status: 200 }),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/username/i), "10000000000");
    await user.type(screen.getByLabelText(/password/i), "Test-Password-000");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toEqual({ username: "10000000000", password: "Test-Password-000" });
  });

  it("surfaces the server error message on failed sign-in", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid username or password" }), {
        status: 401,
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/username/i), "10000000000");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid username or password",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
