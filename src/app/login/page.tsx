import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Simple<span className="text-primary">Invoice</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to manage your invoices
          </p>
        </div>
        <Card>
          <CardContent className="pt-2">
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
