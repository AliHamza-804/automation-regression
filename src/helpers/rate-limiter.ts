/**
 * Sliding-window limiter for outbound API calls. The auth API enforces a cap
 * on requests per minute; retries (captcha OCR failures, afterEach
 * reauthenticate) can otherwise burst past it and get 429'd.
 */
export class RateLimiter {
  private readonly timestamps: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  /** Runs `fn` once a slot within the window is free, serializing callers in call order. */
  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    const wait = (this.queue = this.queue.then(() => this.waitForSlot()));
    await wait;
    return fn();
  }

  private async waitForSlot(): Promise<void> {
    for (;;) {
      const now = Date.now();
      while (this.timestamps.length > 0 && now - this.timestamps[0] >= this.windowMs) {
        this.timestamps.shift();
      }

      if (this.timestamps.length < this.maxRequests) {
        this.timestamps.push(now);
        return;
      }

      const delay = this.windowMs - (now - this.timestamps[0]);
      await sleep(delay);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));
}

/**
 * Retries `fn` on HTTP 429, honoring a `Retry-After` header (seconds or
 * HTTP-date) when the server sends one, else falling back to exponential
 * backoff from `baseDelayMs`.
 */
export async function withRetryOn429<T extends { status(): number; headers(): Record<string, string> }>(
  fn: () => Promise<T>,
  { maxAttempts = 4, baseDelayMs = 1_000 }: { maxAttempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const response = await fn();
    if (response.status() !== 429 || attempt >= maxAttempts) {
      return response;
    }

    const retryAfter = parseRetryAfter(response.headers()['retry-after']);
    await sleep(retryAfter ?? baseDelayMs * 2 ** (attempt - 1));
  }
}

function parseRetryAfter(header: string | undefined): number | undefined {
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1_000;

  const dateMs = Date.parse(header);
  return Number.isFinite(dateMs) ? Math.max(dateMs - Date.now(), 0) : undefined;
}
