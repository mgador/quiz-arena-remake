export function trackEvent(
  event: string,
  payload: Record<string, string | number | boolean | null | undefined>
) {
  console.info(`[analytics] ${event}`, payload);
}
