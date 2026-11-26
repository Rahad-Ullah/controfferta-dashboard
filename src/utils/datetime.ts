export function formatLocalDateTime(value: unknown) {
  const date = new Date(String(value ?? ""));

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}
