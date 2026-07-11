"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/user-store";
import type { SessionUser } from "@/lib/session";

/**
 * Bridges server → client state: the authenticated layout (a server
 * component) reads the user from the session cookie and this component
 * seeds the Zustand store exactly once, before the first client render.
 */
export function UserStoreHydrator({ user }: { user: SessionUser | null }) {
  useState(() => {
    useUserStore.setState({ user });
    return true;
  });
  return null;
}
