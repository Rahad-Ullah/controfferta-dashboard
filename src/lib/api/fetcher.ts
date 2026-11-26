import { envConfig } from "@/lib/env-config";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type NextFetchOptions = {
  url: string;
  method?: HttpMethod;
  payload?: unknown;
  token?: string;
  headers?: HeadersInit;
  preservePagination?: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  pagination?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly retryAfterSeconds?: number;

  constructor(status: number, message: string, body?: unknown, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;

  const { apiBaseUrl } = envConfig();
  if (!apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required before making an API request."
    );
  }

  return `${apiBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function nextFetch<T>({
  url,
  method = "GET",
  payload,
  token,
  headers,
  preservePagination = false,
}: NextFetchOptions): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const requestHeaders = new Headers(headers);

  if (payload !== undefined && !isFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(url), {
    method,
    credentials: "include",
    headers: requestHeaders,
    body:
      payload === undefined
        ? undefined
        : isFormData
          ? payload
          : JSON.stringify(payload),
  });

  const body = await readBody(response);

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === "string"
        ? body.message
        : `API request failed with status ${response.status}`;

    const retryAfterHeader = Number(response.headers.get("Retry-After"));
    const retryAfterBody =
      isRecord(body) && typeof body.retryAfterSeconds === "number"
        ? body.retryAfterSeconds
        : undefined;

    throw new ApiError(
      response.status,
      message,
      body,
      Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
        ? retryAfterHeader
        : retryAfterBody,
    );
  }

  if (response.status === 204 || body === null) {
    return null as T;
  }

  if (isRecord(body) && "data" in body && "success" in body) {
    if (preservePagination && "pagination" in body) {
      return {
        data: (body as ApiEnvelope<T>).data,
        pagination: (body as ApiEnvelope<T>).pagination,
      } as T;
    }
    return (body as ApiEnvelope<T>).data;
  }

  return body as T;
}

export function swrFetcher<T>(url: string) {
  return nextFetch<T>({ url });
}
