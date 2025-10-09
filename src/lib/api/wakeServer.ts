import axiosInstance from "./axios";

export async function wakeServer(): Promise<void> {
  try {
    // Any request will wake the Render dyno; 404s are fine
    await axiosInstance.get("/health", {
      timeout: 8000,
      headers: { "x-wake": "1" },
      // Avoid retries/throttling noise for this best-effort call
      // @ts-expect-error allow custom flag consumed nowhere
      _skipQueue: true,
    });
  } catch {
    // Ignore errors; the goal is just to trigger a cold start
  }
}

export function scheduleServerWake(
  intervalMs: number = 10 * 60 * 1000
): () => void {
  const intervalId = setInterval(() => {
    void wakeServer();
  }, intervalMs);
  return () => clearInterval(intervalId);
}
