"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginInput } from "@/validation/login";
import { useUserStore } from "@/stores/user-store";
import type { SessionUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/login/FieldError";

async function loginRequest(values: LoginInput): Promise<SessionUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(body?.message ?? "Sign-in failed. Please try again.");
  }
  const body = (await response.json()) as { user: SessionUser };
  return body.user;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const login = useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => {
      setUser(user);
      const from = searchParams.get("from");
      const target = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
      router.replace(target);
      router.refresh();
    },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {login.isError && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
        >
          {login.error.message}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="e.g. 947569211717"
          aria-invalid={Boolean(errors.username)}
          {...register("username")}
        />
        <FieldError message={errors.username?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
