import "server-only";

export function auditLog(event: string, detail: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      audit: true,
      event,
      time: new Date().toISOString(),
      ...detail,
    }),
  );
}
