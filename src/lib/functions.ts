type FunctionRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
};

type FunctionErrorOptions = {
  status?: number;
  cause?: unknown;
};

const CONFIG_ERROR_MESSAGE =
  "Registration services are not configured. Please contact the programme office.";

export class FunctionsRequestError extends Error {
  status?: number;

  constructor(message: string, options?: FunctionErrorOptions) {
    super(message);
    this.name = "FunctionsRequestError";
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

function getFunctionsConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL?.replace(/\/+$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new FunctionsRequestError(CONFIG_ERROR_MESSAGE);
  }

  return { url, anonKey };
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new FunctionsRequestError("The registration service returned an unreadable response.", {
      status: response.status,
      cause: error,
    });
  }
}

export async function callFunction<T>(path: string, options: FunctionRequestOptions = {}): Promise<T> {
  const { url, anonKey } = getFunctionsConfig();
  const method = options.method ?? "GET";
  const response = await fetch(`${url}/${path.replace(/^\/+/, "")}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Registration service error (${response.status}). Please try again.`;

    throw new FunctionsRequestError(message, { status: response.status });
  }

  return payload as T;
}

export function getFunctionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FunctionsRequestError) {
    return error.message;
  }

  return fallback;
}
