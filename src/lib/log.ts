import "server-only";

export function logError(event: string, detail: Record<string, unknown>): void {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      time: new Date().toISOString(),
      ...detail,
    }),
  );
}
